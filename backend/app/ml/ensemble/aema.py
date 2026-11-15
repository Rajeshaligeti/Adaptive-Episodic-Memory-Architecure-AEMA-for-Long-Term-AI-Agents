import time
import numpy as np
from typing import Any, Tuple, Optional
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
from sklearn.metrics.pairwise import cosine_distances, euclidean_distances
from sklearn.neighbors import NearestNeighbors
from app.ml.clustering.base import BaseClusterer

class AEMAClusterer(BaseClusterer):
    """
    Adaptive Ensemble-based Machine Learning Approach (AEMA) for Clustering.
    Grounding:
      1. Agglomerative average-linkage hierarchical clustering with cosine/euclidean distance
         (as verified in BVRIT AEMA paper, ICSCNA 2026).
      2. Adaptive Quality Weighting: Dynamic ensemble weighting based on internal validation indices
         (Silhouette, Davies-Bouldin, Calinski-Harabasz).
      3. Consensus Co-association Matrix: Pairwise probabilistic consensus aggregation.
      4. Adaptive Sample Scoring & Archival: Evaluates sample confidence using the paper's formula:
         Score(x_i) = w_r * R_i + w_f * F_i + w_c * C_i
         Points falling below archival threshold tau are archived / flagged as noise.
    """
    def __init__(
        self,
        n_clusters: int = 3,
        ensemble_size: int = 7,
        adaptive_weighting: bool = True,
        quality_metric: str = "composite",
        weight_recency: float = 0.40,      # w_r (density / recency proxy)
        weight_frequency: float = 0.30,    # w_f (consensus agreement frequency)
        weight_cluster: float = 0.30,      # w_c (cluster coherence / size proxy)
        archival_threshold: float = 0.30,  # tau (archival threshold from paper)
        consensus_linkage: str = "average",
        random_state: int = 42
    ):
        super().__init__("AEMA")
        self.n_clusters = n_clusters
        self.ensemble_size = ensemble_size
        self.adaptive_weighting = adaptive_weighting
        self.quality_metric = quality_metric
        
        # Normalize weights to ensure sum = 1.0 (Eq. 6 from paper)
        total_w = weight_recency + weight_frequency + weight_cluster
        if total_w > 0:
            self.w_r = weight_recency / total_w
            self.w_f = weight_frequency / total_w
            self.w_c = weight_cluster / total_w
        else:
            self.w_r, self.w_f, self.w_c = 0.40, 0.30, 0.30
            
        self.archival_threshold = archival_threshold
        self.consensus_linkage = consensus_linkage
        self.random_state = random_state
        
        # Diagnostic tracking
        self.diagnostics_ = {}

    def _generate_base_partitions(self, X: np.ndarray) -> list[dict[str, Any]]:
        """Generates diverse base clustering partitions across varied algorithms and configurations."""
        n_samples = len(X)
        k_target = min(self.n_clusters, n_samples)
        partitions = []
        rng = np.random.RandomState(self.random_state)
        
        # Candidate k variations
        k_variants = [k_target]
        if k_target > 2:
            k_variants.append(k_target - 1)
        if k_target + 1 <= min(15, n_samples - 1):
            k_variants.append(k_target + 1)
            
        counter = 0
        while len(partitions) < self.ensemble_size:
            curr_k = k_variants[counter % len(k_variants)]
            variant_seed = self.random_state + counter * 17
            
            # 1. Agglomerative with average linkage and cosine metric (Core AEMA paper component)
            if counter % 4 == 0:
                try:
                    norms = np.linalg.norm(X, axis=1)
                    metric = "cosine" if not np.any(norms == 0) else "euclidean"
                    model = AgglomerativeClustering(n_clusters=curr_k, linkage="average", metric=metric)
                    labels = model.fit_predict(X)
                    partitions.append({
                        "name": f"Agglomerative-Avg-{metric}-{curr_k}",
                        "labels": labels,
                        "k": curr_k
                    })
                except Exception:
                    pass
                    
            # 2. Agglomerative with Ward / Complete linkage
            elif counter % 4 == 1:
                try:
                    linkage = "ward" if counter % 2 == 1 else "complete"
                    model = AgglomerativeClustering(n_clusters=curr_k, linkage=linkage)
                    labels = model.fit_predict(X)
                    partitions.append({
                        "name": f"Agglomerative-{linkage}-euclidean-{curr_k}",
                        "labels": labels,
                        "k": curr_k
                    })
                except Exception:
                    pass
                    
            # 3. K-Means with varied initializations
            elif counter % 4 == 2:
                try:
                    init_mode = "k-means++" if counter % 3 != 0 else "random"
                    model = KMeans(n_clusters=curr_k, init=init_mode, random_state=variant_seed, n_init=5)
                    labels = model.fit_predict(X)
                    partitions.append({
                        "name": f"KMeans-{init_mode}-{curr_k}-s{variant_seed}",
                        "labels": labels,
                        "k": curr_k
                    })
                except Exception:
                    pass
                    
            # 4. Gaussian Mixture Model
            else:
                try:
                    cov_type = "diag" if counter % 2 == 0 else "full"
                    model = GaussianMixture(n_components=curr_k, covariance_type=cov_type, random_state=variant_seed, max_iter=80)
                    labels = model.fit_predict(X)
                    partitions.append({
                        "name": f"GMM-{cov_type}-{curr_k}",
                        "labels": labels,
                        "k": curr_k
                    })
                except Exception:
                    pass
                    
            counter += 1
            if counter > self.ensemble_size * 5:
                # Break to prevent infinite loop if small data
                break
                
        return partitions

    def _compute_adaptive_weights(self, X: np.ndarray, partitions: list[dict[str, Any]]) -> np.ndarray:
        """Calculates adaptive weights based on internal validation indices."""
        M = len(partitions)
        if M == 0:
            return np.array([])
        if not self.adaptive_weighting:
            return np.ones(M) / M
            
        qualities = []
        for p in partitions:
            lbls = p["labels"]
            unique_k = len(np.unique(lbls))
            if unique_k < 2 or unique_k >= len(X):
                qualities.append(0.0)
                continue
                
            try:
                # Sub-sample for fast silhouette computation on large datasets
                sample_sz = min(len(X), 800)
                sil = silhouette_score(X, lbls, sample_size=sample_sz, random_state=42)
            except Exception:
                sil = 0.0
                
            try:
                db = davies_bouldin_score(X, lbls)
                db_inv = 1.0 / (1.0 + max(0.0, db))
            except Exception:
                db_inv = 0.5
                
            try:
                ch = calinski_harabasz_score(X, lbls)
                ch_norm = np.log1p(max(0.0, ch)) / 10.0
            except Exception:
                ch_norm = 0.5
                
            if self.quality_metric == "silhouette":
                q = max(0.01, (sil + 1.0) / 2.0)
            elif self.quality_metric == "calinski_harabasz":
                q = max(0.01, ch_norm)
            else:
                # Composite quality index
                q = max(0.01, 0.5 * ((sil + 1.0) / 2.0) + 0.25 * db_inv + 0.25 * ch_norm)
                
            qualities.append(q)
            
        q_arr = np.array(qualities, dtype=float)
        # Softmax scaling with temperature
        exp_q = np.exp(q_arr * 2.0)
        sum_exp = np.sum(exp_q)
        weights = exp_q / sum_exp if sum_exp > 0 else np.ones(M) / M
        return weights

    def _build_coassociation_matrix(self, n_samples: int, partitions: list[dict[str, Any]], weights: np.ndarray) -> np.ndarray:
        """Builds weighted co-association matrix C: C_ij = sum_m w_m * I(c_i^(m) == c_j^(m))."""
        C = np.zeros((n_samples, n_samples), dtype=float)
        for p, w in zip(partitions, weights):
            lbls = p["labels"]
            # Fast vectorized equality outer product
            same_cluster = (lbls[:, None] == lbls[None, :])
            C += w * same_cluster.astype(float)
            
        # Ensure diagonal is exactly 1.0
        np.fill_diagonal(C, 1.0)
        return C

    def _calculate_sample_adaptive_scores(
        self,
        X: np.ndarray,
        labels: np.ndarray,
        C: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Calculates adaptive sample score:
        Score(x_i) = w_r * R_i + w_f * F_i + w_c * C_i  (Equation 6 from AEMA Paper)
        where:
          R_i: Density / Recency proxy (inverse distance to k-th nearest neighbor)
          F_i: Co-association consensus frequency with assigned cluster members
          C_i: Cluster coherence and normalized size proxy
        """
        n_samples = len(X)
        
        # 1. R_i: Density / Recency proxy
        n_neighbors = min(10, max(2, n_samples // 10))
        nn = NearestNeighbors(n_neighbors=n_neighbors)
        nn.fit(X)
        distances, _ = nn.kneighbors(X)
        # Average distance to local neighbors
        avg_dist = np.mean(distances, axis=1)
        max_dist = np.max(avg_dist) if np.max(avg_dist) > 0 else 1.0
        # Inverted normalized distance: denser / more recent points score higher
        R = 1.0 - (avg_dist / max_dist)
        R = np.clip(R, 0.0, 1.0)
        
        # 2. F_i: Consensus agreement frequency with points in same consensus cluster
        F = np.zeros(n_samples)
        for i in range(n_samples):
            cl = labels[i]
            same_mask = (labels == cl)
            if np.sum(same_mask) > 1:
                # Average co-association with other members in cluster
                F[i] = (np.sum(C[i, same_mask]) - 1.0) / (np.sum(same_mask) - 1.0)
            else:
                F[i] = 0.5
        F = np.clip(F, 0.0, 1.0)
        
        # 3. C_i: Cluster size and coherence proxy
        unique_cls, counts = np.unique(labels, return_counts=True)
        size_map = dict(zip(unique_cls, counts))
        sizes = np.array([size_map[cl] for cl in labels], dtype=float)
        min_sz, max_sz = np.min(sizes), np.max(sizes)
        if max_sz > min_sz:
            C_norm = (sizes - min_sz) / (max_sz - min_sz)
        else:
            C_norm = np.ones(n_samples) * 0.5
            
        scores = self.w_r * R + self.w_f * F + self.w_c * C_norm
        return scores, R, F, C_norm

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        """Executes full AEMA clustering pipeline."""
        n_samples = len(X)
        if n_samples < 2:
            return np.zeros(n_samples, dtype=int)
            
        t0 = time.perf_counter()
        
        # Phase 1: Base Partitions
        partitions = self._generate_base_partitions(X)
        if not partitions:
            # Fallback
            return AgglomerativeClustering(n_clusters=min(self.n_clusters, n_samples)).fit_predict(X)
            
        # Phase 2: Adaptive Quality Weighting
        weights = self._compute_adaptive_weights(X, partitions)
        
        # Phase 3: Consensus Co-association Matrix
        C = self._build_coassociation_matrix(n_samples, partitions, weights)
        
        # Phase 4: Consensus Dissimilarity & Hierarchical Partitioning
        # D = 1 - C
        D = np.clip(1.0 - C, 0.0, 1.0)
        
        effective_k = min(self.n_clusters, n_samples)
        try:
            consensus_clusterer = AgglomerativeClustering(
                n_clusters=effective_k,
                linkage=self.consensus_linkage,
                metric="precomputed"
            )
            raw_labels = consensus_clusterer.fit_predict(D)
        except Exception:
            # Fallback to Euclidean on C
            consensus_clusterer = AgglomerativeClustering(
                n_clusters=effective_k,
                linkage="average"
            )
            raw_labels = consensus_clusterer.fit_predict(C)
            
        # Phase 5: Adaptive Scoring & Strategic Forgetting / Archival (Eq. 6 & 7 from paper)
        scores, R, F, C_norm = self._calculate_sample_adaptive_scores(X, raw_labels, C)
        
        # Archival mask (outliers below threshold tau)
        archived_mask = (scores < self.archival_threshold)
        
        final_labels = raw_labels.copy()
        # Mark archived points as noise / outlier partition (-1)
        final_labels[archived_mask] = -1
        
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        
        # Save diagnostics
        self.diagnostics_ = {
            "execution_time_ms": elapsed_ms,
            "ensemble_partitions": [
                {"name": p["name"], "weight": round(float(w), 4)}
                for p, w in zip(partitions, weights)
            ],
            "average_sample_score": round(float(np.mean(scores)), 4),
            "archived_count": int(np.sum(archived_mask)),
            "active_count": int(n_samples - np.sum(archived_mask)),
            "weights": {
                "w_recency": round(self.w_r, 4),
                "w_frequency": round(self.w_f, 4),
                "w_cluster": round(self.w_c, 4)
            },
            "archival_threshold": self.archival_threshold
        }
        
        return final_labels
