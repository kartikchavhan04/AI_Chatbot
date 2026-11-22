import { useState } from "react";
import { Bot, Check, Copy, RotateCw, UserRound } from "lucide-react";
import { formatTime } from "../utils/helpers.js";

function renderInlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[12px] dark:bg-slate-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function MessageContent({ content }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3);
          const firstLine = lines.indexOf("\n");
          const language = firstLine >= 0 ? lines.slice(0, firstLine).trim() : "";
          const code = firstLine >= 0 ? lines.slice(firstLine + 1) : lines;
          return (
            <pre
              key={index}
              className="relative my-2 overflow-x-auto rounded-lg bg-slate-950 p-3 text-[12px] leading-6 text-slate-100"
            >
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(code)}
                className="absolute right-2 top-2 rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-700"
              >
                Copy
              </button>
              {language && (
                <span className="mb-2 block text-[10px] uppercase tracking-wide text-slate-400">
                  {language}
                </span>
              )}
              <code>{code}</code>
            </pre>
          );
        }
        return (
          <span key={index}>
            {part.split("\n").map((line, lineIndex) => (
              <span key={lineIndex}>
                {renderInlineMarkdown(line)}
                {lineIndex < part.split("\n").length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}

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
          {isUser ? message.content : <MessageContent content={message.content} />}
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
