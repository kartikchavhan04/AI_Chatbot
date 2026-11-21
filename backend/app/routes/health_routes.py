"""Health check endpoints."""

from flask import Blueprint, current_app

from app.services.ollama_service import check_model_available
from app.utils.response_handler import success_response

health_bp = Blueprint("health", __name__)


@health_bp.get("")
def health():
    """Report that the Flask API process is responsive."""
    return success_response(
        {"status": "healthy"},
        "Backend is healthy.",
    )


@health_bp.get("/ollama")
def ollama_health():
    """Report Ollama reachability and configured model availability."""
    model_status = check_model_available(current_app.config)
    return success_response(
        {
            "status": "healthy",
            "ollama_available": True,
            "model_available": True,
            "model": model_status["model"],
        },
        "Ollama and the configured model are available.",
    )
