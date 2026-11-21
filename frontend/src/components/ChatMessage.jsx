import { useState } from "react";
import { Bot, Check, Copy, RotateCw, UserRound } from "lucide-react";
import { formatTime } from "../utils/helpers.js";

export default function ChatMessage({
  message,
  isLastAssistant,
  isGenerating,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className={`group flex gap-3 sm:gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isUser
            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        }`}
        aria-hidden="true"
      >
        {isUser ? <UserRound size={16} /> : <Bot size={17} />}
      </div>
      <div className={`min-w-0 max-w-[88%] sm:max-w-[78%] ${isUser ? "text-right" : ""}`}>
        <div className={`mb-1.5 flex items-center gap-2 ${isUser ? "justify-end" : ""}`}>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {isUser ? "You" : "Assistant"}
          </span>
          <time className="text-[11px] text-slate-400" dateTime={message.createdAt}>
            {formatTime(message.createdAt)}
          </time>
        </div>
        <div
          className={`inline-block whitespace-pre-wrap break-words text-left text-[14px] leading-7 ${
            isUser
              ? "rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-3 text-white shadow-sm"
              : "rounded-2xl rounded-tl-md bg-white px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800"
          }`}
        >
          {message.content}
        </div>
        {!isUser && (
          <div className="mt-1.5 flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button
              onClick={copyMessage}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Copy response"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
            {isLastAssistant && (
              <button
                onClick={onRegenerate}
                disabled={isGenerating}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Regenerate response"
              >
                <RotateCw size={13} />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
