# Local AI Chatbot Backend

A modular Flask API that sends validated chat requests to a locally running
Ollama server. The default model is `qwen3:8b`. Ollama remains a local backend
dependency; the browser/client communicates with this API, not directly with
Ollama.

## Architecture

The application uses a Flask application factory and blueprints. Routes validate
and dispatch requests, while `ollama_service.py` owns Ollama connectivity,
timeouts, model checks, and response parsing. Conversation state is not stored
on the server: clients may send a bounded `history` list on each request.

```text
backend/
├── app/
│   ├── config/       Environment-backed settings
│   ├── routes/       Health and chat blueprints
│   ├── services/     Ollama REST integration
│   ├── utils/        Validation, errors, and JSON responses
│   ├── __init__.py   Application factory
│   ├── error_handlers.py
│   └── extensions.py
├── tests/            Mocked API tests
├── .env              Local settings (ignored by Git)
├── .env.example      Settings template
├── .gitignore
├── conftest.py
├── requirements.txt
└── run.py            Development server entry point
```

## Requirements and installation (Windows CMD)

Install Python 3.10 or later and Ollama. From a **Command Prompt**:

```cmd
cd /d C:\Webdev\AI-CHATBOT\backend
py -3 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
```

If `.env` already exists, `copy` asks before overwriting it; keep the existing
file unless you intend to reset local settings.

## Configuration

Settings are loaded from environment variables (with `.env` loaded for local
development):

| Variable | Default | Description |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Local Ollama URL |
| `OLLAMA_MODEL` | `qwen3:8b` | Model tag to use |
| `FLASK_ENV` | `development` | Environment label |
| `FLASK_DEBUG` | `True` | Enables Flask debug mode for local development |
| `FLASK_PORT` | `5000` | Development server port |
| `OLLAMA_TIMEOUT` | `180` | Ollama request timeout in seconds |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed browser origins |
| `MAX_MESSAGE_LENGTH` | `4000` | Maximum characters in a chat/history message |
| `MAX_HISTORY_MESSAGES` | `20` | Maximum prior messages sent with a request |

Set `FLASK_DEBUG=False` outside local development. Set `CORS_ORIGINS` to the
exact trusted frontend origin(s) before deployment; do not use `*` for a
credentialed or private application.

## Start Ollama and the Flask API

In one CMD window, ensure Ollama is running and the model is installed:

```cmd
ollama serve
ollama pull qwen3:8b
```

If Ollama is already running as a service, only the model command is needed.
In a second CMD window:

```cmd
cd /d C:\Webdev\AI-CHATBOT\backend
.venv\Scripts\activate
python run.py
```

The development server binds to `127.0.0.1`, not a public interface. Do not
expose Ollama's port `11434` publicly. For a Linux production deployment, use
Gunicorn, for example:

```sh
gunicorn --bind 127.0.0.1:5000 --workers 2 run:app
```

Gunicorn is intended for Unix-like production environments and is not the
Windows development server.

## API endpoints

### `GET /api/health`

Returns process health:

```json
{
  "success": true,
  "message": "Backend is healthy.",
  "data": {"status": "healthy"}
}
```

### `GET /api/health/ollama`

Calls Ollama's `GET /api/tags` endpoint and verifies the configured model. A
missing model or unavailable Ollama service returns a structured non-2xx error.

### `POST /api/chat`

Request body:

```json
{
  "message": "Explain Python",
  "conversation_id": "optional-conversation-id",
  "history": [
    {"role": "user", "content": "What is a programming language?"},
    {"role": "assistant", "content": "A system for writing instructions for computers."}
  ]
}
```

`conversation_id` and `history` are optional. History items must have exactly
`role` and `content`; roles are limited to `user` and `assistant`. The API does
not accept client-supplied system messages or arbitrary Ollama parameters.
Clients should resend prior turns as `history` to preserve context. When no
conversation ID is supplied, the API generates one.

Successful response:

```json
{
  "success": true,
  "message": "Response generated successfully.",
  "data": {
    "conversation_id": "example-id",
    "user_message": "Explain Python",
    "assistant_message": "Python is..."
  }
}
```

Errors use the same structure and a meaningful HTTP status:

```json
{
  "success": false,
  "message": "Ollama is unavailable.",
  "error": {"code": "ollama_unavailable"}
}
```

## Test with Postman or CMD

In Postman, send a `POST` to `http://127.0.0.1:5000/api/chat`, select
**Body → raw → JSON**, and use the request body above.

Windows CMD `curl.exe` examples:

```cmd
curl.exe http://127.0.0.1:5000/api/health
curl.exe http://127.0.0.1:5000/api/health/ollama
curl.exe -X POST http://127.0.0.1:5000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"Explain Python\"}"
```

## Automated tests

Activate the virtual environment and run:

```cmd
cd /d C:\Webdev\AI-CHATBOT\backend
.venv\Scripts\activate
python -m pytest -q
```

All Ollama requests are mocked in tests; no Ollama process or model inference is
required.
