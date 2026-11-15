import json
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.dataset import Dataset, PreprocessingRun
from app.schemas.dataset import DatasetResponse, DatasetPreview
from app.schemas.preprocessing import PreprocessRequest, PreprocessResponse
from app.services.dataset_service import DatasetService
from app.services.experiment_service import ExperimentService

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Uploads a CSV or Excel dataset and parses columns and statistics."""
    ds = DatasetService.create_from_upload(db, file)
    return DatasetResponse(
        id=ds.id,
        filename=ds.filename,
        original_name=ds.original_name,
        file_size_bytes=ds.file_size_bytes,
        row_count=ds.row_count,
        column_count=ds.column_count,
        columns=json.loads(ds.columns_json),
        summary=json.loads(ds.summary_json),
        created_at=ds.created_at
    )

@router.post("/sample/{sample_key}", response_model=DatasetResponse)
def load_sample_dataset(sample_key: str, db: Session = Depends(get_db)):
    """Loads a pre-bundled benchmark dataset (aema_corpus, iris, customer_segmentation, wine, synthetic_moons)."""
    ds = DatasetService.load_sample_dataset(db, sample_key)
    return DatasetResponse(
        id=ds.id,
        filename=ds.filename,
        original_name=ds.original_name,
        file_size_bytes=ds.file_size_bytes,
        row_count=ds.row_count,
        column_count=ds.column_count,
        columns=json.loads(ds.columns_json),
        summary=json.loads(ds.summary_json),
        created_at=ds.created_at
    )

@router.get("", response_model=list[DatasetResponse])
def list_datasets(db: Session = Depends(get_db)):
    """Lists all uploaded datasets."""
    datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).all()
    return [
        DatasetResponse(
            id=ds.id,
            filename=ds.filename,
            original_name=ds.original_name,
            file_size_bytes=ds.file_size_bytes,
            row_count=ds.row_count,
            column_count=ds.column_count,
            columns=json.loads(ds.columns_json),
            summary=json.loads(ds.summary_json),
            created_at=ds.created_at
        )
        for ds in datasets
    ]

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Retrieves metadata and column profiling for a single dataset."""
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return DatasetResponse(
        id=ds.id,
        filename=ds.filename,
        original_name=ds.original_name,
        file_size_bytes=ds.file_size_bytes,
        row_count=ds.row_count,
        column_count=ds.column_count,
        columns=json.loads(ds.columns_json),
        summary=json.loads(ds.summary_json),
        created_at=ds.created_at
    )

@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
def preview_dataset(dataset_id: str, limit: int = 50, db: Session = Depends(get_db)):
    """Previews the first N rows of raw dataset."""
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return DatasetService.get_preview(ds, limit)

@router.post("/{dataset_id}/preprocess", response_model=PreprocessResponse)
def preprocess_dataset(dataset_id: str, config: PreprocessRequest, db: Session = Depends(get_db)):
    """Executes preprocessing (missing imputation, deduplication, feature scaling, encoding)."""
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    prep = ExperimentService.preprocess_dataset(db, ds, config)
    ops = json.loads(prep.operations_json)
    return PreprocessResponse(
        id=prep.id,
        dataset_id=prep.dataset_id,
        features_in=prep.features_in,
        features_out=prep.features_out,
        rows_before=prep.rows_before,
        rows_after=prep.rows_after,
        duplicates_removed=prep.rows_before - prep.rows_after,
        missing_handled_count=0,
        encoded_columns=[],
        final_feature_names=[],
        created_at=prep.created_at.isoformat()
    )

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Deletes a dataset and all associated experiments and files."""
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    db.delete(ds)
    db.commit()
    return {"message": "Dataset successfully deleted.", "id": dataset_id}
