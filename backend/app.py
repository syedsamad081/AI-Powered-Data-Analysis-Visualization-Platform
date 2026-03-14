"""
app.py – Flask application entry point.
Registers all route blueprints, configures CORS, and sets up the uploads directory.
"""

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import route blueprints
from routes.upload import upload_bp
from routes.analyze import analyze_bp
from routes.clean import clean_bp
from routes.visualize import visualize_bp
from routes.report import report_bp

def create_app():
    app = Flask(__name__)
    
    # Allow requests from any origin for development
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Ensure the uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    
    # Register all blueprints with their URL prefixes
    app.register_blueprint(upload_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(clean_bp)
    app.register_blueprint(visualize_bp)
    app.register_blueprint(report_bp)
    
    @app.route("/health")
    def health():
        return {"status": "ok", "message": "AI Data Platform API is running"}
    
    return app


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app = create_app()
    app.run(debug=False, port=port)
