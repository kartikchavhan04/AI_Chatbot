import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Brain,
  Compass,
  LockKeyhole,
  PenLine,
  Sparkles,
} from "lucide-react";
import ChatMessage from "./ChatMessage.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

const suggestions = [
  {
    label: "Understand something",
    prompt: "Explain how neural networks learn, in simple terms.",
    Icon: Brain,
  },
  {
    label: "Get words flowing",
    prompt: "Help me write a clear, thoughtful project update.",
    Icon: PenLine,
  },
  {
    label: "Explore an idea",
    prompt: "I have an idea for a small weekend project. Help me shape it.",
    Icon: Compass,
  },
];

export default function ChatWindow({
  messages,
  isGenerating,
  onSuggestion,
  onRegenerate,
}) {
  const scrollContainerRef = useRef(null);
  const hasMessages = messages.length > 0;
  const lastAssistantId =
    messages[messages.length - 1]?.role === "assistant"
      ? messages[messages.length - 1].id
      : null;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: hasMessages ? container.scrollHeight : 0,
      behavior: hasMessages ? "smooth" : "auto",
    });
  }, [hasMessages, isGenerating, messages]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      id="chat-window"
    >
      {!hasMessages ? (
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 pb-8 pt-10 sm:px-8">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900">
            <Sparkles size={20} strokeWidth={1.8} />
          </div>
          <p className="mb-2 text-sm font-medium text-indigo-600 dark:text-indigo-300">
            A little help, right here
          </p>
          <h2 className="max-w-xl text-[32px] font-semibold leading-[1.14] tracking-[-0.045em] text-slate-900 sm:text-[42px] dark:text-white">
            What would you like
            <br className="hidden sm:block" /> to work through?
          </h2>
          <p className="mt-4 max-w-lg text-[14px] leading-6 text-slate-500 dark:text-slate-400">
            Ask a question, find the right words, or give an idea room to grow.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                onClick={() => onSuggestion(suggestion.prompt)}
                className="group rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition duration-150 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600"
              >
                <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-100 transition group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:ring-indigo-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-300">
                  <suggestion.Icon size={15} strokeWidth={1.8} />
                </span>
                <span className="flex items-center justify-between gap-2 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                  {suggestion.label}
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500"
                  />
                </span>
                <span className="mt-1.5 block text-xs leading-[1.55] text-slate-500 dark:text-slate-400">
                  {suggestion.prompt}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-7 flex items-center gap-2 text-[11px] text-slate-400">
            <LockKeyhole size={13} />
            <span>Chats stay in this browser. Nothing is synced to an account.</span>
          </div>
        </section>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-7 px-4 pb-8 pt-7 sm:gap-8 sm:px-8 sm:pt-9">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLastAssistant={message.id === lastAssistantId}
              isGenerating={isGenerating}
              onRegenerate={onRegenerate}
            />
          ))}
          {isGenerating && <TypingIndicator />}
        </div>
      )}
    </div>
  );
}
