from typing import Any, Optional, Literal
from pydantic import BaseModel, Field

class AEMAConfig(BaseModel):
    n_clusters: int = Field(default=3, ge=2, le=50)
    ensemble_size: int = Field(default=7, ge=3, le=25)
    adaptive_weighting: bool = True
    quality_metric: Literal["silhouette", "calinski_harabasz", "composite"] = "composite"
    weight_recency: float = Field(default=0.40, ge=0.0, le=1.0) # w_r
    weight_frequency: float = Field(default=0.30, ge=0.0, le=1.0) # w_f
    weight_cluster: float = Field(default=0.30, ge=0.0, le=1.0) # w_c
    archival_threshold: float = Field(default=0.30, ge=0.0, le=1.0) # tau
    consensus_linkage: Literal["average", "complete", "single"] = "average"
    random_state: int = 42

class KMeansConfig(BaseModel):
    n_clusters: int = Field(default=3, ge=2, le=50)
    init: Literal["k-means++", "random"] = "k-means++"
    max_iter: int = 300
    random_state: int = 42

class DBSCANConfig(BaseModel):
    eps: float = Field(default=0.5, gt=0.0)
    min_samples: int = Field(default=5, ge=2)
    metric: Literal["euclidean", "cosine", "manhattan"] = "euclidean"

class AgglomerativeConfig(BaseModel):
    n_clusters: int = Field(default=3, ge=2, le=50)
    linkage: Literal["ward", "complete", "average", "single"] = "average"
    metric: Literal["euclidean", "cosine", "manhattan"] = "cosine"

class GMMConfig(BaseModel):
    n_components: int = Field(default=3, ge=2, le=50)
    covariance_type: Literal["full", "tied", "diag", "spherical"] = "full"
    random_state: int = 42

class ExperimentRunRequest(BaseModel):
    dataset_id: str
    preprocessing_id: Optional[str] = None
    algorithm: Literal["AEMA", "K-Means", "DBSCAN", "Agglomerative", "GMM"] = "AEMA"
    aema_config: Optional[AEMAConfig] = None
    kmeans_config: Optional[KMeansConfig] = None
    dbscan_config: Optional[DBSCANConfig] = None
    agglomerative_config: Optional[AgglomerativeConfig] = None
    gmm_config: Optional[GMMConfig] = None

class ExperimentMetrics(BaseModel):
    silhouette_score: Optional[float] = None
    davies_bouldin_index: Optional[float] = None
    calinski_harabasz_index: Optional[float] = None
    clusters_count: int
    noise_points: int
    noise_ratio: float
    execution_time_ms: float
    adjusted_rand_index: Optional[float] = None # When ground-truth is available
    normalized_mutual_info: Optional[float] = None

class VisualizationData(BaseModel):
    pca_2d: list[dict[str, Any]] # x, y, cluster, id
    tsne_2d: Optional[list[dict[str, Any]]] = None
    cluster_distribution: list[dict[str, Any]] # cluster, count, percentage
    explained_variance_ratio: Optional[list[float]] = None
    feature_importance_proxy: Optional[dict[str, float]] = None

class ExperimentResponse(BaseModel):
    id: str
    dataset_id: str
    preprocessing_id: Optional[str] = None
    algorithm_name: str
    parameters: dict[str, Any]
    status: str
    execution_time_ms: float
    clusters_count: int
    noise_points: int
    metrics: ExperimentMetrics
    visualizations: VisualizationData
    created_at: str

class CompareAlgorithmsRequest(BaseModel):
    dataset_id: str
    preprocessing_id: Optional[str] = None
    algorithms: list[Literal["AEMA", "K-Means", "DBSCAN", "Agglomerative", "GMM"]] = [
        "AEMA", "K-Means", "DBSCAN", "Agglomerative", "GMM"
    ]
    target_clusters: int = Field(default=3, ge=2, le=50)
    random_state: int = 42

class AlgorithmComparisonItem(BaseModel):
    algorithm: str
    clusters_count: int
    noise_points: int
    execution_time_ms: float
    silhouette_score: Optional[float] = None
    davies_bouldin_index: Optional[float] = None
    calinski_harabasz_index: Optional[float] = None
    adjusted_rand_index: Optional[float] = None
    status: str
    error: Optional[str] = None

class CompareAlgorithmsResponse(BaseModel):
    dataset_id: str
    target_clusters: int
    comparison_table: list[AlgorithmComparisonItem]
    best_by_silhouette: Optional[str] = None
    best_by_davies_bouldin: Optional[str] = None
    best_by_calinski_harabasz: Optional[str] = None
    aema_summary: dict[str, Any]
