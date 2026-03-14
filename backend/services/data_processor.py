"""
services/data_processor.py
Pandas-based data profiling and cleaning engine.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler


# ──────────────────────────────────────────────────────────
# PROFILING
# ──────────────────────────────────────────────────────────

def profile(df: pd.DataFrame) -> dict:
    """
    Generate a comprehensive statistical profile of the DataFrame.
    Returns a serialisable dict ready to send as JSON.
    """
    rows, cols = df.shape

    # Detect column categories
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    datetime_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()

    # Missing values per column
    missing = {
        col: {
            "count": int(df[col].isna().sum()),
            "pct": round(df[col].isna().mean() * 100, 2)
        }
        for col in df.columns
    }

    # Descriptive statistics (numeric only)
    describe_raw = df.describe(include=[np.number])
    describe = {}
    for col in describe_raw.columns:
        describe[col] = {k: _safe_val(v) for k, v in describe_raw[col].items()}

    # Data types
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}

    # Duplicate rows
    duplicate_count = int(df.duplicated().sum())

    # Unique value counts per column (top-level)
    unique_counts = {col: int(df[col].nunique()) for col in df.columns}

    return {
        "rows": rows,
        "cols": cols,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "datetime_columns": datetime_cols,
        "missing_values": missing,
        "duplicate_rows": duplicate_count,
        "dtypes": dtypes,
        "unique_counts": unique_counts,
        "describe": describe,
        "column_names": df.columns.tolist(),
    }


# ──────────────────────────────────────────────────────────
# CLEANING
# ──────────────────────────────────────────────────────────

def clean(df: pd.DataFrame, operations: list) -> pd.DataFrame:
    """
    Apply a list of selected cleaning operations to the DataFrame.
    Supported operations (as string keys):
      - drop_duplicates
      - fill_missing_mean
      - fill_missing_median
      - fill_missing_mode
      - remove_outliers_iqr
      - drop_high_null_cols   (drops columns with >50% nulls)
      - normalize_numeric
      - convert_dtypes
    """
    df = df.copy()

    if "drop_duplicates" in operations:
        df = _drop_duplicates(df)

    if "drop_high_null_cols" in operations:
        df = _drop_high_null_cols(df)

    if "fill_missing_mean" in operations:
        df = _fill_missing(df, strategy="mean")
    elif "fill_missing_median" in operations:
        df = _fill_missing(df, strategy="median")
    elif "fill_missing_mode" in operations:
        df = _fill_missing(df, strategy="mode")

    if "remove_outliers_iqr" in operations:
        df = _remove_outliers_iqr(df)

    if "normalize_numeric" in operations:
        df = _normalize_numeric(df)

    if "convert_dtypes" in operations:
        df = df.convert_dtypes()

    return df


# ──────────────────────────────────────────────────────────
# PRIVATE HELPERS
# ──────────────────────────────────────────────────────────

def _drop_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop_duplicates()


def _drop_high_null_cols(df: pd.DataFrame, threshold: float = 0.5) -> pd.DataFrame:
    """Drop columns where the fraction of nulls exceeds `threshold`."""
    null_fractions = df.isna().mean()
    cols_to_keep = null_fractions[null_fractions <= threshold].index
    return df[cols_to_keep]


def _fill_missing(df: pd.DataFrame, strategy: str) -> pd.DataFrame:
    """Fill numeric nulls with mean/median; categorical nulls with mode."""
    df = df.copy()
    for col in df.select_dtypes(include=[np.number]).columns:
        if df[col].isna().any():
            if strategy == "mean":
                df[col].fillna(df[col].mean(), inplace=True)
            elif strategy == "median":
                df[col].fillna(df[col].median(), inplace=True)
            elif strategy == "mode":
                df[col].fillna(df[col].mode()[0], inplace=True)
    # Fill object columns with mode
    for col in df.select_dtypes(include=["object"]).columns:
        if df[col].isna().any():
            mode_val = df[col].mode()
            if len(mode_val) > 0:
                df[col].fillna(mode_val[0], inplace=True)
    return df


def _remove_outliers_iqr(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove rows where any numeric column value falls outside
    the IQR fence (Q1 - 1.5*IQR, Q3 + 1.5*IQR).
    """
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    mask = pd.Series(True, index=df.index)
    for col in numeric_cols:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        mask &= df[col].between(lower, upper)
    return df[mask]


def _normalize_numeric(df: pd.DataFrame) -> pd.DataFrame:
    """Min-max scale all numeric columns to [0, 1]."""
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if numeric_cols:
        scaler = MinMaxScaler()
        df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
    return df


def _safe_val(v):
    """Convert numpy scalars to Python-native types for JSON serialisation."""
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return None if np.isnan(v) else float(v)
    return v
