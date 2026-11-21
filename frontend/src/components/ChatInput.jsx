import { useEffect, useRef, useState } from "react";
import { ArrowUp, LoaderCircle, ShieldCheck } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "../utils/helpers.js";

export default function ChatInput({ onSend, isGenerating }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);
  const canSend = value.trim().length > 0 && !isGenerating;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  function submit() {
    if (!canSend) return;
    onSend(value);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-slate-100 bg-white px-3 pb-3 pt-3 dark:border-slate-800 dark:bg-slate-950 sm:px-6 sm:pb-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)] transition focus-within:border-indigo-200 focus-within:shadow-panel dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-slate-600">
          <label htmlFor="chat-input" className="sr-only">
            Write a message
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your assistant…"
            disabled={isGenerating}
            className="max-h-[180px] min-h-[54px] w-full resize-none bg-transparent px-4 pb-2 pt-[17px] text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-70 dark:text-slate-100"
          />
          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="pl-1 text-[11px] text-slate-400">
              <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line</span>
              <span className="sm:hidden">Your local assistant</span>
            </div>
            <div className="flex items-center gap-3">
              {value.length > 0 && (
                <span
                  className={`text-[10px] tabular-nums ${
                    value.length > MAX_MESSAGE_LENGTH * 0.9
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-slate-400"
                  }`}
                  aria-live="polite"
                >
                  {value.length}/{MAX_MESSAGE_LENGTH}
                </span>
              )}
              <button
                onClick={submit}
                disabled={!canSend}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
                aria-label={isGenerating ? "Assistant is responding" : "Send message"}
                title="Send message"
              >
                {isGenerating ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <ArrowUp size={18} strokeWidth={2.2} />
                )}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400">
          <ShieldCheck size={12} />
          Your message is sent to your local Qwen3 8B model.
        </p>
      </div>
    </div>
  );
}
