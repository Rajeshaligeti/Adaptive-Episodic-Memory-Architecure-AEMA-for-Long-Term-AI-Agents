import numpy as np
import pandas as pd
from typing import Any, Tuple
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, OneHotEncoder, OrdinalEncoder
from sklearn.impute import SimpleImputer

class DataInspector:
    @staticmethod
    def inspect(df: pd.DataFrame) -> dict[str, Any]:
        """Calculates column statistics, missing values, duplicates, and data types."""
        row_count, column_count = df.shape
        duplicate_rows = int(df.duplicated().sum())
        total_missing = int(df.isnull().sum().sum())
        
        numeric_cols = []
        categorical_cols = []
        columns_info = []
        statistics = {}
        
        for col in df.columns:
            series = df[col]
            dtype = str(series.dtype)
            null_count = int(series.isnull().sum())
            non_null_count = int(series.notnull().sum())
            unique_count = int(series.nunique())
            
            # Sample non-null values
            samples = series.dropna().head(5).tolist()
            # Convert non-serializable objects to string or float
            clean_samples = [str(x) if not isinstance(x, (int, float, bool)) else x for x in samples]
            
            is_numeric = pd.api.types.is_numeric_dtype(series)
            if is_numeric:
                numeric_cols.append(col)
                if non_null_count > 0:
                    try:
                        statistics[col] = {
                            "mean": float(series.mean()),
                            "std": float(series.std()) if non_null_count > 1 else 0.0,
                            "min": float(series.min()),
                            "max": float(series.max()),
                            "median": float(series.median())
                        }
                    except Exception:
                        pass
            else:
                categorical_cols.append(col)
                
            columns_info.append({
                "name": col,
                "dtype": dtype,
                "non_null_count": non_null_count,
                "null_count": null_count,
                "unique_count": unique_count,
                "sample_values": clean_samples
            })
            
        summary = {
            "row_count": row_count,
            "column_count": column_count,
            "total_missing": total_missing,
            "duplicate_rows": duplicate_rows,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "statistics": statistics
        }
        
        return {
            "columns": columns_info,
            "summary": summary
        }

