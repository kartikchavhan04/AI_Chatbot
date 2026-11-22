import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 185_000,
  headers: { "Content-Type": "application/json" },
});

export async function getBackendHealth() {
  const response = await api.get("/health", { timeout: 5000 });
  return response.data;
}

export async function getOllamaHealth() {
  const response = await api.get("/health/ollama", { timeout: 10_000 });
  return response.data;
}

export async function sendChatMessage({ message, conversationId, history }) {
  const response = await api.post("/chat", {
    message,
    conversation_id: conversationId,
    history,
  });
  return response.data;
}

export async function sendChatMessageStream({
  message,
  conversationId,
  history,
  model,
  onChunk,
  signal,
}) {
  const baseUrl =
    import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api";
  const response = await fetch(`${baseUrl}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      history,
      model,
    }),
    signal,
  });

  if (!response.ok) {
    let message = "The request failed.";
    try {
      const body = await response.json();
      message = body?.message || message;
    } catch {
      // Keep the safe fallback message.
    }
    throw new Error(message);
  }

  if (!response.body) throw new Error("Streaming is not supported by this browser.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completeText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const event of events) {
      const line = event
        .split("\n")
        .find((item) => item.startsWith("data: "));
      if (!line) continue;
      const payload = JSON.parse(line.slice(6));
      if (payload.error) throw new Error(payload.error);
      if (payload.content) {
        completeText += payload.content;
        onChunk?.(completeText);
      }
      if (payload.done) return completeText;
    }
  }

  return completeText;
}

export async function getAvailableModels() {
  const response = await api.get("/health/ollama/models", { timeout: 10_000 });
  return response.data;
}

export function getApiErrorMessage(error) {
  if (axios.isCancel(error)) return "The request was cancelled.";
  if (error.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) {
    return "Could not reach the backend. Check that Flask is running and try again.";
  }
  return "Something went wrong while preparing your request.";
}
