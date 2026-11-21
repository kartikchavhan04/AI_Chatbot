export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 py-2" role="status" aria-label="Assistant is thinking">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <span className="h-2 w-2 rounded-full bg-indigo-500" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-800">
        <span className="typing-dot" />
        <span className="typing-dot animation-delay-150" />
        <span className="typing-dot animation-delay-300" />
      </div>
      <span className="text-xs text-slate-400">Thinking</span>
    </div>
  );
}
