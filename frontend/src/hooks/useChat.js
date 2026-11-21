import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createId,
  getConversationTitle,
  loadConversations,
  MAX_HISTORY_MESSAGES,
  saveConversations,
} from "../utils/helpers.js";
import { getApiErrorMessage, sendChatMessage } from "../services/chatService.js";

function updateConversation(conversations, id, update) {
  return conversations.map((conversation) =>
    conversation.id === id ? update(conversation) : conversation,
  );
}

export default function useChat() {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    setStorageAvailable(saveConversations(conversations));
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) || null,
    [activeId, conversations],
  );

  const startNewChat = useCallback(() => {
    setActiveId(null);
    setError("");
  }, []);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
    setError("");
  }, []);

  const deleteConversation = useCallback((id) => {
    setConversations((current) =>
      current.filter((conversation) => conversation.id !== id),
    );
    setActiveId((current) => (current === id ? null : current));
    setError("");
  }, []);

  const requestCompletion = useCallback(
    async (conversationId, prompt, history, replaceLastAssistant) => {
      setIsGenerating(true);
      setError("");

      try {
        const response = await sendChatMessage({
          message: prompt,
          conversationId,
          history: history.slice(-MAX_HISTORY_MESSAGES),
        });
        const assistantMessage = response?.data?.assistant_message;
        if (response?.success !== true || typeof assistantMessage !== "string") {
          throw new Error("The backend returned an unexpected response.");
        }

        setConversations((current) =>
          updateConversation(current, conversationId, (conversation) => {
            const message = {
              id: createId(),
              role: "assistant",
              content: assistantMessage,
              createdAt: new Date().toISOString(),
            };
            const messages = replaceLastAssistant
              ? [...conversation.messages.slice(0, -1), message]
              : [...conversation.messages, message];
            return { ...conversation, messages, updatedAt: message.createdAt };
          }),
        );
      } catch (requestError) {
        setError(
          requestError.message === "The backend returned an unexpected response."
            ? requestError.message
            : getApiErrorMessage(requestError),
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (rawMessage) => {
      const message = rawMessage.trim();
      if (!message || isGenerating) return;

      const target = activeConversation || {
        id: createId(),
        title: getConversationTitle(message),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const userMessage = {
        id: createId(),
        role: "user",
        content: message,
        createdAt: new Date().toISOString(),
      };
      const previousMessages = target.messages;

      setActiveId(target.id);
      setError("");
      setConversations((current) => {
        const existing = current.find((conversation) => conversation.id === target.id);
        const next = {
          ...target,
          messages: [...previousMessages, userMessage],
          updatedAt: userMessage.createdAt,
        };
        return existing
          ? updateConversation(current, target.id, () => next)
          : [next, ...current];
      });

      await requestCompletion(
        target.id,
        message,
        previousMessages.map(({ role, content }) => ({ role, content })),
        false,
      );
    },
    [activeConversation, isGenerating, requestCompletion],
  );

  const regenerateLastResponse = useCallback(async () => {
    if (isGenerating || !activeConversation) return;
    const messages = activeConversation.messages;
    const lastAssistantIndex = messages.length - 1;
    const lastUserIndex = messages
      .map((item) => item.role)
      .lastIndexOf("user", lastAssistantIndex);
    if (
      lastAssistantIndex < 0 ||
      messages[lastAssistantIndex]?.role !== "assistant" ||
      lastUserIndex < 0
    ) {
      return;
    }

    await requestCompletion(
      activeConversation.id,
      messages[lastUserIndex].content,
      messages.slice(0, lastUserIndex).map(({ role, content }) => ({ role, content })),
      true,
    );
  }, [activeConversation, isGenerating, requestCompletion]);

  const clearActiveConversation = useCallback(() => {
    if (activeId) deleteConversation(activeId);
  }, [activeId, deleteConversation]);

  return {
    conversations,
    activeConversation,
    activeId,
    isGenerating,
    error,
    storageAvailable,
    sendMessage,
    regenerateLastResponse,
    startNewChat,
    selectConversation,
    deleteConversation,
    clearActiveConversation,
    clearError: () => setError(""),
  };
}
