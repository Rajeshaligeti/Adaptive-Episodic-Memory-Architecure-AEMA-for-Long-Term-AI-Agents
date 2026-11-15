import numpy as np
import pandas as pd
from app.ml.preprocessing.pipeline import DataInspector, PreprocessingPipeline

def test_data_inspector():
    df = pd.DataFrame({
        "num1": [1.0, 2.0, np.nan, 4.0, 5.0, 5.0],
        "cat1": ["A", "B", "A", None, "B", "B"],
        "num2": [10, 20, 30, 40, 50, 50]
    })
    res = DataInspector.inspect(df)
    assert res["summary"]["row_count"] == 6
    assert res["summary"]["column_count"] == 3
    assert res["summary"]["total_missing"] == 2
    assert "num1" in res["summary"]["numeric_columns"]
    assert "cat1" in res["summary"]["categorical_columns"]

def test_preprocessing_pipeline_imputation_and_scaling():
    df = pd.DataFrame({
        "feat1": [1.0, np.nan, 3.0, 4.0, 5.0],
        "feat2": [10.0, 20.0, 30.0, np.nan, 50.0],
        "category": ["low", "medium", "high", "low", "medium"]
    })
    pipe = PreprocessingPipeline(
        handle_missing="median",
        remove_duplicates=False,
        categorical_encoding="one_hot",
        scaling_method="standard"
    )
    X, names, report, cleaned_df = pipe.fit_transform(df)
    assert X.shape[0] == 5
    assert not np.isnan(X).any() # No NaN remaining
    assert report["missing_handled_count"] == 2
    assert len(names) >= 3

def test_preprocessing_deduplication():
    df = pd.DataFrame({
        "x": [1, 2, 2, 3],
        "y": [10, 20, 20, 30]
    })
    pipe = PreprocessingPipeline(remove_duplicates=True)
    X, _, report, _ = pipe.fit_transform(df)
    assert X.shape[0] == 3
    assert report["duplicates_removed"] == 1
