# AEMA LAB — REST API Specification

Interactive Swagger UI documentation is available at `http://localhost:8000/docs` and ReDoc at `http://localhost:8000/redoc`.

## Base URL
`/api`

---

## 1. Datasets API

### `POST /api/datasets/upload`
Uploads a CSV or Excel file (up to 50MB). Parses schema, data types, missing values, duplicate records, and statistical summaries.
- **Request:** `multipart/form-data` with `file`
- **Response:** `200 OK` Dataset JSON schema

### `POST /api/datasets/sample/{sample_key}`
Loads a pre-bundled benchmark dataset.
- **Valid Keys:**
  - `aema_corpus`: 800-fact episodic research corpus
  - `iris`: Fisher's 150-row Iris benchmark
  - `customer_segmentation`: 200 mall shopper profiles
  - `wine`: 178 chemical analysis records
  - `synthetic_moons`: 300 non-linear crescent coordinates
- **Response:** `200 OK` Dataset JSON

### `GET /api/datasets`
Lists all uploaded datasets.
- **Response:** `200 OK` Array of Dataset JSON

### `GET /api/datasets/{dataset_id}`
Retrieves column information and statistical profile.

### `GET /api/datasets/{dataset_id}/preview?limit=50`
Returns the first N rows of raw data for interactive inspection.

### `POST /api/datasets/{dataset_id}/preprocess`
Executes data preprocessing and saves transformed matrix.
- **Request Body:**
  ```json
  {
    "handle_missing": "median",
    "remove_duplicates": true,
    "selected_features": ["feat1", "feat2"],
    "target_column": "species",
    "categorical_encoding": "one_hot",
    "scaling_method": "standard"
  }
  ```
- **Response:** `200 OK` PreprocessResponse JSON

### `DELETE /api/datasets/{dataset_id}`
Deletes dataset and cascades to associated experiments and uploaded files.

---

## 2. Experiments API

### `POST /api/experiments/run`
Executes clustering pipeline (AEMA, K-Means, DBSCAN, Agglomerative, or GMM).
- **Request Body (AEMA):**
  ```json
  {
    "dataset_id": "uuid",
    "preprocessing_id": "uuid",
    "algorithm": "AEMA",
    "aema_config": {
      "n_clusters": 3,
      "ensemble_size": 7,
      "adaptive_weighting": true,
      "quality_metric": "composite",
      "weight_recency": 0.40,
      "weight_frequency": 0.30,
      "weight_cluster": 0.30,
      "archival_threshold": 0.30,
      "random_state": 42
    }
  }
  ```
- **Response:** `200 OK` ExperimentResponse JSON with metrics and PCA coordinates.

### `POST /api/experiments/compare`
Runs AEMA and chosen baselines side-by-side under identical preprocessing.
- **Request Body:**
  ```json
  {
    "dataset_id": "uuid",
    "algorithms": ["AEMA", "K-Means", "DBSCAN", "Agglomerative", "GMM"],
    "target_clusters": 3
  }
  ```
- **Response:** `200 OK` CompareAlgorithmsResponse with best performers highlighted.

### `GET /api/experiments`
Lists all past experiment runs.

### `GET /api/experiments/{experiment_id}`
Retrieves full experiment configuration, metrics, and visualization coordinates.

### `GET /api/experiments/{experiment_id}/report`
Generates and downloads publication-grade PDF report.
- **Response:** `200 OK` (Content-Type: `application/pdf`)

### `GET /api/experiments/{experiment_id}/download-csv`
Downloads CSV containing transformed features and predicted `cluster_label`.
- **Response:** `200 OK` (Content-Type: `text/csv`)

### `DELETE /api/experiments/{experiment_id}`
Deletes experiment record and removes result files from disk.

---

## 3. Statistics API

### `GET /api/stats/overview`
Provides high-level dashboard metrics: total datasets, total experiments, algorithm distribution, and recent runs.
