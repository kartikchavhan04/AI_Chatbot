"""Health endpoint tests."""


class FakeResponse:
    def __init__(self, body, status_code=200):
        self._body = body
        self.status_code = status_code
        self.ok = 200 <= status_code < 400

    def json(self):
        return self._body


def test_backend_health(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json()["data"]["status"] == "healthy"


def test_ollama_health_reports_available_model(client, monkeypatch):
    import requests

    monkeypatch.setattr(
        requests,
        "get",
        lambda *args, **kwargs: FakeResponse(
            {"models": [{"name": "qwen3:8b"}]}
        ),
    )

    response = client.get("/api/health/ollama")

    assert response.status_code == 200
    assert response.get_json()["data"]["model_available"] is True
    assert response.get_json()["data"]["model"] == "qwen3:8b"


def test_ollama_health_reports_missing_model(client, monkeypatch):
    import requests

    monkeypatch.setattr(
        requests,
        "get",
        lambda *args, **kwargs: FakeResponse({"models": [{"name": "other:latest"}]}),
    )

    response = client.get("/api/health/ollama")

    assert response.status_code == 503
    assert response.get_json()["error"]["code"] == "model_not_found"
