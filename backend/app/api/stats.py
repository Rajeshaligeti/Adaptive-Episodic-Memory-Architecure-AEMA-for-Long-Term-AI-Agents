import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.dataset import Dataset
from app.models.experiment import Experiment

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/overview")
def get_stats_overview(db: Session = Depends(get_db)):
    """Provides high-level system metrics and recent experiment activity for Dashboard."""
    total_datasets = db.query(Dataset).count()
    total_experiments = db.query(Experiment).count()

    recent_exps = db.query(Experiment).order_by(Experiment.created_at.desc()).limit(6).all()
    recent_activity = []
    for e in recent_exps:
        m = json.loads(e.metrics_json) if e.metrics_json else {}
        recent_activity.append({
            "id": e.id,
            "dataset_name": e.dataset.original_name if e.dataset else "Dataset",
            "algorithm": e.algorithm_name,
            "clusters_count": e.clusters_count,
            "silhouette_score": m.get("silhouette_score"),
            "execution_time_ms": e.execution_time_ms,
            "status": e.status,
            "created_at": e.created_at.isoformat()
        })

    # Summary by algorithm
    algo_counts = {}
    for e in db.query(Experiment.algorithm_name).all():
        name = e[0]
        algo_counts[name] = algo_counts.get(name, 0) + 1

    return {
        "total_datasets": total_datasets,
        "total_experiments": total_experiments,
        "algorithm_distribution": algo_counts,
        "recent_experiments": recent_activity
    }
