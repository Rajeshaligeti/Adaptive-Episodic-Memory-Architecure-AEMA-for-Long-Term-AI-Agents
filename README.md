# AEMA LAB — Adaptive Ensemble Intelligence for Advanced Data Clustering

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Pytest](https://img.shields.io/badge/Pytest-8.0+-0A9EDC?logo=pytest&logoColor=white)](https://docs.pytest.org)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-729B1B?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-quality machine learning web application implementing the **Adaptive Ensemble-based Machine Learning Approach (AEMA)** for data clustering, high-dimensional projection, and algorithmic benchmarking.

Developed based on peer-reviewed research:
> **"Adaptive Episodic Memory Architecture (AEMA) for Long-Term AI Agents"**  
> *Aligeti Rajesh, Shakkarikonda Ruthika, P. Akhila, D. Sathish*  
> Department of CSE (Artificial Intelligence & Machine Learning), B. V. Raju Institute of Technology, Telangana, India.  
> Communicated to: 4th International Conference on Sustainable Communication Networks and Application (**ICSCNA 2026**, Paper ID: `ICSCNA_230`).

---

## Key Highlights & Core Features

- **Autonomous Preprocessing Studio**:
  - Imputation (Median, Mean, Most Frequent, Row Drop).
  - Exact duplicate detection and logging.
  - One-hot & ordinal categorical encoding.
  - Feature scaling (StandardScaler, MinMaxScaler, RobustScaler).
  - Ground-truth target column exclusion to prevent evaluation data leakage.

- **Adaptive Ensemble ML Engine (AEMA)**:
  - Generates $M$ diverse base clustering partitions (Agglomerative Cosine/Euclidean, K-Means, GMM).
  - Dynamic quality weighting based on internal validation indices (Silhouette, Davies-Bouldin, Calinski-Harabasz).
  - Probabilistic co-association consensus matrix aggregation ($C_{ij}$).
  - Consensus partitioning via average-linkage hierarchical agglomeration on dissimilarity $D = 1 - C$.
  - Adaptive sample scoring $\text{Score}(x_i) = w_r R_i + w_f F_i + w_c C_i$ with strategic archival of outliers below threshold $\tau$.

- **Multi-Algorithm Benchmark Suite**:
  - Direct empirical comparison of AEMA against K-Means, DBSCAN, Agglomerative Hierarchical, and Gaussian Mixture Models under identical data transformations.
  - Automated highlighting of top-performing algorithms across Silhouette, Davies-Bouldin, and Calinski-Harabasz metrics.

- **Scientific Visualizations**:
  - Interactive 2D Principal Component Analysis (PCA) projection with cluster-coded color palettes and explained variance ratios.
  - 2D t-SNE manifold projections.
  - Cluster size and percentage distribution bar charts.
  - Multi-metric benchmark comparative bar charts.

- **Publication-Ready Outputs**:
  - Executive PDF reports generated via ReportLab/FPDF with metadata, metrics summary tables, and mathematical formulas.
  - Clustered dataset CSV export with predicted `cluster_label` columns.
  - Machine-readable JSON experiment configurations.

- **Persistent Experiment Archive**:
  - SQLite (PostgreSQL compatible) database tracking datasets, preprocessing states, execution latencies, and validation metrics.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React |
| **Backend** | Python 3.12, FastAPI, Pydantic V2, Uvicorn, SQLAlchemy |
| **Machine Learning** | NumPy, Pandas, Scikit-learn, SciPy |
| **Reporting** | FPDF2, Matplotlib |
| **Testing** | Pytest (Backend, 11/11 Passing), Vitest (Frontend, 2/2 Passing) |
| **Deployment** | Docker, Docker Compose, Vercel, Render |

---

## Project Structure

```
aema-lab/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (datasets, experiments, stats)
│   │   ├── core/            # Configuration, storage paths, CORS
│   │   ├── database/        # SQLAlchemy engine, session maker, Base model
│   │   ├── models/          # Dataset, PreprocessingRun, Experiment models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic for datasets, ML runs, reports
│   │   ├── ml/
│   │   │   ├── preprocessing/  # DataInspector, PreprocessingPipeline
│   │   │   ├── clustering/     # BaseClusterer, KMeans, DBSCAN, Agglomerative, GMM
│   │   │   ├── ensemble/       # Independent AEMA implementation
│   │   │   ├── evaluation/     # ClusteringEvaluator (Silhouette, DB, CH, ARI, NMI)
│   │   │   └── visualization/  # PCA and t-SNE 2D coordinate projections
│   │   ├── reports/         # PDF report generator
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Backend automated tests (11 passing)
│   ├── uploads/             # Safe storage for uploaded datasets & results
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── charts/          # Interactive Recharts (PCA, Distributions, Benchmarks)
│   │   ├── components/      # Sidebar, Header, MetricsBadges
│   │   ├── pages/           # 12 Dedicated application views
│   │   ├── services/        # Typed API service client
│   │   ├── types/           # TypeScript interface definitions
│   │   ├── __tests__/       # Vitest automated frontend tests (2 passing)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── vercel.json          # Vercel deployment configuration
│   └── Dockerfile
├── sample-data/             # Bundled verified benchmark datasets
│   ├── aema_synthetic_fact_corpus.csv  # 800-fact corpus from ICSCNA 2026 paper
│   ├── iris_dataset.csv
│   ├── customer_segmentation.csv
│   ├── wine_clustering.csv
│   └── synthetic_moons.csv
├── docs/
│   ├── ARCHITECTURE.md      # Detailed system architecture and math
│   └── API_SPECIFICATION.md # Full REST endpoint documentation
├── docker-compose.yml       # Multi-container local/cloud orchestration
├── render.yaml              # Render deployment configuration
├── DEVELOPMENT_STATUS.md
├── LICENSE                  # MIT License
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.10+ (tested on Python 3.12.3)
- Node.js 18+ (tested on Node v20.13.1, npm 10.5.2)

### 1. Run the Backend (FastAPI)
```bash
# From repository root
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend will start at: `http://localhost:8000`  
Swagger UI API Docs: `http://localhost:8000/docs`

### 2. Run the Frontend (React + Vite)
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```
Frontend will start at: `http://localhost:5173`

---

## Running with Docker Compose

To start both the frontend and backend in isolated production containers:
```bash
docker-compose up --build
```
- Web Application: `http://localhost:3000`
- REST API: `http://localhost:8000`
- Swagger Documentation: `http://localhost:8000/docs`

---

## Automated Test Execution

### Backend Tests (Pytest)
```bash
python -m pytest backend/tests -v
```
**Results:** `11 passed` (100% test pass rate)
- `test_aema_clustering_pipeline`: PASSED
- `test_aema_adaptive_weighting_vs_uniform`: PASSED
- `test_root_and_health`: PASSED
- `test_load_sample_dataset_and_preview`: PASSED
- `test_end_to_end_experiment_flow`: PASSED
- `test_standard_clusterers`: PASSED
- `test_metrics_evaluation`: PASSED
- `test_dimensionality_reducer`: PASSED
- `test_data_inspector`: PASSED
- `test_preprocessing_pipeline_imputation_and_scaling`: PASSED
- `test_preprocessing_deduplication`: PASSED

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
**Results:** `2 passed` (100% test pass rate)

---

## Deployment Guide

### Deploying Frontend to Vercel
1. Install the Vercel CLI or connect via GitHub:
   ```bash
   npm i -g vercel
   cd frontend
   vercel
   ```
2. Set Environment Variable in Vercel Project Settings:
   - `VITE_API_URL`: URL of your deployed backend (e.g. `https://aema-lab-backend.onrender.com/api`)
3. The included `frontend/vercel.json` ensures full Single Page Application (SPA) rewrite support.

### Deploying Backend to Render
1. Create a New Web Service on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure settings:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `DATABASE_URL`: `sqlite:////tmp/aema_lab.db` (or a managed PostgreSQL connection URI)
   - `CORS_ORIGINS`: `*` (or your specific Vercel frontend URL)

---

## Authors & Citation

```bibtex
@inproceedings{rajesh2026aema,
  title={Adaptive Episodic Memory Architecture (AEMA) for Long-Term AI Agents},
  author={Rajesh, Aligeti and Ruthika, Shakkarikonda and Akhila, P. and Sathish, D.},
  booktitle={Proceedings of the 4th International Conference on Sustainable Communication Networks and Application (ICSCNA 2026)},
  note={Paper ID: ICSCNA_230},
  year={2026},
  organization={Department of CSE (AI & ML), B. V. Raju Institute of Technology}
}
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