class PreprocessingPipeline:
    def __init__(
        self,
        handle_missing: str = "median",
        remove_duplicates: bool = True,
        selected_features: list[str] = None,
        target_column: str = None,
        categorical_encoding: str = "one_hot",
        scaling_method: str = "standard"
    ):
        self.handle_missing = handle_missing
        self.remove_duplicates = remove_duplicates
        self.selected_features = selected_features
        self.target_column = target_column
        self.categorical_encoding = categorical_encoding
        self.scaling_method = scaling_method
        
    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, list[str], dict[str, Any], pd.DataFrame]:
        """
        Transforms raw DataFrame into a cleaned numerical matrix for clustering.
        Returns:
            X (np.ndarray): transformed features
            feature_names (list[str]): names of generated features
            report (dict): transformation metadata and metrics
            cleaned_df (pd.DataFrame): cleaned DataFrame including original columns + labels
        """
        df_work = df.copy()
        rows_before = len(df_work)
        features_in = df_work.shape[1]
        
        # 1. Separate ground-truth target column if present
        target_series = None
        if self.target_column and self.target_column in df_work.columns:
            target_series = df_work[self.target_column]
            df_work = df_work.drop(columns=[self.target_column])
            
        # 2. Filter selected features if provided
        if self.selected_features:
            valid_cols = [c for c in self.selected_features if c in df_work.columns]
            if valid_cols:
                df_work = df_work[valid_cols]
                
        # 3. Duplicate handling
        duplicates_removed = 0
        if self.remove_duplicates:
            dup_mask = df_work.duplicated()
            duplicates_removed = int(dup_mask.sum())
            if duplicates_removed > 0:
                df_work = df_work[~dup_mask].reset_index(drop=True)
                if target_series is not None:
                    target_series = target_series[~dup_mask].reset_index(drop=True)
                    
        # 4. Missing value handling
        missing_handled_count = int(df_work.isnull().sum().sum())
        if self.handle_missing == "drop_rows":
            drop_mask = df_work.isnull().any(axis=1)
            df_work = df_work[~drop_mask].reset_index(drop=True)
            if target_series is not None:
                target_series = target_series[~drop_mask].reset_index(drop=True)
        elif self.handle_missing in ["mean", "median", "most_frequent"]:
            # Handle numeric cols
            num_cols = df_work.select_dtypes(include=[np.number]).columns.tolist()
            if num_cols and df_work[num_cols].isnull().sum().sum() > 0:
                strategy = "median" if self.handle_missing == "median" else ("mean" if self.handle_missing == "mean" else "most_frequent")
                imputer = SimpleImputer(strategy=strategy)
                df_work[num_cols] = imputer.fit_transform(df_work[num_cols])
                
            # Handle categorical cols with most frequent
            cat_cols = df_work.select_dtypes(exclude=[np.number]).columns.tolist()
            if cat_cols and df_work[cat_cols].isnull().sum().sum() > 0:
                cat_imputer = SimpleImputer(strategy="most_frequent")
                df_work[cat_cols] = cat_imputer.fit_transform(df_work[cat_cols])
                
        # 5. Categorical encoding & Text Embedding
        cat_cols = df_work.select_dtypes(exclude=[np.number]).columns.tolist()
        num_cols = df_work.select_dtypes(include=[np.number]).columns.tolist()
        encoded_column_names = []
        encoded_arrays = []
        
        if num_cols:
            encoded_arrays.append(df_work[num_cols].values)
            encoded_column_names.extend(num_cols)
            
        # Separate high-cardinality IDs, free-text sentences, and discrete categories
        id_cols = []
        text_cols = []
        discrete_cat_cols = []
        
        for c in cat_cols:
            s = df_work[c].astype(str)
            avg_len = s.str.len().mean()
            nunique = s.nunique()
            if avg_len > 25 or c.lower() in ["text", "description", "content", "sentence", "abstract"]:
                text_cols.append(c)
            elif nunique == len(df_work) or (c.lower().endswith("_id") and nunique > 50):
                id_cols.append(c)
            else:
                discrete_cat_cols.append(c)
                
        # Handle free-text columns with TF-IDF semantic embeddings (e.g., in AEMA research fact corpus)
        for tc in text_cols:
            try:
                from sklearn.feature_extraction.text import TfidfVectorizer
                tfidf = TfidfVectorizer(max_features=25, stop_words="english")
                tfidf_mat = tfidf.fit_transform(df_work[tc].astype(str)).toarray()
                feature_names_tfidf = [f"tfidf_{tc}_{w}" for w in tfidf.get_feature_names_out()]
                encoded_arrays.append(tfidf_mat)
                encoded_column_names.extend(feature_names_tfidf)
            except Exception:
                pass

        if discrete_cat_cols and self.categorical_encoding != "none":
            if self.categorical_encoding == "one_hot":
                # Limit one-hot categories to prevent explosion on high-cardinality discrete categories
                ohe = OneHotEncoder(sparse_output=False, handle_unknown="ignore", max_categories=15)
                ohe_arr = ohe.fit_transform(df_work[discrete_cat_cols])
                ohe_names = ohe.get_feature_names_out(discrete_cat_cols).tolist()
                encoded_arrays.append(ohe_arr)
                encoded_column_names.extend(ohe_names)
            elif self.categorical_encoding == "ordinal":
                oe = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)
                oe_arr = oe.fit_transform(df_work[discrete_cat_cols])
                encoded_arrays.append(oe_arr)
                encoded_column_names.extend(discrete_cat_cols)

        if not encoded_arrays:
            raise ValueError("No numeric features available for clustering after preprocessing.")
            
        X_raw = np.hstack(encoded_arrays)
        
        # 6. Feature scaling
        if self.scaling_method == "standard":
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X_raw)
        elif self.scaling_method == "minmax":
            scaler = MinMaxScaler()
            X_scaled = scaler.fit_transform(X_raw)
        elif self.scaling_method == "robust":
            scaler = RobustScaler()
            X_scaled = scaler.fit_transform(X_raw)
        else:
            X_scaled = X_raw.copy()
            
        rows_after = len(df_work)
        features_out = X_scaled.shape[1]
        
        report = {
            "features_in": features_in,
            "features_out": features_out,
            "rows_before": rows_before,
            "rows_after": rows_after,
            "duplicates_removed": duplicates_removed,
            "missing_handled_count": missing_handled_count,
            "encoded_columns": cat_cols,
            "final_feature_names": encoded_column_names,
            "has_ground_truth": target_series is not None
        }
        
        # Build cleaned df for persistence
        cleaned_df = pd.DataFrame(X_scaled, columns=encoded_column_names)
        if target_series is not None:
            cleaned_df["_ground_truth"] = target_series.values
            
        return X_scaled, encoded_column_names, report, cleaned_df
