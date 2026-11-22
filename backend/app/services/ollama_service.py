"""Ollama REST API integration."""

import requests
import json


class OllamaServiceError(Exception):
    """Base exception for failures communicating with Ollama."""


class OllamaUnavailable(OllamaServiceError):
    """Ollama could not be reached or returned an unsuccessful response."""


class OllamaTimeout(OllamaServiceError):
    """Ollama did not respond within the configured timeout."""


class OllamaModelNotFound(OllamaServiceError):
    """The configured model is not available in Ollama."""


class OllamaInvalidResponse(OllamaServiceError):
    """Ollama returned a response that does not match the expected format."""


def _base_url(config):
    return config["OLLAMA_BASE_URL"].rstrip("/")


def _timeout(config):
    return config["OLLAMA_TIMEOUT"]


def _get_models(config):
    """Fetch locally available Ollama model names."""
    try:
        response = requests.get(
            f"{_base_url(config)}/api/tags",
            timeout=_timeout(config),
        )
    except requests.Timeout as error:
        raise OllamaTimeout("Ollama request timed out.") from error
    except requests.RequestException as error:
        raise OllamaUnavailable("Ollama is unavailable.") from error

    if not response.ok:
        raise OllamaUnavailable("Ollama is unavailable.")

    try:
        body = response.json()
        models = body["models"]
        if not isinstance(models, list):
            raise TypeError("models must be a list")
        names = [
            model["name"]
            for model in models
            if isinstance(model, dict) and isinstance(model.get("name"), str)
        ]
    except (ValueError, KeyError, TypeError) as error:
        raise OllamaInvalidResponse("Ollama returned an invalid response.") from error

    return names


def check_model_available(config):
    """Check Ollama connectivity and confirm the configured model is installed."""
    model_name = config["OLLAMA_MODEL"]
    available_models = _get_models(config)
    if model_name not in available_models:
        raise OllamaModelNotFound("The configured Ollama model is not installed.")
    return {"model": model_name}


def list_available_models(config):
    """Return installed Ollama model names."""
    names = _get_models(config)
    return sorted(set(names))


def stream_chat_response(payload, config):
    """Stream text chunks from Ollama as server-sent events."""
    messages = list(payload["history"])
    messages.append({"role": "user", "content": payload["message"]})
    model = payload.get("model") or config["OLLAMA_MODEL"]
    request_body = {
        "model": model,
        "messages": messages,
        "stream": True,
    }

    try:
        response = requests.post(
            f"{_base_url(config)}/api/chat",
            json=request_body,
            timeout=_timeout(config),
            stream=True,
        )
    except requests.Timeout as error:
        raise OllamaTimeout("Ollama request timed out.") from error
    except requests.RequestException as error:
        raise OllamaUnavailable("Ollama is unavailable.") from error

    if response.status_code == 404:
        raise OllamaModelNotFound("The configured Ollama model is not installed.")
    if not response.ok:
        raise OllamaUnavailable("Ollama could not process the chat request.")

    try:
        for line in response.iter_lines(decode_unicode=True):
            if not line:
                continue
            body = json.loads(line)
            content = body.get("message", {}).get("content", "")
            if content:
                yield content
            if body.get("done") is True:
                break
    except (ValueError, TypeError) as error:
        raise OllamaInvalidResponse("Ollama returned an invalid response.") from error


def generate_chat_response(payload, config):
    """Send validated conversation messages to Ollama and return its text."""
    messages = list(payload["history"])
    messages.append({"role": "user", "content": payload["message"]})
    request_body = {
        "model": payload.get("model") or config["OLLAMA_MODEL"],
        "messages": messages,
        "stream": False,
    }

    try:
        response = requests.post(
            f"{_base_url(config)}/api/chat",
            json=request_body,
            timeout=_timeout(config),
        )
    except requests.Timeout as error:
        raise OllamaTimeout("Ollama request timed out.") from error
    except requests.RequestException as error:
        raise OllamaUnavailable("Ollama is unavailable.") from error

    if response.status_code == 404:
        raise OllamaModelNotFound("The configured Ollama model is not installed.")
    if not response.ok:
        raise OllamaUnavailable("Ollama could not process the chat request.")

    try:
        body = response.json()
        message = body["message"]
        content = message["content"]
        if not isinstance(content, str) or not content.strip():
            raise TypeError("assistant content must be a non-empty string")
    except (ValueError, KeyError, TypeError) as error:
        raise OllamaInvalidResponse("Ollama returned an invalid response.") from error

    return content
