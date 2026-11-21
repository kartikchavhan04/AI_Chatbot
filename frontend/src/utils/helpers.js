export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_HISTORY_MESSAGES = 20;
export const CONVERSATIONS_STORAGE_KEY = "local-ai-conversations";

export function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatConversationDate(value) {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function loadConversations() {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(CONVERSATIONS_STORAGE_KEY) || "[]",
    );
    if (!Array.isArray(saved)) return [];
    return saved.filter(
      (conversation) =>
        conversation &&
        typeof conversation.id === "string" &&
        typeof conversation.title === "string" &&
        Array.isArray(conversation.messages),
    );
  } catch {
    return [];
  }
}

export function saveConversations(conversations) {
  try {
    window.localStorage.setItem(
      CONVERSATIONS_STORAGE_KEY,
      JSON.stringify(conversations),
    );
    return true;
  } catch {
    return false;
  }
}

export function getConversationTitle(message) {
  const normalized = message.trim().replace(/\s+/g, " ");
  if (normalized.length <= 42) return normalized;
  return `${normalized.slice(0, 39).trimEnd()}…`;
}
