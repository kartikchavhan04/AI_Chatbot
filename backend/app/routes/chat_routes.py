"""Chat API endpoint."""

from flask import Blueprint, current_app, request

from app.services.ollama_service import generate_chat_response
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
