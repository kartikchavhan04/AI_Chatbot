import { Menu, Moon, Sun, Trash2 } from "lucide-react";
import { useTheme } from "../context/useTheme.js";
import ConnectionStatus from "./ConnectionStatus.jsx";

export default function ChatHeader({
  backendStatus,
  ollamaStatus,
  hasMessages,
  conversationTitle,
  onClear,
  onOpenSidebar,
  availableModels,
  selectedModel,
  onSelectModel,
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-7 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="icon-button -ml-1 lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {hasMessages ? conversationTitle || "Your conversation" : "New conversation"}
            </h1>
            <span className="hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Qwen3 8B
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 sm:hidden">
            <ConnectionStatus label="Backend" status={backendStatus} compact />
            <ConnectionStatus label="Ollama" status={ollamaStatus} compact />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {availableModels.length > 0 && (
          <select
            value={selectedModel}
            onChange={(event) => onSelectModel(event.target.value)}
            className="hidden max-w-36 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400 sm:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Select Ollama model"
            title="Select Ollama model"
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        )}
        <div className="hidden items-center gap-4 sm:flex">
          <ConnectionStatus label="Backend" status={backendStatus} />
          <ConnectionStatus label="Ollama" status={ollamaStatus} />
        </div>
        <span className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-700" />
        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className="icon-button"
          onClick={onClear}
          disabled={!hasMessages}
          aria-label="Clear current conversation"
          title="Clear conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </header>
  );
}
