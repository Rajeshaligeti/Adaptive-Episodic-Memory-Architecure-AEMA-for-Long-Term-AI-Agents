import numpy as np
from typing import Optional
from sklearn.metrics import (
    silhouette_score,
    davies_bouldin_score,
    calinski_harabasz_score,
    adjusted_rand_score,
    normalized_mutual_info_score
)

class ClusteringEvaluator:
    @staticmethod
    def evaluate(
        X: np.ndarray,
        labels: np.ndarray,
        ground_truth: Optional[np.ndarray] = None,
        execution_time_ms: float = 0.0
    ) -> dict:
        """
        Evaluates clustering results using standard unsupervised indices and supervised metrics (if ground truth available).
        Handles edge cases gracefully (single cluster, all noise points, empty clusters).
        """
        unique_labels = np.unique(labels)
        is_noise = (labels == -1)
        noise_points = int(np.sum(is_noise))
        non_noise_mask = ~is_noise
        non_noise_labels = labels[non_noise_mask]
        
        clusters_count = len(np.unique(non_noise_labels))
        total_points = len(labels)
        noise_ratio = float(noise_points / total_points) if total_points > 0 else 0.0
        
        # Calculate cluster sizes
        distribution = []
        for cl in unique_labels:
            cnt = int(np.sum(labels == cl))
            distribution.append({
                "cluster": int(cl),
                "label": "Noise" if cl == -1 else f"Cluster {cl}",
                "count": cnt,
                "percentage": round((cnt / total_points) * 100, 2) if total_points > 0 else 0.0
            })
            
        # Metric calculations (require at least 2 clusters and more non-noise samples than clusters)
        sil_score = None
        db_score = None
        ch_score = None
        
        if clusters_count >= 2 and np.sum(non_noise_mask) > clusters_count:
            try:
                # Use non-noise points for silhouette
                X_eval = X[non_noise_mask]
                lbl_eval = non_noise_labels
                
                # Check if sample size is large, sub-sample for fast silhouette calculation
                sample_size = min(len(X_eval), 1000)
                sil_score = float(silhouette_score(X_eval, lbl_eval, sample_size=sample_size, random_state=42))
            except Exception:
                sil_score = None
                
            try:
                db_score = float(davies_bouldin_score(X[non_noise_mask], non_noise_labels))
            except Exception:
                db_score = None
                
            try:
                ch_score = float(calinski_harabasz_score(X[non_noise_mask], non_noise_labels))
            except Exception:
                ch_score = None
                
        # Ground truth comparison if provided
        ari = None
        nmi = None
        if ground_truth is not None and len(ground_truth) == len(labels):
            try:
                ari = float(adjusted_rand_score(ground_truth, labels))
                nmi = float(normalized_mutual_info_score(ground_truth, labels))
            except Exception:
                pass
                
        return {
            "silhouette_score": round(sil_score, 4) if sil_score is not None else None,
            "davies_bouldin_index": round(db_score, 4) if db_score is not None else None,
            "calinski_harabasz_index": round(ch_score, 2) if ch_score is not None else None,
            "clusters_count": clusters_count,
            "noise_points": noise_points,
            "noise_ratio": round(noise_ratio, 4),
            "execution_time_ms": round(execution_time_ms, 2),
            "adjusted_rand_index": round(ari, 4) if ari is not None else None,
            "normalized_mutual_info": round(nmi, 4) if nmi is not None else None,
            "cluster_distribution": distribution
        }
