"""
routes/report.py  –  POST /generate-report
Combines dataset profile + chart metadata and calls Gemini to
generate a structured Markdown report.
"""

from flask import Blueprint, request, jsonify
from services.data_processor import profile
from services.graph_recommender import recommend
from services.ai_report import generate
from routes.upload import get_state

report_bp = Blueprint("report", __name__)


@report_bp.route("/generate-report", methods=["POST"])
def generate_report():
    state = get_state()
    df = state.get("cleaned_df")
    if df is None:
        df = state.get("df")

    if df is None:
        return jsonify({"error": "No dataset loaded. Please upload a file first."}), 400

    try:
        prof = profile(df)
        charts = recommend(df)
        # Strip heavy chart data before sending to Gemini – only pass metadata
        charts_meta = [
            {"type": c["type"], "title": c["title"], "description": c["description"]}
            for c in charts
        ]
        report_md = generate(prof, charts_meta)
    except Exception as e:
        return jsonify({"error": f"Report generation failed: {str(e)}"}), 500

    return jsonify({
        "report": report_md,
        "profile_summary": {
            "rows": prof["rows"],
            "cols": prof["cols"],
            "numeric_columns": prof["numeric_columns"],
            "categorical_columns": prof["categorical_columns"],
            "duplicate_rows": prof["duplicate_rows"],
        },
    })
