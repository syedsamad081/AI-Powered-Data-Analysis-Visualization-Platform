"""
routes/analyze.py  –  POST /analyze
Profiles the currently loaded DataFrame and returns statistics as JSON.
"""

from flask import Blueprint, request, jsonify
from services.data_processor import profile
from routes.upload import get_state

analyze_bp = Blueprint("analyze", __name__)


@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    state = get_state()
    df = state.get("cleaned_df")
    if df is None:
        df = state.get("df")

    if df is None:
        return jsonify({"error": "No dataset loaded. Please upload a file first."}), 400

    try:
        stats = profile(df)
    except Exception as e:
        return jsonify({"error": f"Profiling failed: {str(e)}"}), 500

    return jsonify(stats)
