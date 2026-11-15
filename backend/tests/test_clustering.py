import numpy as np
from sklearn.datasets import make_blobs
from app.ml.clustering.kmeans import KMeansClusterer
from app.ml.clustering.dbscan import DBSCANClusterer
from app.ml.clustering.agglomerative import AgglomerativeClusterer
from app.ml.clustering.gmm import GMMClusterer
from app.ml.evaluation.metrics import ClusteringEvaluator
from app.ml.visualization.projections import DimensionalityReducer

def test_standard_clusterers():
    X, y = make_blobs(n_samples=60, centers=3, n_features=4, random_state=42)
    
    # 1. KMeans
    km = KMeansClusterer(n_clusters=3, random_state=42)
    labels_km = km.fit_predict(X)
    assert len(labels_km) == 60
    assert len(np.unique(labels_km)) == 3
    
    # 2. Agglomerative
    agg = AgglomerativeClusterer(n_clusters=3, linkage="average", metric="cosine")
    labels_agg = agg.fit_predict(X)
    assert len(labels_agg) == 60
    
    # 3. GMM
    gmm = GMMClusterer(n_components=3, random_state=42)
    labels_gmm = gmm.fit_predict(X)
    assert len(labels_gmm) == 60
    
    # 4. DBSCAN
    dbscan = DBSCANClusterer(eps=1.5, min_samples=3)
    labels_db = dbscan.fit_predict(X)
    assert len(labels_db) == 60

def test_metrics_evaluation():
    X, y = make_blobs(n_samples=50, centers=2, n_features=2, random_state=42)
    eval_res = ClusteringEvaluator.evaluate(X, y, ground_truth=y, execution_time_ms=12.5)
    assert eval_res["clusters_count"] == 2
    assert eval_res["silhouette_score"] is not None
    assert eval_res["silhouette_score"] > 0.4
    assert eval_res["davies_bouldin_index"] is not None
    assert eval_res["adjusted_rand_index"] == 1.0 # Perfect match with ground truth

def test_dimensionality_reducer():
    X, y = make_blobs(n_samples=40, centers=2, n_features=5, random_state=42)
    res = DimensionalityReducer.project_2d(X, y, feature_names=["f1", "f2", "f3", "f4", "f5"])
    assert len(res["pca_2d"]) == 40
    assert "x" in res["pca_2d"][0]
    assert "y" in res["pca_2d"][0]
    assert len(res["explained_variance_ratio"]) == 2
