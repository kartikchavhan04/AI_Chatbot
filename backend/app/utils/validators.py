"""Validation for incoming API payloads."""

from uuid import uuid4

from app.utils.errors import ApiError


def validate_chat_payload(payload, max_message_length, max_history_messages):
    """Validate supported chat fields and return normalized values."""
    if not isinstance(payload, dict):
        raise ApiError("The JSON body must be an object.")

    allowed_fields = {"message", "conversation_id", "history"}
    if set(payload) - allowed_fields:
        raise ApiError("The request contains unsupported fields.")

    message = payload.get("message")
    if not isinstance(message, str) or not message.strip():
        raise ApiError("Message must be a non-empty string.")
    message = message.strip()
    if len(message) > max_message_length:
        raise ApiError(
            f"Message must not exceed {max_message_length} characters.",
            "message_too_long",
            413,
        )

    conversation_id = payload.get("conversation_id")
    if conversation_id is not None:
        if (
            not isinstance(conversation_id, str)
            or not conversation_id.strip()
            or len(conversation_id) > 128
        ):
            raise ApiError("conversation_id must be a non-empty string of at most 128 characters.")
        conversation_id = conversation_id.strip()
    else:
        conversation_id = str(uuid4())

    history = payload.get("history", [])
    if not isinstance(history, list):
        raise ApiError("history must be a list of user and assistant messages.")
    if len(history) > max_history_messages:
        raise ApiError(
            f"history must contain no more than {max_history_messages} messages.",
            "history_too_long",
            413,
        )

    validated_history = []
    for item in history:
        if not isinstance(item, dict) or set(item) != {"role", "content"}:
            raise ApiError("Each history item must contain only role and content.")
        role = item["role"]
        content = item["content"]
        if not isinstance(role, str) or role not in {"user", "assistant"}:
            raise ApiError("History roles must be user or assistant.")
        if not isinstance(content, str) or not content.strip():
            raise ApiError("History content must be a non-empty string.")
        content = content.strip()
        if len(content) > max_message_length:
            raise ApiError(
                f"Each history message must not exceed {max_message_length} characters.",
                "history_message_too_long",
                413,
            )
        validated_history.append({"role": role, "content": content})

    return {
        "message": message,
        "conversation_id": conversation_id,
        "history": validated_history,
    }
