import numpy as np
from sklearn.datasets import make_blobs
from app.ml.ensemble.aema import AEMAClusterer

def test_aema_clustering_pipeline():
    X, _ = make_blobs(n_samples=80, centers=3, n_features=4, random_state=42)
    aema = AEMAClusterer(
        n_clusters=3,
        ensemble_size=5,
        adaptive_weighting=True,
        weight_recency=0.40,
        weight_frequency=0.30,
        weight_cluster=0.30,
        archival_threshold=0.25,
        random_state=42
    )
    labels = aema.fit_predict(X)
    assert len(labels) == 80
    assert len(aema.diagnostics_["ensemble_partitions"]) == 5
    assert "average_sample_score" in aema.diagnostics_
    assert aema.diagnostics_["weights"]["w_recency"] == 0.40
    # Cluster labels should contain target clusters or noise points
    non_noise = labels[labels != -1]
    assert len(np.unique(non_noise)) >= 2

def test_aema_adaptive_weighting_vs_uniform():
    X, _ = make_blobs(n_samples=60, centers=2, n_features=3, random_state=42)
    aema_adaptive = AEMAClusterer(n_clusters=2, ensemble_size=4, adaptive_weighting=True, random_state=42)
    aema_uniform = AEMAClusterer(n_clusters=2, ensemble_size=4, adaptive_weighting=False, random_state=42)
    
    lbls_ad = aema_adaptive.fit_predict(X)
    lbls_un = aema_uniform.fit_predict(X)
    
    weights_ad = [p["weight"] for p in aema_adaptive.diagnostics_["ensemble_partitions"]]
    weights_un = [p["weight"] for p in aema_uniform.diagnostics_["ensemble_partitions"]]
    
    assert len(weights_ad) == 4
    # Uniform weights are equal (0.25 each)
    for w in weights_un:
        assert abs(w - 0.25) < 1e-3
