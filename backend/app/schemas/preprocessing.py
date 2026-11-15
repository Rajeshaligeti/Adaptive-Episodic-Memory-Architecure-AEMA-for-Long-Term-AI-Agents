from typing import Optional, Literal
from pydantic import BaseModel

class PreprocessRequest(BaseModel):
    handle_missing: Literal["none", "mean", "median", "most_frequent", "drop_rows"] = "median"
    remove_duplicates: bool = True
    selected_features: Optional[list[str]] = None
    target_column: Optional[str] = None # Optional ground-truth column to exclude from clustering
    categorical_encoding: Literal["none", "one_hot", "ordinal"] = "one_hot"
    scaling_method: Literal["none", "standard", "minmax", "robust"] = "standard"

class PreprocessResponse(BaseModel):
    id: str
    dataset_id: str
    features_in: int
    features_out: int
    rows_before: int
    rows_after: int
    duplicates_removed: int
    missing_handled_count: int
    encoded_columns: list[str]
    final_feature_names: list[str]
    created_at: str
