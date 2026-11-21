"""Consistent JSON response helpers."""

from flask import jsonify


def success_response(data, message, status_code=200):
    """Create a standard success response."""
    return jsonify(
        {
            "success": True,
            "message": message,
            "data": data,
        }
    ), status_code


def error_response(message, code, status_code):
    """Create a standard error response without internal details."""
    return jsonify(
        {
            "success": False,
            "message": message,
            "error": {"code": code},
        }
    ), status_code
