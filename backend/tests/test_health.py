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


def test_cors_allows_configured_frontend_origin(client):
    response = client.get(
        "/api/health",
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.headers["Access-Control-Allow-Origin"] == "http://localhost:5173"


def test_cors_does_not_allow_unconfigured_origin(client):
    response = client.get(
        "/api/health",
        headers={"Origin": "https://example.com"},
    )

    assert "Access-Control-Allow-Origin" not in response.headers


def test_ollama_health_reports_available_model(client, monkeypatch):
    import requests

    captured = {}

    def fake_get(url, timeout):
        captured.update(url=url, timeout=timeout)
        return FakeResponse({"models": [{"name": "qwen3:8b"}]})

    monkeypatch.setattr(requests, "get", fake_get)

    response = client.get("/api/health/ollama")

    assert response.status_code == 200
    assert response.get_json()["data"]["model_available"] is True
    assert response.get_json()["data"]["model"] == "qwen3:8b"
    assert captured == {
        "url": "http://localhost:11434/api/tags",
        "timeout": 2,
    }


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
