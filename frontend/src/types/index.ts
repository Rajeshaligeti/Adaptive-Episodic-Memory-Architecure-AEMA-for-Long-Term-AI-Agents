export interface ColumnInfo {
  name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
  unique_count: number;
  sample_values: (string | number | boolean)[];
}

export interface DatasetSummary {
  row_count: number;
  column_count: number;
  total_missing: number;
  duplicate_rows: number;
  numeric_columns: string[];
  categorical_columns: string[];
  statistics: Record<string, {
    mean: number;
    std: number;
    min: number;
    max: number;
    median: number;
  }>;
}

export interface Dataset {
  id: string;
  filename: string;
  original_name: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  columns: ColumnInfo[];
  summary: DatasetSummary;
  created_at: string;
}

export interface DatasetPreview {
  id: string;
  columns: string[];
  rows: Record<string, any>[];
  total_rows: number;
}

export interface PreprocessConfig {
  handle_missing: 'none' | 'mean' | 'median' | 'most_frequent' | 'drop_rows';
  remove_duplicates: boolean;
  selected_features?: string[];
  target_column?: string;
  categorical_encoding: 'none' | 'one_hot' | 'ordinal';
  scaling_method: 'none' | 'standard' | 'minmax' | 'robust';
}

export interface PreprocessResponse {
  id: string;
  dataset_id: string;
  features_in: number;
  features_out: number;
  rows_before: number;
  rows_after: number;
  duplicates_removed: number;
  missing_handled_count: number;
  encoded_columns: string[];
  final_feature_names: string[];
  created_at: string;
}

export interface AEMAConfig {
  n_clusters: number;
  ensemble_size: number;
  adaptive_weighting: boolean;
  quality_metric: 'silhouette' | 'calinski_harabasz' | 'composite';
  weight_recency: number;
  weight_frequency: number;
  weight_cluster: number;
  archival_threshold: number;
  consensus_linkage: 'average' | 'complete' | 'single';
  random_state: number;
}

export interface KMeansConfig {
  n_clusters: number;
  init: 'k-means++' | 'random';
  max_iter: number;
  random_state: number;
}

export interface DBSCANConfig {
  eps: number;
  min_samples: number;
  metric: 'euclidean' | 'cosine' | 'manhattan';
}

export interface AgglomerativeConfig {
  n_clusters: number;
  linkage: 'ward' | 'complete' | 'average' | 'single';
  metric: 'euclidean' | 'cosine' | 'manhattan';
}

export interface GMMConfig {
  n_components: number;
  covariance_type: 'full' | 'tied' | 'diag' | 'spherical';
  random_state: number;
}

export interface ExperimentRunRequest {
  dataset_id: string;
  preprocessing_id?: string;
  algorithm: 'AEMA' | 'K-Means' | 'DBSCAN' | 'Agglomerative' | 'GMM';
  aema_config?: Partial<AEMAConfig>;
  kmeans_config?: Partial<KMeansConfig>;
  dbscan_config?: Partial<DBSCANConfig>;
  agglomerative_config?: Partial<AgglomerativeConfig>;
  gmm_config?: Partial<GMMConfig>;
}

export interface ClusterDistribution {
  cluster: number;
  label: string;
  count: number;
  percentage: number;
}

export interface ExperimentMetrics {
  silhouette_score?: number | null;
  davies_bouldin_index?: number | null;
  calinski_harabasz_index?: number | null;
  clusters_count: number;
  noise_points: number;
  noise_ratio: number;
  execution_time_ms: number;
  adjusted_rand_index?: number | null;
  normalized_mutual_info?: number | null;
  cluster_distribution: ClusterDistribution[];
}

export interface PCA2DPoint {
  id: number;
  x: number;
  y: number;
  cluster: number;
}

export interface PCA3DPoint {
  id: number;
  x: number;
  y: number;
  z: number;
  cluster: number;
}

export interface VisualizationData {
  pca_2d: PCA2DPoint[];
  pca_3d?: PCA3DPoint[] | null;
  tsne_2d?: PCA2DPoint[] | null;
  cluster_distribution: ClusterDistribution[];
  explained_variance_ratio?: number[];
  explained_variance_ratio_3d?: number[];
  feature_importance_proxy?: Record<string, number>;
}

export interface Experiment {
  id: string;
  dataset_id: string;
  preprocessing_id?: string | null;
  algorithm_name: string;
  parameters: Record<string, any>;
  status: string;
  execution_time_ms: number;
  clusters_count: number;
  noise_points: number;
  metrics: ExperimentMetrics;
  visualizations: VisualizationData;
  created_at: string;
}

export interface AlgorithmComparisonItem {
  algorithm: string;
  clusters_count: number;
  noise_points: number;
  execution_time_ms: number;
  silhouette_score?: number | null;
  davies_bouldin_index?: number | null;
  calinski_harabasz_index?: number | null;
  adjusted_rand_index?: number | null;
  status: string;
  error?: string | null;
}

export interface CompareAlgorithmsResponse {
  dataset_id: string;
  target_clusters: number;
  comparison_table: AlgorithmComparisonItem[];
  best_by_silhouette?: string | null;
  best_by_davies_bouldin?: string | null;
  best_by_calinski_harabasz?: string | null;
  aema_summary: Record<string, any>;
}

export interface StatsOverview {
  total_datasets: number;
  total_experiments: number;
  algorithm_distribution: Record<string, number>;
  recent_experiments: {
    id: string;
    dataset_name: string;
    algorithm: string;
    clusters_count: number;
    silhouette_score?: number | null;
    execution_time_ms: number;
    status: string;
    created_at: string;
  }[];
}
