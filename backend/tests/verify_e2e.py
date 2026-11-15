import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

def run_verification():
    client = TestClient(app)

    print("--- Step 1: Health & Root ---")
    r = client.get("/health")
    assert r.status_code == 200, r.text
    print("OK:", r.json())

    print("\n--- Step 2: Ingest Benchmark Dataset (Iris) ---")
    r = client.post("/api/datasets/sample/iris")
    assert r.status_code == 200, r.text
    ds = r.json()
    ds_id = ds["id"]
    print(f"OK: Ingested {ds['original_name']} (ID: {ds_id}, {ds['row_count']} rows, {ds['column_count']} cols)")

    print("\n--- Step 3: Preview Dataset ---")
    r = client.get(f"/api/datasets/{ds_id}/preview?limit=5")
    assert r.status_code == 200, r.text
    prev = r.json()
    print(f"OK: Preview retrieved {len(prev['rows'])} rows with columns {prev['columns']}")

    print("\n--- Step 4: Preprocess (Median Imputation, Scaling, Ground Truth Exclusion) ---")
    r = client.post(f"/api/datasets/{ds_id}/preprocess", json={
        "handle_missing": "median",
        "remove_duplicates": True,
        "scaling_method": "standard",
        "target_column": "target"
    })
    assert r.status_code == 200, r.text
    prep = r.json()
    prep_id = prep["id"]
    print(f"OK: Preprocessing run {prep_id} (Features: {prep['features_in']} -> {prep['features_out']}, Rows: {prep['rows_before']} -> {prep['rows_after']})")

    print("\n--- Step 5: Run AEMA Clustering Pipeline ---")
    r = client.post("/api/experiments/run", json={
        "dataset_id": ds_id,
        "preprocessing_id": prep_id,
        "algorithm": "AEMA",
        "aema_config": {
            "n_clusters": 3,
            "ensemble_size": 7,
            "adaptive_weighting": True,
            "weight_recency": 0.40,
            "weight_frequency": 0.30,
            "weight_cluster": 0.30,
            "archival_threshold": 0.30,
            "random_state": 42
        }
    })
    assert r.status_code == 200, r.text
    exp = r.json()
    exp_id = exp["id"]
    m = exp["metrics"]
    print(f"OK: AEMA finished in {exp['execution_time_ms']:.2f} ms")
    print(f"   Clusters: {m['clusters_count']}, Silhouette: {m['silhouette_score']}, Davies-Bouldin: {m['davies_bouldin_index']}, ARI: {m['adjusted_rand_index']}")

    print("\n--- Step 6: 5-Way Algorithm Benchmark Comparison ---")
    r = client.post("/api/experiments/compare", json={
        "dataset_id": ds_id,
        "preprocessing_id": prep_id,
        "algorithms": ["AEMA", "K-Means", "DBSCAN", "Agglomerative", "GMM"],
        "target_clusters": 3
    })
    assert r.status_code == 200, r.text
    comp = r.json()
    print(f"OK: Comparison completed for {len(comp['comparison_table'])} algorithms:")
    for row in comp["comparison_table"]:
        print(f"   - {row['algorithm']}: k={row['clusters_count']}, Sil={row['silhouette_score']}, DB={row['davies_bouldin_index']}, Latency={row['execution_time_ms']}ms")
    print(f"   Best Silhouette: {comp['best_by_silhouette']}")
    print(f"   Best Davies-Bouldin: {comp['best_by_davies_bouldin']}")

    print("\n--- Step 7: Inspect 2D PCA Projections ---")
    r = client.get(f"/api/experiments/{exp_id}/visualizations")
    assert r.status_code == 200, r.text
    vis = r.json()
    print(f"OK: PCA coordinates calculated for {len(vis['pca_2d'])} points with variance ratio {vis['explained_variance_ratio']}")

    print("\n--- Step 8: Generate Publication PDF Report ---")
    r = client.get(f"/api/experiments/{exp_id}/report")
    assert r.status_code == 200, r.text
    assert r.headers["content-type"] == "application/pdf"
    print(f"OK: PDF Report generated successfully ({len(r.content)} bytes)")

    print("\n--- Step 9: Download Clustered Dataset CSV ---")
    r = client.get(f"/api/experiments/{exp_id}/download-csv")
    assert r.status_code == 200, r.text
    assert b"cluster_label" in r.content
    print(f"OK: Result CSV downloaded successfully ({len(r.content)} bytes)")

    print("\n=======================================================")
    print(">>> ALL 9 END-TO-END VERIFICATION STEPS PASSED 100%! <<<")
    print("=======================================================")

if __name__ == "__main__":
    run_verification()
