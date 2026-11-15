from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel

class ColumnInfo(BaseModel):
    name: str
    dtype: str
    non_null_count: int
    null_count: int
    unique_count: int
    sample_values: list[Any]

class DatasetSummary(BaseModel):
    row_count: int
    column_count: int
    total_missing: int
    duplicate_rows: int
    numeric_columns: list[str]
    categorical_columns: list[str]
    statistics: dict[str, dict[str, float]] # mean, std, min, max, median for numeric cols

class DatasetResponse(BaseModel):
    id: str
    filename: str
    original_name: str
    file_size_bytes: int
    row_count: int
    column_count: int
    columns: list[ColumnInfo]
    summary: DatasetSummary
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetPreview(BaseModel):
    id: str
    columns: list[str]
    rows: list[dict[str, Any]]
    total_rows: int
