"""Centralized exception-to-JSON mappings."""

from flask import current_app

from app.services.ollama_service import (
    OllamaInvalidResponse,
    OllamaModelNotFound,
    OllamaServiceError,
    OllamaTimeout,
    OllamaUnavailable,
)
from app.utils.errors import ApiError
from app.utils.response_handler import error_response


def register_error_handlers(app):
    """Register safe API error handlers on an application instance."""

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        return error_response(error.message, error.code, error.status_code)

    @app.errorhandler(OllamaTimeout)
    def handle_ollama_timeout(_error):
        return error_response("Ollama did not respond in time.", "ollama_timeout", 504)

    @app.errorhandler(OllamaModelNotFound)
    def handle_model_not_found(_error):
        return error_response(
            "The configured Ollama model is not available.",
            "model_not_found",
            503,
        )

    @app.errorhandler(OllamaInvalidResponse)
    def handle_invalid_ollama_response(_error):
        return error_response(
            "Ollama returned an unexpected response.",
            "ollama_invalid_response",
            502,
        )

    @app.errorhandler(OllamaUnavailable)
    def handle_ollama_unavailable(_error):
        return error_response("Ollama is unavailable.", "ollama_unavailable", 503)

    @app.errorhandler(OllamaServiceError)
    def handle_ollama_error(_error):
        return error_response(
            "The Ollama service could not complete the request.",
            "ollama_error",
            502,
        )

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        current_app.logger.exception("Unhandled API error: %s", error)
        return error_response(
            "An unexpected server error occurred.",
            "internal_server_error",
            500,
        )
