import json
import os
import shutil
import uuid
from pathlib import Path
from typing import Optional
import pandas as pd
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.dataset import Dataset
from app.ml.preprocessing.pipeline import DataInspector

class DatasetService:
    @staticmethod
    def _read_dataframe(file_path: str) -> pd.DataFrame:
        """Reads CSV or Excel file safely into a pandas DataFrame."""
        ext = Path(file_path).suffix.lower()
        if ext == ".csv":
            try:
                return pd.read_csv(file_path)
            except UnicodeDecodeError:
                return pd.read_csv(file_path, encoding="latin1")
        elif ext in [".xlsx", ".xls"]:
            return pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {ext}")

    @classmethod
    def create_from_upload(cls, db: Session, file: UploadFile) -> Dataset:
        """Saves uploaded file and inspects its metadata."""
        ext = Path(file.filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type '{ext}'. Allowed extensions are: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        # Generate unique safe filename
        unique_id = str(uuid.uuid4())
        safe_filename = f"{unique_id}_{Path(file.filename).name}"
        save_path = settings.UPLOAD_DIR / safe_filename

        # Write to disk with size check
        total_size = 0
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        with open(save_path, "wb") as buffer:
            while chunk := file.file.read(1024 * 64):
                total_size += len(chunk)
                if total_size > max_bytes:
                    buffer.close()
                    save_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                    )
                buffer.write(chunk)

        try:
            df = cls._read_dataframe(str(save_path))
        except Exception as e:
            save_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail=f"Failed to parse uploaded dataset: {str(e)}")

        if len(df) == 0:
            save_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail="The uploaded file contains no data rows.")

        inspection = DataInspector.inspect(df)

        dataset = Dataset(
            id=unique_id,
            filename=safe_filename,
            original_name=file.filename,
            file_path=str(save_path),
            file_size_bytes=total_size,
            row_count=inspection["summary"]["row_count"],
            column_count=inspection["summary"]["column_count"],
            columns_json=json.dumps(inspection["columns"]),
            summary_json=json.dumps(inspection["summary"])
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset

    @classmethod
    def load_sample_dataset(cls, db: Session, sample_key: str) -> Dataset:
        """Loads one of the bundled research benchmark sample datasets."""
        sample_files = {
            "aema_corpus": ("aema_synthetic_fact_corpus.csv", "AEMA Research Episodic Fact Corpus (800 Facts)"),
            "iris": ("iris_dataset.csv", "Fisher's Iris Benchmark Dataset"),
            "customer_segmentation": ("customer_segmentation.csv", "Mall Customer Segmentation Dataset"),
            "wine": ("wine_clustering.csv", "Wine Chemical Analysis Dataset"),
            "synthetic_moons": ("synthetic_moons.csv", "Non-Convex Interlocking Moons Dataset")
        }

        if sample_key not in sample_files:
            raise HTTPException(status_code=404, detail=f"Sample dataset '{sample_key}' not found.")

        filename, display_name = sample_files[sample_key]
        source_path = settings.SAMPLE_DATA_DIR / filename
        if not source_path.exists():
            raise HTTPException(status_code=404, detail=f"Sample file {filename} does not exist on disk.")

        unique_id = str(uuid.uuid4())
        dest_filename = f"{unique_id}_{filename}"
        dest_path = settings.UPLOAD_DIR / dest_filename
        shutil.copyfile(source_path, dest_path)

        df = cls._read_dataframe(str(dest_path))
        inspection = DataInspector.inspect(df)

        dataset = Dataset(
            id=unique_id,
            filename=dest_filename,
            original_name=display_name,
            file_path=str(dest_path),
            file_size_bytes=os.path.getsize(dest_path),
            row_count=inspection["summary"]["row_count"],
            column_count=inspection["summary"]["column_count"],
            columns_json=json.dumps(inspection["columns"]),
            summary_json=json.dumps(inspection["summary"])
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset

    @classmethod
    def get_preview(cls, dataset: Dataset, limit: int = 50) -> dict:
        """Returns first N rows for dataset preview."""
        df = cls._read_dataframe(dataset.file_path)
        preview_df = df.head(limit)
        
        # Replace NaN with None for clean JSON serialization
        preview_df = preview_df.where(pd.notnull(preview_df), None)
        
        return {
            "id": dataset.id,
            "columns": list(df.columns),
            "rows": preview_df.to_dict(orient="records"),
            "total_rows": len(df)
        }
