"""
routes/clean.py  –  POST /clean
Applies the selected cleaning operations to the DataFrame,
stores the cleaned result, and returns a preview + shape.
"""

import os
import pandas as pd
import numpy as np
from flask import Blueprint, request, jsonify
from services.data_processor import clean
from routes.upload import get_state

clean_bp = Blueprint("clean", __name__)

CLEANED_FILENAME = "uploads/cleaned_dataset.csv"


def _safe(obj):
    if isinstance(obj, dict):
        return {k: _safe(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_safe(i) for i in obj]
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return None if np.isnan(obj) else float(obj)
    try:
        if pd.isna(obj):
            return None
    except (TypeError, ValueError):
        pass
    return obj


@clean_bp.route("/clean", methods=["POST"])
def clean_data():
    state = get_state()
    df = state.get("df")

    if df is None:
        return jsonify({"error": "No dataset loaded. Please upload a file first."}), 400

    body = request.get_json(silent=True) or {}
    operations = body.get("operations", [])

    if not operations:
        return jsonify({"error": "No cleaning operations selected."}), 400

    try:
        cleaned_df = clean(df, operations)
    except Exception as e:
        return jsonify({"error": f"Cleaning failed: {str(e)}"}), 500

    # Persist cleaned DataFrame for downstream endpoints
    state["cleaned_df"] = cleaned_df
    cleaned_df.to_csv(CLEANED_FILENAME, index=False)

    preview_df = cleaned_df.head(10).where(pd.notnull(cleaned_df.head(10)), None)
    preview = preview_df.to_dict(orient="records")

    return jsonify({
        "message": f"Applied operations: {operations}",
        "original_shape": {"rows": int(df.shape[0]), "cols": int(df.shape[1])},
        "cleaned_shape": {"rows": int(cleaned_df.shape[0]), "cols": int(cleaned_df.shape[1])},
        "columns_removed": [c for c in df.columns if c not in cleaned_df.columns],
        "rows_removed": int(df.shape[0] - cleaned_df.shape[0]),
        "preview": _safe(preview),
        "download_url": "/download-cleaned",
    })


@clean_bp.route("/download-cleaned", methods=["GET"])
def download_cleaned():
    from flask import send_file
    if not os.path.exists(CLEANED_FILENAME):
        return jsonify({"error": "No cleaned dataset available."}), 404
    return send_file(
        os.path.abspath(CLEANED_FILENAME),
        mimetype="text/csv",
        as_attachment=True,
        download_name="cleaned_dataset.csv",
    )
