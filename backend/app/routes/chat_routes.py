"""Chat API endpoint."""

from flask import Blueprint, current_app, request, Response

from app.services.ollama_service import (
    generate_chat_response,
    stream_chat_response,
    OllamaModelNotFound,
    OllamaTimeout,
    OllamaUnavailable,
)
from app.utils.response_handler import success_response
from app.utils.validators import validate_chat_payload

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("")
def chat():
    """Validate a chat request and return the model response."""
    payload = validate_chat_payload(
        request.get_json(),
        max_message_length=current_app.config["MAX_MESSAGE_LENGTH"],
        max_history_messages=current_app.config["MAX_HISTORY_MESSAGES"],
    )
    result = generate_chat_response(payload, current_app.config)
    return success_response(
        {
            "conversation_id": payload["conversation_id"],
            "user_message": payload["message"],
            "assistant_message": result,
        },
        "Response generated successfully.",
    )


@chat_bp.post("/stream")
def chat_stream():
    """Stream a chat response as server-sent events."""
    payload = validate_chat_payload(
        request.get_json(),
        max_message_length=current_app.config["MAX_MESSAGE_LENGTH"],
        max_history_messages=current_app.config["MAX_HISTORY_MESSAGES"],
    )

    def events():
        try:
            for chunk in stream_chat_response(payload, current_app.config):
                yield f"data: {__import__('json').dumps({'content': chunk, 'done': False}, ensure_ascii=False)}\n\n"
            yield 'data: {"content":"","done":true}\n\n'
        except OllamaTimeout:
            yield 'data: {"error":"Ollama did not respond in time.","done":true}\n\n'
        except OllamaModelNotFound:
            yield 'data: {"error":"The configured Ollama model is not available.","done":true}\n\n'
        except OllamaUnavailable:
            yield 'data: {"error":"Ollama is unavailable.","done":true}\n\n'
        except Exception:
            yield 'data: {"error":"The Ollama service could not complete the request.","done":true}\n\n'

    return Response(
        events(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
