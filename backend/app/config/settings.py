"""Environment-backed application settings."""

import os


def _as_bool(value):
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _as_positive_int(name, value):
    try:
        parsed = int(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{name} must be a positive integer.") from error
    if parsed <= 0:
        raise ValueError(f"{name} must be a positive integer.")
    return parsed


def load_settings():
    """Read settings from the process environment."""
    origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173",
    )
    return {
        "ENVIRONMENT": os.getenv("FLASK_ENV", "development"),
        "DEBUG": _as_bool(os.getenv("FLASK_DEBUG", "true")),
        "PORT": _as_positive_int("FLASK_PORT", os.getenv("FLASK_PORT", "5000")),
        "OLLAMA_BASE_URL": os.getenv(
            "OLLAMA_BASE_URL", "http://localhost:11434"
        ).rstrip("/"),
        "OLLAMA_MODEL": os.getenv("OLLAMA_MODEL", "qwen3:8b"),
        "OLLAMA_TIMEOUT": _as_positive_int(
            "OLLAMA_TIMEOUT", os.getenv("OLLAMA_TIMEOUT", "180")
        ),
        "MAX_MESSAGE_LENGTH": _as_positive_int(
            "MAX_MESSAGE_LENGTH", os.getenv("MAX_MESSAGE_LENGTH", "4000")
        ),
        "MAX_HISTORY_MESSAGES": _as_positive_int(
            "MAX_HISTORY_MESSAGES", os.getenv("MAX_HISTORY_MESSAGES", "20")
        ),
        "MAX_CONTENT_LENGTH": 1024 * 1024,
        "CORS_ORIGINS": [
            origin.strip()
            for origin in origins.split(",")
            if origin.strip()
        ],
    }
