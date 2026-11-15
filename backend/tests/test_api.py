import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert "AEMA LAB" in res.json()["app"]
    
    h_res = client.get("/health")
    assert h_res.status_code == 200
    assert h_res.json()["status"] == "healthy"

def test_load_sample_dataset_and_preview():
    # Load iris sample dataset
    res = client.post("/api/datasets/sample/iris")
    assert res.status_code == 200
    data = res.json()
    dataset_id = data["id"]
    assert data["row_count"] == 150
    assert data["column_count"] == 5

    # Preview
    prev = client.get(f"/api/datasets/{dataset_id}/preview")
    assert prev.status_code == 200
    assert len(prev.json()["rows"]) > 0

    return dataset_id

def test_end_to_end_experiment_flow():
    # 1. Load sample dataset
    ds_res = client.post("/api/datasets/sample/customer_segmentation")
    assert ds_res.status_code == 200
    dataset_id = ds_res.json()["id"]

    # 2. Preprocess dataset
    prep_res = client.post(
        f"/api/datasets/{dataset_id}/preprocess",
        json={
            "handle_missing": "median",
            "remove_duplicates": True,
            "scaling_method": "standard",
            "categorical_encoding": "one_hot"
        }
    )
    assert prep_res.status_code == 200
    prep_id = prep_res.json()["id"]

    # 3. Run AEMA experiment
    exp_res = client.post(
        "/api/experiments/run",
        json={
            "dataset_id": dataset_id,
            "preprocessing_id": prep_id,
            "algorithm": "AEMA",
            "aema_config": {
                "n_clusters": 4,
                "ensemble_size": 5,
                "adaptive_weighting": True
            }
        }
    )
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    exp_id = exp_data["id"]
    assert exp_data["status"] == "COMPLETED"
    assert exp_data["metrics"]["clusters_count"] >= 2
    assert "pca_2d" in exp_data["visualizations"]

    # 4. Compare algorithms
    comp_res = client.post(
        "/api/experiments/compare",
        json={
            "dataset_id": dataset_id,
            "preprocessing_id": prep_id,
            "algorithms": ["AEMA", "K-Means", "Agglomerative"],
            "target_clusters": 4
        }
    )
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert len(comp_data["comparison_table"]) == 3

    # 5. Download report PDF
    pdf_res = client.get(f"/api/experiments/{exp_id}/report")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

    # 6. Download results CSV
    csv_res = client.get(f"/api/experiments/{exp_id}/download-csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert b"cluster_label" in csv_res.content
