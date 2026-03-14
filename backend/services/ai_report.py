"""
services/ai_report.py
Generates a structured AI report using the Google Gemini API.
"""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


def generate(profile: dict, charts: list) -> str:
    """
    Build a prompt from the dataset profile and chart insights,
    then call Gemini to generate a structured Markdown report.

    Args:
        profile: Output from data_processor.profile()
        charts:  Output from graph_recommender.recommend() (metadata only)

    Returns:
        A Markdown-formatted report string.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        return _fallback_report(profile)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    # Build a concise summary for the prompt
    chart_summaries = "\n".join(
        f"- {c['type'].title()}: {c['title']} — {c['description']}"
        for c in charts
    )

    missing_summary = ", ".join(
        f"{col}: {info['pct']}% missing"
        for col, info in profile.get("missing_values", {}).items()
        if info["count"] > 0
    ) or "No missing values"

    prompt = f"""
You are an expert Data Analyst and Business Strategist. A user has uploaded a dataset with the following properties:

**Dataset Summary:**
- Rows: {profile.get('rows', 'N/A')}
- Columns: {profile.get('cols', 'N/A')}
- Numeric Columns: {', '.join(profile.get('numeric_columns', [])) or 'None'}
- Categorical Columns: {', '.join(profile.get('categorical_columns', [])) or 'None'}
- Duplicate Rows: {profile.get('duplicate_rows', 0)}
- Missing Values: {missing_summary}

**Statistical Highlights (from describe):**
{json.dumps(profile.get('describe', {}), indent=2)[:2000]}

**Visualizations & Chart Analysis Context:**
{chart_summaries or 'No charts generated.'}

Based on this information, generate a professional, structured Business & Data Analysis Report in Markdown format. The report MUST be heavily tailored toward actionable business insights, decision-making, and ROI, especially focusing on **Sales, Revenue, or Performance** if those metrics exist in the dataset.

Include the following sections:

# Executive Summary
Briefly summarize the dataset's purpose, overall health, and the single most important takeaway for a business executive or sales manager.

# Key Business Insights & Trends
List 5–7 crucial insights derived from the statistics and visualizations. Frame these not just as numbers, but as business realities (e.g., instead of "Column X has a high mean," write "Sales in Category X are driving the majority of revenue").

# Visualization Analysis
Directly interpret the "Recommended Visualizations" provided above. Explain what these specific charts mean for the business and what hidden patterns they reveal (e.g., seasonality, top performers, bottlenecks).

# Data Quality & Risk Factors
Note any data quality issues (missing data, potential outliers) and explain how they might skew business decisions or forecasting if left unaddressed.

# Strategic Recommendations
Provide 4–6 highly actionable recommendations. What should the business or sales team **do next** based on this data? Provide concrete strategies for growth, optimization, or risk mitigation.

Keep the tone professional, persuasive, and concise. Use bullet points and bold text to make it easily skimmable for stakeholders.
"""

    response = model.generate_content(prompt)
    return response.text


def _fallback_report(profile: dict) -> str:
    """
    Returns a basic auto-generated report when no Gemini API key is configured.
    """
    rows = profile.get("rows", "N/A")
    cols = profile.get("cols", "N/A")
    numeric = profile.get("numeric_columns", [])
    categorical = profile.get("categorical_columns", [])
    duplicates = profile.get("duplicate_rows", 0)

    missing_cols = [
        col for col, info in profile.get("missing_values", {}).items()
        if info["count"] > 0
    ]

    return f"""# Dataset Overview

This dataset contains **{rows} rows** and **{cols} columns**.
- **Numeric columns ({len(numeric)}):** {', '.join(numeric) or 'None'}
- **Categorical columns ({len(categorical)}):** {', '.join(categorical) or 'None'}

---

# Key Insights

- The dataset has **{rows}** total records across **{cols}** features.
- There are **{duplicates}** duplicate rows detected.
- Missing data present in: {', '.join(missing_cols) if missing_cols else 'No columns have missing data — dataset is complete.'}
- Numeric features available for statistical modelling: {', '.join(numeric) or 'None identified.'}

---

# Trends & Patterns

> ⚠️ **AI report generation is disabled.** Add your `GEMINI_API_KEY` to `backend/.env` to enable full Gemini-powered analysis.

---

# Observations

- Review missing value columns: {', '.join(missing_cols) if missing_cols else 'None.'}
- Consider removing or imputing null values before modelling.
- Duplicate rows ({duplicates}) should be removed to prevent data leakage.

---

# Recommendations

1. **Clean the data** using the Data Cleaning panel before analysis.
2. **Explore correlations** between numeric columns using the heatmap visualization.
3. **Encode categorical columns** if planning to use ML models.
4. **Add your Gemini API key** to `backend/.env` to get a full AI-generated report.
5. **Export the cleaned dataset** as CSV for downstream analysis.
"""
