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
