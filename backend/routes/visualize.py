"""
routes/visualize.py  –  POST /visualize
Runs the graph recommender against the (cleaned) DataFrame
and returns all chart configs as JSON.
"""

from flask import Blueprint, request, jsonify
from services.graph_recommender import recommend
from routes.upload import get_state

visualize_bp = Blueprint("visualize", __name__)


@visualize_bp.route("/visualize", methods=["POST"])
def visualize():
    state = get_state()
    # Prefer the cleaned DataFrame if it exists
    df = state.get("cleaned_df")
    if df is None:
        df = state.get("df")

    if df is None:
        return jsonify({"error": "No dataset loaded. Please upload a file first."}), 400

    try:
        charts = recommend(df)
    except Exception as e:
        return jsonify({"error": f"Visualisation failed: {str(e)}"}), 500

    return jsonify({
        "chart_count": len(charts),
        "charts": charts,
    })
