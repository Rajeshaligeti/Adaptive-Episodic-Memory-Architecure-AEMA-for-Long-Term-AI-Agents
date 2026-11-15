import json
import time
import uuid
from pathlib import Path
from typing import Any, Optional, Tuple
import numpy as np
import pandas as pd
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.dataset import Dataset, PreprocessingRun
from app.models.experiment import Experiment
from app.schemas.preprocessing import PreprocessRequest
from app.schemas.experiment import (
    ExperimentRunRequest,
    CompareAlgorithmsRequest,
    AEMAConfig,
    KMeansConfig,
    DBSCANConfig,
    AgglomerativeConfig,
    GMMConfig
)
from app.ml.preprocessing.pipeline import PreprocessingPipeline
from app.ml.clustering.kmeans import KMeansClusterer
from app.ml.clustering.dbscan import DBSCANClusterer
from app.ml.clustering.agglomerative import AgglomerativeClusterer
from app.ml.clustering.gmm import GMMClusterer
from app.ml.ensemble.aema import AEMAClusterer
from app.ml.evaluation.metrics import ClusteringEvaluator
from app.ml.visualization.projections import DimensionalityReducer
from app.reports.pdf_generator import ReportGenerator

class ExperimentService:
    @classmethod
    def preprocess_dataset(
        cls,
        db: Session,
        dataset: Dataset,
        config: PreprocessRequest
    ) -> PreprocessingRun:
        """Preprocesses dataset and persists transformed matrix and metadata."""
        ext = Path(dataset.file_path).suffix.lower()
        if ext == ".csv":
            try:
                df = pd.read_csv(dataset.file_path)
            except UnicodeDecodeError:
                df = pd.read_csv(dataset.file_path, encoding="latin1")
        else:
            df = pd.read_excel(dataset.file_path)

        pipeline = PreprocessingPipeline(
            handle_missing=config.handle_missing,
            remove_duplicates=config.remove_duplicates,
            selected_features=config.selected_features,
            target_column=config.target_column,
            categorical_encoding=config.categorical_encoding,
            scaling_method=config.scaling_method
        )

        try:
            X, feature_names, report, cleaned_df = pipeline.fit_transform(df)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Preprocessing error: {str(e)}")

        # Save cleaned dataset file
        run_id = str(uuid.uuid4())
        out_filename = f"preprocessed_{run_id}_{dataset.filename}"
        out_path = settings.UPLOAD_DIR / out_filename
        cleaned_df.to_csv(out_path, index=False)

        run = PreprocessingRun(
            id=run_id,
            dataset_id=dataset.id,
            operations_json=json.dumps(config.dict()),
            features_in=report["features_in"],
            features_out=report["features_out"],
            rows_before=report["rows_before"],
            rows_after=report["rows_after"],
            output_file_path=str(out_path)
        )
        db.add(run)
        db.commit()
        db.refresh(run)
        return run

    @classmethod
    def _get_clustering_data(
        cls,
        db: Session,
        dataset_id: str,
        preprocessing_id: Optional[str]
    ) -> Tuple[np.ndarray, list[str], Optional[np.ndarray], Dataset]:
        """Retrieves and prepares numeric matrix for clustering."""
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found.")

        if preprocessing_id:
            prep = db.query(PreprocessingRun).filter(PreprocessingRun.id == preprocessing_id).first()
            if not prep:
                raise HTTPException(status_code=404, detail="Preprocessing run not found.")
            clean_df = pd.read_csv(prep.output_file_path)
        else:
            # Auto-preprocess with sensible defaults if no prior preprocessing run specified
            auto_prep = cls.preprocess_dataset(db, dataset, PreprocessRequest())
            clean_df = pd.read_csv(auto_prep.output_file_path)

        ground_truth = None
        if "_ground_truth" in clean_df.columns:
            ground_truth = clean_df["_ground_truth"].values
            feature_df = clean_df.drop(columns=["_ground_truth"])
        else:
            feature_df = clean_df

        feature_names = list(feature_df.columns)
        X = feature_df.values.astype(float)
        return X, feature_names, ground_truth, dataset

    @classmethod
    def run_experiment(
        cls,
        db: Session,
        request: ExperimentRunRequest
    ) -> Experiment:
        """Executes a single clustering algorithm run, calculates metrics, projections, and saves results."""
        X, feature_names, ground_truth, dataset = cls._get_clustering_data(
            db, request.dataset_id, request.preprocessing_id
        )

        algo_name = request.algorithm
        t0 = time.perf_counter()

        params = {}
        if algo_name == "AEMA":
            cfg = request.aema_config or AEMAConfig()
            params = cfg.dict()
            clusterer = AEMAClusterer(
                n_clusters=cfg.n_clusters,
                ensemble_size=cfg.ensemble_size,
                adaptive_weighting=cfg.adaptive_weighting,
                quality_metric=cfg.quality_metric,
                weight_recency=cfg.weight_recency,
                weight_frequency=cfg.weight_frequency,
                weight_cluster=cfg.weight_cluster,
                archival_threshold=cfg.archival_threshold,
                consensus_linkage=cfg.consensus_linkage,
                random_state=cfg.random_state
            )
        elif algo_name == "K-Means":
            cfg = request.kmeans_config or KMeansConfig()
            params = cfg.dict()
            clusterer = KMeansClusterer(
                n_clusters=cfg.n_clusters,
                init=cfg.init,
                max_iter=cfg.max_iter,
                random_state=cfg.random_state
            )
        elif algo_name == "DBSCAN":
            cfg = request.dbscan_config or DBSCANConfig()
            params = cfg.dict()
            clusterer = DBSCANClusterer(
                eps=cfg.eps,
                min_samples=cfg.min_samples,
                metric=cfg.metric
            )
        elif algo_name == "Agglomerative":
            cfg = request.agglomerative_config or AgglomerativeConfig()
            params = cfg.dict()
            clusterer = AgglomerativeClusterer(
                n_clusters=cfg.n_clusters,
                linkage=cfg.linkage,
                metric=cfg.metric
            )
        elif algo_name == "GMM":
            cfg = request.gmm_config or GMMConfig()
            params = cfg.dict()
            clusterer = GMMClusterer(
                n_components=cfg.n_components,
                covariance_type=cfg.covariance_type,
                random_state=cfg.random_state
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported algorithm: {algo_name}")

        try:
            labels = clusterer.fit_predict(X)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Clustering execution error: {str(e)}")

        execution_time_ms = (time.perf_counter() - t0) * 1000.0

        # Evaluate metrics
        metrics = ClusteringEvaluator.evaluate(
            X=X,
            labels=labels,
            ground_truth=ground_truth,
            execution_time_ms=execution_time_ms
        )

        # Compute 2D projections (PCA + t-SNE)
        visualizations = DimensionalityReducer.project_2d(
            X=X,
            labels=labels,
            feature_names=feature_names
        )
        visualizations["cluster_distribution"] = metrics["cluster_distribution"]

        # Export result CSV with cluster labels
        exp_id = str(uuid.uuid4())
        res_df = pd.DataFrame(X, columns=feature_names)
        res_df["cluster_label"] = labels
        if ground_truth is not None:
            res_df["ground_truth"] = ground_truth

        result_filename = f"results_{exp_id}_{dataset.filename}"
        result_path = settings.UPLOAD_DIR / result_filename
        res_df.to_csv(result_path, index=False)

        # Store in database
        experiment = Experiment(
            id=exp_id,
            dataset_id=dataset.id,
            preprocessing_id=request.preprocessing_id,
            algorithm_name=algo_name,
            parameters_json=json.dumps(params),
            status="COMPLETED",
            execution_time_ms=execution_time_ms,
            clusters_count=metrics["clusters_count"],
            noise_points=metrics["noise_points"],
            metrics_json=json.dumps(metrics),
            visualizations_json=json.dumps(visualizations),
            result_file_path=str(result_path)
        )
        db.add(experiment)
        db.commit()
        db.refresh(experiment)
        return experiment

    @classmethod
    def compare_algorithms(
        cls,
        db: Session,
        request: CompareAlgorithmsRequest
    ) -> dict[str, Any]:
        """Runs multiple clustering algorithms under identical data preprocessing and returns comprehensive comparison."""
        X, feature_names, ground_truth, dataset = cls._get_clustering_data(
            db, request.dataset_id, request.preprocessing_id
        )

        comparison_table = []
        target_k = request.target_clusters
        seed = request.random_state

        algos_to_run = request.algorithms
        aema_summary = {}

        for algo in algos_to_run:
            t0 = time.perf_counter()
            error_msg = None
            labels = None
            try:
                if algo == "AEMA":
                    cl = AEMAClusterer(
                        n_clusters=target_k,
                        ensemble_size=7,
                        adaptive_weighting=True,
                        random_state=seed
                    )
                    labels = cl.fit_predict(X)
                    aema_summary = cl.diagnostics_
                elif algo == "K-Means":
                    cl = KMeansClusterer(n_clusters=target_k, random_state=seed)
                    labels = cl.fit_predict(X)
                elif algo == "DBSCAN":
                    # Adapt eps to data scale
                    cl = DBSCANClusterer(eps=0.5, min_samples=5)
                    labels = cl.fit_predict(X)
                elif algo == "Agglomerative":
                    cl = AgglomerativeClusterer(n_clusters=target_k, linkage="average", metric="cosine")
                    labels = cl.fit_predict(X)
                elif algo == "GMM":
                    cl = GMMClusterer(n_components=target_k, random_state=seed)
                    labels = cl.fit_predict(X)
            except Exception as e:
                error_msg = str(e)

            elapsed_ms = (time.perf_counter() - t0) * 1000.0

            if labels is not None:
                m = ClusteringEvaluator.evaluate(
                    X=X,
                    labels=labels,
                    ground_truth=ground_truth,
                    execution_time_ms=elapsed_ms
                )
                comparison_table.append({
                    "algorithm": algo,
                    "clusters_count": m["clusters_count"],
                    "noise_points": m["noise_points"],
                    "execution_time_ms": round(elapsed_ms, 2),
                    "silhouette_score": m["silhouette_score"],
                    "davies_bouldin_index": m["davies_bouldin_index"],
                    "calinski_harabasz_index": m["calinski_harabasz_index"],
                    "adjusted_rand_index": m["adjusted_rand_index"],
                    "status": "COMPLETED",
                    "error": None
                })
            else:
                comparison_table.append({
                    "algorithm": algo,
                    "clusters_count": 0,
                    "noise_points": 0,
                    "execution_time_ms": round(elapsed_ms, 2),
                    "silhouette_score": None,
                    "davies_bouldin_index": None,
                    "calinski_harabasz_index": None,
                    "adjusted_rand_index": None,
                    "status": "FAILED",
                    "error": error_msg
                })

        # Determine best performing algorithm per metric
        valid_sil = [x for x in comparison_table if x["silhouette_score"] is not None]
        best_sil = max(valid_sil, key=lambda x: x["silhouette_score"])["algorithm"] if valid_sil else None

        valid_db = [x for x in comparison_table if x["davies_bouldin_index"] is not None]
        best_db = min(valid_db, key=lambda x: x["davies_bouldin_index"])["algorithm"] if valid_db else None

        valid_ch = [x for x in comparison_table if x["calinski_harabasz_index"] is not None]
        best_ch = max(valid_ch, key=lambda x: x["calinski_harabasz_index"])["algorithm"] if valid_ch else None

        return {
            "dataset_id": dataset.id,
            "target_clusters": target_k,
            "comparison_table": comparison_table,
            "best_by_silhouette": best_sil,
            "best_by_davies_bouldin": best_db,
            "best_by_calinski_harabasz": best_ch,
            "aema_summary": aema_summary
        }

    @classmethod
    def generate_pdf_report(cls, db: Session, experiment_id: str) -> str:
        """Generates PDF report for an experiment and returns file path."""
        experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found.")

        dataset = experiment.dataset
        dataset_data = {
            "original_name": dataset.original_name,
            "row_count": dataset.row_count,
            "column_count": dataset.column_count
        }

        experiment_data = {
            "id": experiment.id,
            "algorithm_name": experiment.algorithm_name,
            "created_at": experiment.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "metrics": json.loads(experiment.metrics_json) if experiment.metrics_json else {}
        }

        pdf_filename = f"report_{experiment.id}.pdf"
        pdf_path = settings.UPLOAD_DIR / pdf_filename

        ReportGenerator.generate_experiment_report(
            experiment_data=experiment_data,
            dataset_data=dataset_data,
            output_path=str(pdf_path)
        )

        return str(pdf_path)
