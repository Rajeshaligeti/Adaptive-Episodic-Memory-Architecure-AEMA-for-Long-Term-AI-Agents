import numpy as np
from typing import Any
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

class DimensionalityReducer:
    @staticmethod
    def project_2d(
        X: np.ndarray,
        labels: np.ndarray,
        feature_names: list[str] = None,
        max_samples_tsne: int = 400
    ) -> dict[str, Any]:
        """
        Computes 2D PCA and optional t-SNE projections from real transformed features and actual cluster labels.
        """
        n_samples, n_features = X.shape
        
        # 1. PCA 2D
        n_components = min(2, n_features, n_samples)
        if n_components < 2:
            # Pad with zeros if 1 feature
            pca_data = np.zeros((n_samples, 2))
            pca_data[:, 0] = X[:, 0] if n_features > 0 else 0
            exp_var = [1.0, 0.0]
        else:
            pca = PCA(n_components=2, random_state=42)
            pca_transformed = pca.fit_transform(X)
            pca_data = pca_transformed
            exp_var = [round(float(v), 4) for v in pca.explained_variance_ratio_]
            
        pca_points = []
        for i in range(n_samples):
            pca_points.append({
                "id": i,
                "x": round(float(pca_data[i, 0]), 4),
                "y": round(float(pca_data[i, 1]), 4),
                "cluster": int(labels[i])
            })
            
        # 2. t-SNE 2D (performed on subsample if dataset is large for real-time speed)
        tsne_points = []
        if n_samples >= 10:
            try:
                sub_indices = np.arange(n_samples)
                if n_samples > max_samples_tsne:
                    np.random.seed(42)
                    sub_indices = np.random.choice(n_samples, max_samples_tsne, replace=False)
                    
                X_sub = X[sub_indices]
                lbl_sub = labels[sub_indices]
                
                perplexity = min(30, max(5, len(sub_indices) // 5))
                tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42, max_iter=300)
                tsne_transformed = tsne.fit_transform(X_sub)
                
                for idx, orig_idx in enumerate(sub_indices):
                    tsne_points.append({
                        "id": int(orig_idx),
                        "x": round(float(tsne_transformed[idx, 0]), 4),
                        "y": round(float(tsne_transformed[idx, 1]), 4),
                        "cluster": int(lbl_sub[idx])
                    })
            except Exception:
                tsne_points = None
        else:
            tsne_points = None
            
        # 3. Feature importance proxy via PCA component loadings
        feature_importance = {}
        if feature_names and len(feature_names) == n_features and n_components >= 1:
            try:
                pca_comp = PCA(n_components=min(3, n_features), random_state=42).fit(X)
                # Compute magnitude across first few principal components
                loadings = np.sum(np.abs(pca_comp.components_), axis=0)
                # Normalize to sum to 100%
                loadings_norm = (loadings / np.sum(loadings)) * 100
                for fn, imp in zip(feature_names, loadings_norm):
                    feature_importance[fn] = round(float(imp), 2)
            except Exception:
                pass
                
        return {
            "pca_2d": pca_points,
            "tsne_2d": tsne_points,
            "explained_variance_ratio": exp_var,
            "feature_importance_proxy": feature_importance
        }
