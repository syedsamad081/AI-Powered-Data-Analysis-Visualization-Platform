"""
services/graph_recommender.py
Automatically detects suitable chart types based on column data types,
and returns chart images as base64-encoded PNGs generated with
Seaborn and Matplotlib.
"""

import io
import base64
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server-side rendering
import matplotlib.pyplot as plt
import seaborn as sns


# ── Theme & palette ───────────────────────────────────────────
DARK_BG = "#0D1424"
CARD_BG = "#111827"
GRID_COLOR = "#1e293b"
TEXT_COLOR = "#94a3b8"
TITLE_COLOR = "#e2e8f0"

PALETTE = [
    "#8b5cf6",  # violet
    "#06b6d4",  # cyan
    "#fb923c",  # orange
    "#34d399",  # emerald
    "#f87171",  # red
    "#fbbf24",  # amber
    "#a7f3d0",  # mint
    "#c4b5fd",  # lavender
]


def _apply_dark_theme():
    """Set a dark theme that matches the UI."""
    plt.rcParams.update({
        "figure.facecolor": DARK_BG,
        "axes.facecolor": CARD_BG,
        "axes.edgecolor": GRID_COLOR,
        "axes.labelcolor": TEXT_COLOR,
        "axes.grid": True,
        "grid.color": GRID_COLOR,
        "grid.alpha": 0.5,
        "xtick.color": TEXT_COLOR,
        "ytick.color": TEXT_COLOR,
        "text.color": TITLE_COLOR,
        "font.family": "sans-serif",
        "font.size": 10,
        "legend.facecolor": CARD_BG,
        "legend.edgecolor": GRID_COLOR,
        "legend.fontsize": 9,
        "legend.labelcolor": TEXT_COLOR,
    })


