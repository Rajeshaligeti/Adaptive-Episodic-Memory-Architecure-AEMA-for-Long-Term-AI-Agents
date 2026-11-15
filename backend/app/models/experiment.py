import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    preprocessing_id = Column(String(36), ForeignKey("preprocessing_runs.id"), nullable=True)
    algorithm_name = Column(String(50), nullable=False) # 'AEMA', 'K-Means', 'DBSCAN', 'Agglomerative', 'GMM'
    parameters_json = Column(Text, default="{}") # e.g. n_clusters, eps, ensemble weights, seed
    status = Column(String(20), default="COMPLETED") # 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
    execution_time_ms = Column(Float, default=0.0)
    clusters_count = Column(Integer, default=0)
    noise_points = Column(Integer, default=0)
    metrics_json = Column(Text, default="{}") # silhouette, davies_bouldin, calinski_harabasz, ari, nmi
    visualizations_json = Column(Text, default="{}") # pca_2d, tsne_2d, cluster_distribution
    result_file_path = Column(String(500), nullable=True) # CSV with cluster labels
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dataset = relationship("Dataset", back_populates="experiments")
    preprocessing_run = relationship("PreprocessingRun", back_populates="experiments")
