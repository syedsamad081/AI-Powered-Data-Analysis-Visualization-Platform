# AI-Powered Data Analysis & Visualization Platform

An intelligent, full-stack web application designed to automate data analysis, cleaning, visualization, and report generation. Users can upload their datasets (CSV/Excel) and get instant, AI-driven insights powered by the Google Gemini API.

## 🚀 Features

* **Data Upload & Handling**: Securely upload and parse CSV and Excel datasets.
* **Automated Data Cleaning**: Automatically handles missing values, removes duplicates, and standardizes data formats.
* **Exploratory Data Analysis (EDA)**: Instantly generates statistical summaries and extracts key metrics from the data.
* **Smart Visualization**: Recommends and renders the best charts/graphs (bar, line, pie, scatter) based on the dataset's structure using Matplotlib and Seaborn
* **AI-Generated Reports**: Utilizes the Google Gemini API to generate comprehensive, human-readable insights and summaries based on the analyzed data.

## 🛠️ Tech Stack

**Frontend:**
* React.js (with Vite for fast bundling)
* Tailwind CSS (Styling)
* React Router (Navigation)
* Matplotlib and Seaborn (Data Visualization)
* Zod (Schema Validation)

**Backend:**
* Python & Flask
* Pandas & NumPy (Data Processing & Cleaning)
* Google Generative AI (Gemini API for AI Reports)
* Werkzeug (File handling)

## 📂 Project Structure

```text
├── backend/
│   ├── .env.example         # Environment variables template
│   ├── app.py               # Main Flask application entry point
│   ├── requirements.txt     # Python dependencies
│   ├── routes/              # API Endpoints (analyze, clean, report, upload, visualize)
│   └── services/            # Core logic (ai_report, data_processor, file_handler, graph_recommender)
│
└── frontend/
    ├── public/              # Static public assets
    ├── src/
    │   ├── assets/          # Images, icons, etc.
    │   ├── components/      # Reusable React components
    │   └── pages/           # Main application pages
    ├── package.json         # Node.js dependencies
    └── tailwind.config.js   # Tailwind CSS configuration
