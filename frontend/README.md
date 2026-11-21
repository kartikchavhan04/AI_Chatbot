# Local AI Chatbot Frontend

A responsive React + Vite chat interface for the Flask chatbot backend. It
communicates exclusively with Flask; the Ollama URL and model endpoint are not
used by the browser.

## Features

- Flask health and Ollama/model status checks with automatic refresh.
- Chat, validated history forwarding, loading/error states, and response
  regeneration using the backend's existing chat route.
- Conversation list saved in this browser's `localStorage`; conversations are
  **not** persisted by the Flask backend or synchronized between devices.
- Light/dark theme, responsive mobile navigation, copy response, and keyboard
  shortcuts. The light theme is the default; the selection can be changed from
  the header.
- Plain-text message rendering; assistant content is never interpreted as HTML.

## Structure

```text
frontend/
├── src/
│   ├── components/      Sidebar, header, chat, input, and status UI
│   ├── context/         Light/dark theme context
│   ├── hooks/           Conversation and request state
│   ├── pages/           Chat page composition
│   ├── services/        Axios API client
│   ├── utils/           Conversation storage and formatting helpers
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env                 Local API URL (ignored by Git)
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Requirements and installation (Windows CMD)

Install Node.js 20 LTS or later. Open **Command Prompt** and run:

```cmd
cd /d C:\Webdev\AI-CHATBOT\frontend
npm install
copy .env.example .env
```

The `.env` file should contain the Flask API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Restart Vite after changing environment variables. Only `VITE_` variables are
available to frontend code; do not put secrets in them.

## Start the application

Start the Flask backend and local Ollama service first, then in a CMD window:

```cmd
cd /d C:\Webdev\AI-CHATBOT\frontend
npm run dev
```

Open the local URL printed by Vite (by default `http://localhost:5173`). The
backend must allow this origin in its `CORS_ORIGINS` setting; the default
backend configuration already includes `http://localhost:5173`.

## Backend API contract

The Axios service defaults to `http://localhost:5000/api` and uses these
existing Flask routes:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Flask backend health |
| `GET` | `/health/ollama` | Ollama availability and configured model check |
| `POST` | `/chat` | Generate a non-streaming response |

Chat requests contain only the fields supported by Flask:

```json
{
  "message": "Explain Python",
  "conversation_id": "browser-generated-id",
  "history": [
    {"role": "user", "content": "What is code?"},
    {"role": "assistant", "content": "Code is a set of instructions."}
  ]
}
```

The app sends at most the last 20 prior messages as `history`; each message is
limited to 4,000 characters, matching backend defaults. New `conversation_id`
values are generated in the browser and passed through to Flask. Successful
chat text is read from `data.assistant_message`; API errors are taken from the
backend's JSON `message` field. Client-side chat history is local browser
storage only. The frontend does not call Ollama directly.

## Quality checks and production build

```cmd
cd /d C:\Webdev\AI-CHATBOT\frontend
npm run lint
npm run build
```

Serve the production bundle locally with:

```cmd
npm run preview
```

For production, build the static assets and serve `dist/` using your chosen
static web server. Configure Flask CORS to allow the exact origin serving the
frontend; do not expose Ollama's port to the public internet.
