# AEMA LAB — System Architecture & Methodology

## 1. System Overview
**AEMA LAB** is a high-performance machine learning research platform that implements the **Adaptive Ensemble-based Machine Learning Approach (AEMA)** for data clustering, high-dimensional visualization, and comparative algorithmic analysis.

Grounding Research:
*Adaptive Episodic Memory Architecture (AEMA) for Long-Term AI Agents*  
Authors: Aligeti Rajesh, Shakkarikonda Ruthika, P. Akhila, D. Sathish  
Affiliation: Department of CSE (AI & ML), B. V. Raju Institute of Technology, Telangana, India  
Communicated to: 4th International Conference on Sustainable Communication Networks and Application (ICSCNA 2026, Paper ID: ICSCNA_230).

---

## 2. End-to-End Pipeline

```
Raw Tabular Dataset (CSV / Excel)
               │
               ▼
┌───────────────────────────────┐
│     Data Quality Profiler     │  --> Inspect types, null counts, duplicate records, distributions
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│    Preprocessing Pipeline     │  --> Missing imputation, exact deduplication, one-hot/ordinal encoding, feature scaling
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│     AEMA Ensemble Engine      │
│  ┌─────────────────────────┐  │
│  │ Base Partitions (M)     │  │  --> Agglomerative (Cosine/Euclidean), K-Means, Gaussian Mixture Models
│  └───────────┬─────────────┘  │
│              ▼                │
│  ┌─────────────────────────┐  │
│  │ Adaptive Weighting (w_m)│  │  --> Softmax scoring using Silhouette, Davies-Bouldin, and Calinski-Harabasz indices
│  └───────────┬─────────────┘  │
│              ▼                │
│  ┌─────────────────────────┐  │
│  │ Consensus Matrix (C_ij) │  │  --> C_ij = SUM(w_m * I(c_i^(m) == c_j^(m)))
│  └───────────┬─────────────┘  │
│              ▼                │
│  ┌─────────────────────────┐  │
│  │ Consensus Clustering    │  │  --> Average-linkage agglomerative hierarchy on Dissimilarity D = 1 - C
│  └───────────┬─────────────┘  │
│              ▼                │
│  ┌─────────────────────────┐  │
│  │ Sample Scoring & Archive│  │  --> Score(x_i) = w_r*R + w_f*F + w_c*C (Archival if Score < tau)
│  └─────────────────────────┘  │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│   Clustering Evaluation Engine│  --> Silhouette, Davies-Bouldin, Calinski-Harabasz, ARI, NMI, Latency
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Visualizations & PDF Reports  │  --> 2D PCA, t-SNE, cluster sizes, PDF generation, CSV cluster download
└───────────────────────────────┘
```

---

## 3. Mathematical Foundations

### 3.1 Base Dissimilarity Metrics
Semantic distance for normalized vectors uses cosine distance:
$$d_{\cos}(u, v) = 1 - \frac{u \cdot v}{\|u\|_2 \|v\|_2}$$

### 3.2 Consensus Co-Association Matrix
Let $M$ denote the number of diverse base clusterers in the ensemble. For each partition $m$, let $w_m$ denote its adaptive quality weight ($\sum_{m=1}^M w_m = 1$). The weighted co-association matrix $C \in \mathbb{R}^{N \times N}$ is formulated as:
$$C_{ij} = \sum_{m=1}^M w_m \cdot \mathbb{I}(c_i^{(m)} = c_j^{(m)})$$
where $\mathbb{I}$ is the indicator function yielding $1$ if points $i$ and $j$ share a cluster in partition $m$, and $0$ otherwise.

Consensus dissimilarity matrix:
$$D_{ij} = 1 - C_{ij}$$

### 3.3 Adaptive Component Weighting
Each base partition is evaluated against internal cluster validation indices:
$$Q_m = \alpha \cdot \frac{S_m + 1}{2} + \beta \cdot \frac{1}{1 + DB_m} + \gamma \cdot \frac{\ln(1 + CH_m)}{10}$$
The adaptive weight vector is generated through softmax temperature normalization:
$$w_m = \frac{\exp(2 \cdot Q_m)}{\sum_{j=1}^M \exp(2 \cdot Q_j)}$$

### 3.4 Sample Confidence Scoring & Strategic Archival (Equations 6 & 7)
Each sample receives an adaptive importance score:
$$\text{Score}(x_i) = w_r R_i + w_f F_i + w_c C_i, \quad w_r + w_f + w_c = 1$$
Where:
- $R_i$: Density/recency proxy calculated via k-nearest neighbor distance inversion ($1 - d_k / \max(d_k)$).
- $F_i$: Consensus agreement frequency with points assigned to the same consensus cluster ($\frac{1}{|S_{c_i}| - 1} \sum_{j \in S_{c_i}, j \neq i} C_{ij}$).
- $C_i$: Min-max normalized cluster coherence and size proxy.

Strategic Archival Rule:
$$\text{Score}(x_i) < \tau \implies \text{archive } x_i \text{ (flag as outlier/noise partition)}$$

---

## 4. Database Schema
Implemented with SQLite via SQLAlchemy (PostgreSQL-compatible):
- **Datasets**: `id`, `filename`, `original_name`, `file_path`, `row_count`, `column_count`, `columns_json`, `summary_json`, `created_at`
- **PreprocessingRuns**: `id`, `dataset_id`, `operations_json`, `features_in`, `features_out`, `rows_before`, `rows_after`, `output_file_path`, `created_at`
- **Experiments**: `id`, `dataset_id`, `preprocessing_id`, `algorithm_name`, `parameters_json`, `status`, `execution_time_ms`, `clusters_count`, `noise_points`, `metrics_json`, `visualizations_json`, `result_file_path`, `created_at`
