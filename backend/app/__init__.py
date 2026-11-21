"""Flask application factory."""

from dotenv import load_dotenv
from flask import Flask
from werkzeug.exceptions import HTTPException

from app.config.settings import load_settings
from app.error_handlers import register_error_handlers
from app.extensions import cors
from app.routes.chat_routes import chat_bp
from app.routes.health_routes import health_bp


def create_app(test_config=None):
    """Create and configure a Flask application instance."""
    load_dotenv()
    app = Flask(__name__)
    app.config.from_mapping(load_settings())

    if test_config:
        app.config.update(test_config)

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
    )
    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    register_error_handlers(app)

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        from app.utils.response_handler import error_response

        messages = {
            400: "Invalid request.",
            404: "The requested endpoint was not found.",
            405: "The HTTP method is not allowed for this endpoint.",
            413: "The request body is too large.",
            415: "Content-Type must be application/json.",
        }
        return error_response(
            messages.get(error.code, "The request could not be processed."),
            "http_error",
            error.code or 500,
        )

    return app
