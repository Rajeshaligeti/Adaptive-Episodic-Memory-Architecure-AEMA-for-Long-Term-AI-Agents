import numpy as np
from sklearn.cluster import AgglomerativeClustering
from app.ml.clustering.base import BaseClusterer

class AgglomerativeClusterer(BaseClusterer):
    def __init__(self, n_clusters: int = 3, linkage: str = "average", metric: str = "cosine"):
        super().__init__("Agglomerative")
        self.n_clusters = n_clusters
        self.linkage = linkage
        self.metric = metric

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        effective_k = min(self.n_clusters, len(X))
        if effective_k < 1:
            return np.zeros(len(X), dtype=int)
            
        # Ward linkage requires euclidean metric
        metric_used = "euclidean" if self.linkage == "ward" else self.metric
        
        # If metric is cosine and there are zero-vectors, handle or fallback
        if metric_used == "cosine":
            norms = np.linalg.norm(X, axis=1)
            if np.any(norms == 0):
                # Fallback to euclidean for safety
                metric_used = "euclidean"
                
        try:
            model = AgglomerativeClustering(
                n_clusters=effective_k,
                linkage=self.linkage,
                metric=metric_used
            )
            return model.fit_predict(X)
        except Exception:
            # Fallback to euclidean average linkage if numerical issue occurs
            model = AgglomerativeClustering(
                n_clusters=effective_k,
                linkage="average",
                metric="euclidean"
            )
            return model.fit_predict(X)
