import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import ChatHeader from "../components/ChatHeader.jsx";
import ChatInput from "../components/ChatInput.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import Sidebar from "../components/Sidebar.jsx";
import {
  getApiErrorMessage,
  getBackendHealth,
  getOllamaHealth,
} from "../services/chatService.js";
import useChat from "../hooks/useChat.js";

function getConnectionState(result) {
  return result.status === "fulfilled" && result.value?.success === true
    ? "online"
    : "offline";
}

export default function ChatPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [ollamaStatus, setOllamaStatus] = useState("checking");
  const [connectionMessage, setConnectionMessage] = useState("");
  const chat = useChat();

  const messages = chat.activeConversation?.messages || [];
  const hasMessages = messages.length > 0;

  const checkConnections = useCallback(async () => {
    setBackendStatus("checking");
    setOllamaStatus("checking");
    const [backend, ollama] = await Promise.allSettled([
      getBackendHealth(),
      getOllamaHealth(),
    ]);
    setBackendStatus(getConnectionState(backend));
    setOllamaStatus(getConnectionState(ollama));
    if (backend.status === "rejected") {
      setConnectionMessage(getApiErrorMessage(backend.reason));
    } else if (ollama.status === "rejected") {
      setConnectionMessage(getApiErrorMessage(ollama.reason));
    } else {
      setConnectionMessage("");
    }
  }, []);

  useEffect(() => {
    checkConnections();
    const intervalId = window.setInterval(checkConnections, 30_000);
    return () => window.clearInterval(intervalId);
  }, [checkConnections]);

  const connectionWarning = useMemo(() => {
    if (!connectionMessage) return "";
    if (backendStatus === "offline") {
      return "Backend is not reachable. Start Flask and check your API URL.";
    }
    if (ollamaStatus === "offline") {
      return connectionMessage || "Ollama or the configured model is unavailable.";
    }
    return "";
  }, [backendStatus, connectionMessage, ollamaStatus]);

  async function handleSend(message) {
    await chat.sendMessage(message);
  }

  return (
    <main className="flex h-[100dvh] min-h-0 overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <Sidebar
        conversations={chat.conversations}
        activeId={chat.activeId}
        collapsed={collapsed}
        mobileOpen={mobileSidebarOpen}
        onToggle={() => setCollapsed((current) => !current)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onNewChat={chat.startNewChat}
        onSelect={chat.selectConversation}
        onDelete={chat.deleteConversation}
      />

      <section className="flex min-w-0 flex-1 flex-col bg-white dark:bg-slate-950">
        <ChatHeader
          backendStatus={backendStatus}
          ollamaStatus={ollamaStatus}
          hasMessages={hasMessages}
          conversationTitle={chat.activeConversation?.title}
          onClear={chat.clearActiveConversation}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />

        <div className="relative flex min-h-0 flex-1 flex-col">
          {connectionWarning && (
            <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 sm:mx-auto sm:w-[calc(100%-3.5rem)] sm:max-w-3xl dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertCircle size={15} className="shrink-0" />
              <span className="flex-1">{connectionWarning}</span>
              <button
                onClick={checkConnections}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          )}

          {!chat.storageAvailable && (
            <div className="mx-4 mt-3 rounded-lg bg-slate-200/70 px-3 py-2 text-xs text-slate-600 sm:mx-auto sm:w-[calc(100%-3.5rem)] sm:max-w-3xl dark:bg-slate-800 dark:text-slate-300">
              Browser storage is unavailable. This chat may not remain after you close the page.
            </div>
          )}

          <ChatWindow
            messages={messages}
            isGenerating={chat.isGenerating}
            onSuggestion={handleSend}
            onRegenerate={chat.regenerateLastResponse}
          />

          {chat.error && (
            <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800 sm:mx-auto sm:w-[calc(100%-3.5rem)] sm:max-w-3xl dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span className="flex-1">
                {chat.error}
              </span>
              {chat.error && (
                <button
                  onClick={chat.clearError}
                  className="rounded p-0.5 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                  aria-label="Dismiss error"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        <ChatInput onSend={handleSend} isGenerating={chat.isGenerating} />
      </section>
    </main>
  );
}
