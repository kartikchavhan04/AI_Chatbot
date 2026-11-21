"""Shared pytest fixtures."""

import pytest

from app import create_app


@pytest.fixture
def client():
    app = create_app(
        {
            "TESTING": True,
            "DEBUG": False,
            "PORT": 5000,
            "OLLAMA_BASE_URL": "http://localhost:11434",
            "OLLAMA_MODEL": "qwen3:8b",
            "OLLAMA_TIMEOUT": 2,
            "MAX_MESSAGE_LENGTH": 100,
            "MAX_HISTORY_MESSAGES": 3,
            "CORS_ORIGINS": ["http://localhost:5173"],
        }
    )
    with app.test_client() as test_client:
        yield test_client
