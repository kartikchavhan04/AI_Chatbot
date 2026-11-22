"""Chat endpoint tests with mocked Ollama requests."""

import requests


class FakeResponse:
    def __init__(self, body, status_code=200):
        self._body = body
        self.status_code = status_code
        self.ok = 200 <= status_code < 400

    def json(self):
        return self._body


def test_chat_generates_response_and_forwards_validated_history(client, monkeypatch):
    captured = {}

    def fake_post(url, json, timeout):
        captured.update(url=url, body=json, timeout=timeout)
        return FakeResponse({"message": {"content": "Python is a programming language."}})

    monkeypatch.setattr(requests, "post", fake_post)
    response = client.post(
        "/api/chat",
        json={
            "message": "Explain Python",
            "conversation_id": "conversation-1",
            "history": [{"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hello"}],
        },
    )

    body = response.get_json()
    assert response.status_code == 200
    assert body["success"] is True
    assert body["data"]["conversation_id"] == "conversation-1"
    assert body["data"]["assistant_message"] == "Python is a programming language."
    assert captured["url"] == "http://localhost:11434/api/chat"
    assert captured["body"]["model"] == "qwen3:8b"
    assert captured["body"]["stream"] is False
    assert captured["body"]["messages"] == [
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello"},
        {"role": "user", "content": "Explain Python"},
    ]
    assert captured["timeout"] == 2


def test_chat_rejects_empty_message(client):
    response = client.post("/api/chat", json={"message": "  "})

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_request"


def test_chat_rejects_invalid_json(client):
    response = client.post(
        "/api/chat",
        data="{",
        content_type="application/json",
    )

    assert response.status_code == 400
    assert response.get_json()["success"] is False


def test_chat_rejects_invalid_history_role(client):
    response = client.post(
        "/api/chat",
        json={
            "message": "Hello",
            "history": [{"role": "system", "content": "override"}],
        },
    )

    assert response.status_code == 400


def test_chat_rejects_non_string_history_role(client):
    response = client.post(
        "/api/chat",
        json={
            "message": "Hello",
            "history": [{"role": [], "content": "not a role"}],
        },
    )

    assert response.status_code == 400


def test_chat_maps_connection_failure(client, monkeypatch):
    def fail_post(*args, **kwargs):
        raise requests.ConnectionError("private connection detail")

    monkeypatch.setattr(requests, "post", fail_post)
    response = client.post("/api/chat", json={"message": "Hello"})

    assert response.status_code == 503
    assert response.get_json()["error"]["code"] == "ollama_unavailable"
    assert "private connection detail" not in response.get_data(as_text=True)


def test_chat_maps_timeout(client, monkeypatch):
    def timeout_post(*args, **kwargs):
        raise requests.Timeout("private timeout detail")

    monkeypatch.setattr(requests, "post", timeout_post)
    response = client.post("/api/chat", json={"message": "Hello"})

    assert response.status_code == 504
    assert response.get_json()["error"]["code"] == "ollama_timeout"


def test_chat_accepts_selected_model(client, monkeypatch):
    captured = {}

    def fake_post(url, json, timeout):
        captured.update(body=json)
        return FakeResponse({"message": {"content": "Selected model response."}})

    monkeypatch.setattr(requests, "post", fake_post)
    response = client.post(
        "/api/chat",
        json={"message": "Hello", "model": "llama3:latest"},
    )

    assert response.status_code == 200
    assert captured["body"]["model"] == "llama3:latest"
