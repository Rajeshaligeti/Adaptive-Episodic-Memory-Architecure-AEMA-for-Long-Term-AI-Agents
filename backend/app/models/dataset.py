import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    columns_json = Column(Text, default="[]") # List of column names and detected data types
    summary_json = Column(Text, default="{}") # Missing values, duplicates, summary stats
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    experiments = relationship("Experiment", back_populates="dataset", cascade="all, delete-orphan")
    preprocessing_runs = relationship("PreprocessingRun", back_populates="dataset", cascade="all, delete-orphan")

class PreprocessingRun(Base):
    __tablename__ = "preprocessing_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    operations_json = Column(Text, default="{}")
    features_in = Column(Integer, default=0)
    features_out = Column(Integer, default=0)
    rows_before = Column(Integer, default=0)
    rows_after = Column(Integer, default=0)
    output_file_path = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dataset = relationship("Dataset", back_populates="preprocessing_runs")
    experiments = relationship("Experiment", back_populates="preprocessing_run")
