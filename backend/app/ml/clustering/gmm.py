import numpy as np
from sklearn.mixture import GaussianMixture
from app.ml.clustering.base import BaseClusterer

class GMMClusterer(BaseClusterer):
    def __init__(self, n_components: int = 3, covariance_type: str = "full", random_state: int = 42):
        super().__init__("GMM")
        self.n_components = n_components
        self.covariance_type = covariance_type
        self.random_state = random_state

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        effective_k = min(self.n_components, len(X))
        if effective_k < 1:
            return np.zeros(len(X), dtype=int)
        try:
            model = GaussianMixture(
                n_components=effective_k,
                covariance_type=self.covariance_type,
                random_state=self.random_state,
                max_iter=150,
                reg_covar=1e-5
            )
            return model.fit_predict(X)
        except Exception:
            # Fallback to diag covariance if full fails (e.g. singular matrix)
            model = GaussianMixture(
                n_components=effective_k,
                covariance_type="diag",
                random_state=self.random_state
            )
            return model.fit_predict(X)
