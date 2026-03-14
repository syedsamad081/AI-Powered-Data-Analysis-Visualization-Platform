"""
routes/upload.py  –  POST /upload
Accepts a multipart file upload, saves it, parses it into a DataFrame,
stores the path in-memory (session-like global), and returns a JSON preview.
"""

import os
import json
import numpy as np
import pandas as pd
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from services.file_handler import parse_file

upload_bp = Blueprint("upload", __name__)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls", "docx"}

# Simple in-process state store (adequate for single-user dev use)
# In production, replace with Redis or a database session.
_state = {}


def get_state():
    return _state


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _make_serialisable(obj):
    """Recursively convert numpy types to Python native types."""
    if isinstance(obj, dict):
        return {k: _make_serialisable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_make_serialisable(i) for i in obj]
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return None if np.isnan(obj) else float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if pd.isna(obj) if not isinstance(obj, (list, dict, np.ndarray)) else False:
        return None
    return obj


@upload_bp.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not _allowed(file.filename):
        return jsonify({"error": f"Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        df = parse_file(filepath)
    except Exception as e:
        return jsonify({"error": f"Failed to parse file: {str(e)}"}), 422

    # Persist state for subsequent endpoints
    _state["filepath"] = filepath
    _state["df"] = df
    _state["cleaned_df"] = None

    # Build preview (first 10 rows, NaN-safe)
    preview_df = df.head(10).where(pd.notnull(df.head(10)), None)
    preview = preview_df.to_dict(orient="records")

    return jsonify({
        "message": "File uploaded successfully",
        "filename": filename,
        "rows": int(df.shape[0]),
        "cols": int(df.shape[1]),
        "columns": df.columns.tolist(),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "preview": _make_serialisable(preview),
    })
