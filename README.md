# Local AI Chatbot

A local chatbot built from a React/Vite frontend, a Flask API, and an Ollama
server running the `qwen3:8b` model. The browser only communicates with Flask;
only Flask makes requests to Ollama. Ollama is not deployed or exposed by this
project.

## Architecture

```text
Browser (React, http://localhost:5173)
    | POST /api/chat
    v
Flask (http://127.0.0.1:5000)
    | POST /api/chat
    v
Ollama (http://localhost:11434, local machine only)
    | qwen3:8b
    v
Flask response -> React chat UI
```

Flask accepts a message and bounded conversation history, validates them,
forwards user/assistant turns to Ollama, then returns the generated text. Chat
history is stored in the browser's local storage; Flask does not persist
conversations.

## Technologies and layout

- **Frontend:** React 18, Vite, Tailwind CSS, Axios
- **Backend:** Python 3.10+, Flask, Flask-CORS, Requests
- **Local model runtime:** Ollama with `qwen3:8b`

```text
backend/
  app/
    config/       Environment settings
    routes/       Chat and health API routes
    services/     Ollama HTTP client and response parsing
    utils/        Request validation and JSON responses
  tests/          Flask API tests (Ollama calls mocked)
  run.py          Local Flask entry point
  requirements.txt
frontend/
  src/
    components/   Chat UI
    hooks/        Conversation and request state
    pages/        Chat page and connection status
    services/     Axios client for Flask
    utils/        Browser conversation storage and helpers
  package.json
```

## Prerequisites

- Windows 10/11
- Python 3.10 or later
- Node.js 20 LTS or later and npm
- Ollama for Windows
- The `qwen3:8b` model already installed in Ollama

Do not expose port `11434` to the network. The Flask development server binds
to `127.0.0.1`.

## Configuration

Copy `backend\.env.example` to `backend\.env` for local settings. Copy
`frontend\.env.example` to `frontend\.env`. Keep local `.env` files out of
version control and do not put secrets in Vite environment variables.

| Variable | Default | Purpose |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Local Ollama API base URL |
| `OLLAMA_MODEL` | `qwen3:8b` | Model tag requested by Flask |
| `OLLAMA_TIMEOUT` | `180` | Ollama HTTP timeout, seconds |
| `FLASK_PORT` | `5000` | Flask development port |
| `FLASK_DEBUG` | `True` | Flask development debug mode; disable outside local development |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated exact browser origins allowed by Flask |
| `MAX_MESSAGE_LENGTH` | `4000` | Maximum characters per message |
| `MAX_HISTORY_MESSAGES` | `20` | Maximum prior turns sent to Ollama |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Flask API base URL used by the browser |

Set `CORS_ORIGINS` to the exact trusted frontend origin(s) when changing
environments. Do not configure wildcard CORS for deployment.

## Run locally (Windows Command Prompt)

### 1. Prepare and start Flask

```cmd
cd /d C:\Webdev\AI-CHATBOT\backend
py -3 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
python run.py
```

If `backend\.env` already exists, keep it rather than overwriting your local
configuration.

### 2. Verify Ollama

Ollama normally runs as a Windows service. Open a separate Command Prompt:

```cmd
ollama list
ollama show qwen3:8b
curl.exe http://localhost:11434/api/tags
```

If the model is missing, install the required model once:

```cmd
ollama pull qwen3:8b
```

No other model is needed. If Ollama is not running as a service, start it in a
separate terminal with `ollama serve`.

### 3. Prepare and start React

```cmd
cd /d C:\Webdev\AI-CHATBOT\frontend
npm install
copy .env.example .env
npm run dev
```

Vite listens at `http://localhost:5173` and fails rather than silently switching
ports if that port is already in use. Open that URL in a browser.

### 4. Check the API and send a chat message

With Flask and Ollama running, use another Command Prompt:

```cmd
curl.exe http://localhost:5000/api/health
curl.exe http://localhost:5000/api/health/ollama
curl.exe -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"Hello\"}"
```

The chat response contains `data.assistant_message`. In the browser, send
multiple messages in the same conversation to include earlier turns as history.
The header displays backend and Ollama/model status and refreshes it
automatically.

## API endpoints

| Method | URL | Purpose |
| --- | --- | --- |
| `GET` | `http://localhost:5000/api/health` | Flask process health |
| `GET` | `http://localhost:5000/api/health/ollama` | Ollama connectivity and configured-model check |
| `POST` | `http://localhost:5000/api/chat` | Generate a response using Ollama |
| `GET` | `http://localhost:11434/api/tags` | Direct local Ollama model-list check; not used by React |

Chat request:

```json
{
  "message": "Hello",
  "conversation_id": "optional-id",
  "history": [
    {"role": "user", "content": "Earlier question"},
    {"role": "assistant", "content": "Earlier answer"}
  ]
}
```

`conversation_id` and `history` are optional. History roles are limited to
`user` and `assistant`; the API rejects system messages and unsupported fields.
Success and error responses use a structured JSON envelope with meaningful
HTTP status codes.

## Tests and build

Backend tests mock Ollama HTTP requests, so they do not require a running model:

```cmd
cd /d C:\Webdev\AI-CHATBOT\backend
.venv\Scripts\activate
python -m pytest -q
```

Frontend checks:

```cmd
cd /d C:\Webdev\AI-CHATBOT\frontend
npm test
npm run lint
npm run build
```

For a complete local inference check, start Ollama, Flask, and Vite, then visit
the UI, send `Hello`, and verify an assistant response appears. Send a follow-up
question to confirm context. Stop Ollama and verify the status indicator and
chat error are shown; restart Ollama and retry.

## Troubleshooting

- **Flask cannot start:** Check that Python is installed, dependencies are
  installed in `backend\.venv`, and port `5000` is free.
- **Frontend cannot reach Flask:** Keep Flask running; verify
  `VITE_API_BASE_URL=http://localhost:5000/api` and restart Vite after editing
  `frontend\.env`.
- **CORS error:** Ensure the browser origin is exactly
  `http://localhost:5173` and `CORS_ORIGINS` contains it in `backend\.env`.
- **Ollama offline:** Start the Ollama Windows service or run `ollama serve`.
  Check `curl.exe http://localhost:11434/api/tags`.
- **Model unavailable:** Check `ollama list` for the exact `qwen3:8b` tag.
- **Request timed out:** Ollama may need time to load the model or generate a
  response. Check `OLLAMA_TIMEOUT`; keep it below the frontend's 185-second
  request timeout so the backend can return its structured timeout response.
- **Port 5173 busy:** Stop the other process using the port, then restart Vite.
  Vite is configured to fail on a port conflict so the API/CORS URL remains
  predictable.
