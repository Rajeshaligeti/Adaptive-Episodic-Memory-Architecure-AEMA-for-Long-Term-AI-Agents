import numpy as np
from sklearn.cluster import KMeans
from app.ml.clustering.base import BaseClusterer

class KMeansClusterer(BaseClusterer):
    def __init__(self, n_clusters: int = 3, init: str = "k-means++", max_iter: int = 300, random_state: int = 42):
        super().__init__("K-Means")
        self.n_clusters = n_clusters
        self.init = init
        self.max_iter = max_iter
        self.random_state = random_state

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        # Protect against requesting more clusters than samples
        effective_k = min(self.n_clusters, len(X))
        if effective_k < 1:
            return np.zeros(len(X), dtype=int)
        model = KMeans(
            n_clusters=effective_k,
            init=self.init,
            max_iter=self.max_iter,
            random_state=self.random_state,
            n_init=10
        )
        return model.fit_predict(X)
