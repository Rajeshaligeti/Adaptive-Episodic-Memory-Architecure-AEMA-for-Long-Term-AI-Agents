from abc import ABC, abstractmethod
import numpy as np

class BaseClusterer(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        """Fits the model and returns 1D array of cluster labels."""
        pass
