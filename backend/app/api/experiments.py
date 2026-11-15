import json
import os
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.experiment import Experiment
from app.schemas.experiment import (
    ExperimentRunRequest,
    ExperimentResponse,
    CompareAlgorithmsRequest,
    CompareAlgorithmsResponse
)
from app.services.experiment_service import ExperimentService

router = APIRouter(prefix="/experiments", tags=["Experiments"])

def _format_experiment_response(exp: Experiment) -> dict[str, Any]:
    metrics_data = json.loads(exp.metrics_json) if exp.metrics_json else {}
    vis_data = json.loads(exp.visualizations_json) if exp.visualizations_json else {}
    params_data = json.loads(exp.parameters_json) if exp.parameters_json else {}

    return {
        "id": exp.id,
        "dataset_id": exp.dataset_id,
        "preprocessing_id": exp.preprocessing_id,
        "algorithm_name": exp.algorithm_name,
        "parameters": params_data,
        "status": exp.status,
        "execution_time_ms": exp.execution_time_ms,
        "clusters_count": exp.clusters_count,
        "noise_points": exp.noise_points,
        "metrics": metrics_data,
        "visualizations": vis_data,
        "created_at": exp.created_at.isoformat()
    }

@router.post("/run", response_model=ExperimentResponse)
def run_experiment(request: ExperimentRunRequest, db: Session = Depends(get_db)):
    """Executes a clustering experiment (AEMA or baseline) with full evaluation and visualization."""
    exp = ExperimentService.run_experiment(db, request)
    return _format_experiment_response(exp)

@router.post("/compare", response_model=CompareAlgorithmsResponse)
def compare_algorithms(request: CompareAlgorithmsRequest, db: Session = Depends(get_db)):
    """Runs multiple clustering algorithms under identical conditions and benchmarks performance."""
    return ExperimentService.compare_algorithms(db, request)

@router.get("", response_model=list[ExperimentResponse])
def list_experiments(db: Session = Depends(get_db)):
    """Lists all past experiment runs."""
    experiments = db.query(Experiment).order_by(Experiment.created_at.desc()).all()
    return [_format_experiment_response(e) for e in experiments]

@router.get("/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(experiment_id: str, db: Session = Depends(get_db)):
    """Retrieves full details of a specific experiment."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return _format_experiment_response(exp)

@router.get("/{experiment_id}/results")
def get_experiment_results(experiment_id: str, db: Session = Depends(get_db)):
    """Retrieves experiment evaluation metrics and cluster assignments."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return {
        "experiment_id": exp.id,
        "algorithm": exp.algorithm_name,
        "execution_time_ms": exp.execution_time_ms,
        "metrics": json.loads(exp.metrics_json) if exp.metrics_json else {}
    }

@router.get("/{experiment_id}/visualizations")
def get_experiment_visualizations(experiment_id: str, db: Session = Depends(get_db)):
    """Retrieves 2D PCA, t-SNE, and distribution data for interactive charting."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return json.loads(exp.visualizations_json) if exp.visualizations_json else {}

@router.get("/{experiment_id}/report")
def download_pdf_report(experiment_id: str, db: Session = Depends(get_db)):
    """Generates and downloads a publication-grade PDF report."""
    pdf_path = ExperimentService.generate_pdf_report(db, experiment_id)
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="Failed to generate PDF report.")
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"AEMA_Report_{experiment_id[:8]}.pdf"
    )

@router.get("/{experiment_id}/download-csv")
def download_results_csv(experiment_id: str, db: Session = Depends(get_db)):
    """Downloads CSV containing cluster assignments and original features."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp or not exp.result_file_path or not os.path.exists(exp.result_file_path):
        raise HTTPException(status_code=404, detail="Result dataset CSV file not found.")
    return FileResponse(
        path=exp.result_file_path,
        media_type="text/csv",
        filename=f"AEMA_Clustered_{exp.dataset.original_name}.csv"
    )

@router.delete("/{experiment_id}")
def delete_experiment(experiment_id: str, db: Session = Depends(get_db)):
    """Deletes an experiment record and its associated result files."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    if exp.result_file_path and os.path.exists(exp.result_file_path):
        try:
            os.remove(exp.result_file_path)
        except Exception:
            pass
    db.delete(exp)
    db.commit()
    return {"message": "Experiment deleted successfully.", "id": experiment_id}