def _fig_to_base64(fig) -> str:
    """Convert a Matplotlib figure to a base64-encoded PNG data URI."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight",
                facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close(fig)
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def recommend(df: pd.DataFrame) -> list:
    """
    Analyse the DataFrame and return a list of recommended chart configs.
    Each config contains:
      - id, type, title, description
      - image: base64-encoded PNG data URI
    """
    _apply_dark_theme()
    sns.set_palette(PALETTE)

    charts = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    datetime_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()

    # ── Histograms for each numeric column ──────────────────
    for col in numeric_cols[:3]:
        values = df[col].dropna()
        if values.empty:
            continue

        fig, ax = plt.subplots(figsize=(7, 4))
        sns.histplot(values, bins=20, kde=True, color=PALETTE[0],
                     edgecolor="white", linewidth=0.5, alpha=0.7, ax=ax)
        ax.set_title(f"Distribution of {col}", fontsize=13, fontweight="bold",
                     color=TITLE_COLOR, pad=12)
        ax.set_xlabel(col, fontsize=10)
        ax.set_ylabel("Frequency", fontsize=10)

        charts.append({
            "id": f"hist_{col}",
            "type": "histogram",
            "title": f"Distribution of {col}",
            "description": f"Histogram with KDE showing value distribution of '{col}'.",
            "image": _fig_to_base64(fig),
        })

    # ── Bar chart: categorical vs numeric ───────────────────
    if categorical_cols and numeric_cols:
        cat_col = categorical_cols[0]
        num_col = numeric_cols[0]
        grouped = df.groupby(cat_col)[num_col].mean().dropna()
        if 1 < len(grouped) <= 30:
            grouped = grouped.sort_values(ascending=False)

            fig, ax = plt.subplots(figsize=(7, 4))
            sns.barplot(x=grouped.index, y=grouped.values,
                        palette=PALETTE, edgecolor="white", linewidth=0.5, ax=ax)
            ax.set_title(f"Average {num_col} by {cat_col}", fontsize=13,
                         fontweight="bold", color=TITLE_COLOR, pad=12)
            ax.set_xlabel(cat_col, fontsize=10)
            ax.set_ylabel(f"Avg {num_col}", fontsize=10)
            # Rotate x labels if many categories
            if len(grouped) > 6:
                ax.tick_params(axis="x", rotation=45)
            fig.tight_layout()

            charts.append({
                "id": f"bar_{cat_col}_{num_col}",
                "type": "bar",
                "title": f"Average {num_col} by {cat_col}",
                "description": f"Bar chart showing the average of '{num_col}' grouped by '{cat_col}'.",
                "image": _fig_to_base64(fig),
            })

    # ── Scatter plot: first two numeric columns ──────────────
    if len(numeric_cols) >= 2:
        x_col, y_col = numeric_cols[0], numeric_cols[1]
        sample = df[[x_col, y_col]].dropna().sample(min(300, len(df)), random_state=42)

        fig, ax = plt.subplots(figsize=(7, 4))
        sns.scatterplot(x=sample[x_col], y=sample[y_col],
                        color=PALETTE[2], alpha=0.6, edgecolor="white",
                        linewidth=0.3, s=40, ax=ax)
        ax.set_title(f"{x_col} vs {y_col}", fontsize=13, fontweight="bold",
                     color=TITLE_COLOR, pad=12)
        ax.set_xlabel(x_col, fontsize=10)
        ax.set_ylabel(y_col, fontsize=10)

        charts.append({
            "id": f"scatter_{x_col}_{y_col}",
            "type": "scatter",
            "title": f"{x_col} vs {y_col}",
            "description": f"Scatter plot showing relationship between '{x_col}' and '{y_col}'.",
            "image": _fig_to_base64(fig),
        })

    # ── Line chart: datetime index or first numeric as x ────
    if datetime_cols and numeric_cols:
        time_col = datetime_cols[0]
        val_col = numeric_cols[0]
        ts = df[[time_col, val_col]].dropna().sort_values(time_col).head(200)

        fig, ax = plt.subplots(figsize=(7, 4))
        sns.lineplot(x=ts[time_col], y=ts[val_col],
                     color=PALETTE[3], linewidth=2, ax=ax)
        ax.fill_between(ts[time_col], ts[val_col], alpha=0.15, color=PALETTE[3])
        ax.set_title(f"{val_col} over time ({time_col})", fontsize=13,
                     fontweight="bold", color=TITLE_COLOR, pad=12)
        ax.set_xlabel(time_col, fontsize=10)
        ax.set_ylabel(val_col, fontsize=10)
        fig.autofmt_xdate()

        charts.append({
            "id": f"line_{time_col}_{val_col}",
            "type": "line",
            "title": f"{val_col} over time ({time_col})",
            "description": f"Time series line chart of '{val_col}' across '{time_col}'.",
            "image": _fig_to_base64(fig),
        })

    # ── Pie chart: top categories of first categorical col ──
    if categorical_cols:
        cat_col = categorical_cols[0]
        vc = df[cat_col].value_counts().head(8)
        if 1 < len(vc) <= 8:
            fig, ax = plt.subplots(figsize=(6, 5))
            wedges, texts, autotexts = ax.pie(
                vc.values, labels=vc.index, autopct="%1.1f%%",
                colors=PALETTE[:len(vc)],
                wedgeprops={"edgecolor": DARK_BG, "linewidth": 2},
                textprops={"color": TEXT_COLOR, "fontsize": 9},
                pctdistance=0.75,
            )
            for t in autotexts:
                t.set_color("white")
                t.set_fontsize(8)
                t.set_fontweight("bold")
            ax.set_title(f"Proportion of {cat_col}", fontsize=13,
                         fontweight="bold", color=TITLE_COLOR, pad=12)

            charts.append({
                "id": f"pie_{cat_col}",
                "type": "pie",
                "title": f"Proportion of {cat_col}",
                "description": f"Pie chart of the top categories in '{cat_col}'.",
                "image": _fig_to_base64(fig),
            })

    # ── Correlation heatmap (if ≥3 numeric columns) ─────────
    if len(numeric_cols) >= 3:
        corr = df[numeric_cols].corr().round(3)

        fig, ax = plt.subplots(figsize=(8, 6))
        sns.heatmap(corr, annot=True, fmt=".2f", cmap="rocket_r",
                    linewidths=1, linecolor=DARK_BG,
                    cbar_kws={"shrink": 0.8},
                    annot_kws={"size": 8, "color": "white"},
                    ax=ax)
        ax.set_title("Correlation Heatmap", fontsize=13, fontweight="bold",
                     color=TITLE_COLOR, pad=12)
        ax.tick_params(axis="x", rotation=45)
        ax.tick_params(axis="y", rotation=0)
        fig.tight_layout()

        charts.append({
            "id": "heatmap_corr",
            "type": "heatmap",
            "title": "Correlation Heatmap",
            "description": "Pairwise Pearson correlation between all numeric columns.",
            "image": _fig_to_base64(fig),
        })

    return charts
