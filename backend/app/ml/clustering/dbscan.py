import numpy as np
from sklearn.cluster import DBSCAN
from app.ml.clustering.base import BaseClusterer

class DBSCANClusterer(BaseClusterer):
    def __init__(self, eps: float = 0.5, min_samples: int = 5, metric: str = "euclidean"):
        super().__init__("DBSCAN")
        self.eps = eps
        self.min_samples = min_samples
        self.metric = metric

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        if len(X) == 0:
            return np.array([], dtype=int)
        model = DBSCAN(
            eps=self.eps,
            min_samples=min_samples if (min_samples := min(self.min_samples, len(X))) > 0 else 1,
            metric=self.metric
        )
        return model.fit_predict(X)
