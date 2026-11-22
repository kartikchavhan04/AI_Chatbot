import { useEffect, useRef, useState } from "react";
import { ArrowUp, FileText, Mic, ShieldCheck, Square } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "../utils/helpers.js";

export default function ChatInput({ onSend, isGenerating, onStop }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [documentContext, setDocumentContext] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const canSend = value.trim().length > 0 && !isGenerating;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  function submit() {
    if (!canSend) return;
    const documentPrefix = documentContext
      ? `Document: ${documentName}\n${documentContext}\n\nQuestion:\n`
      : "";
    const availableQuestionLength = Math.max(0, MAX_MESSAGE_LENGTH - documentPrefix.length);
    onSend(`${documentPrefix}${value.slice(0, availableQuestionLength)}`);
    setValue("");
    setDocumentContext("");
    setDocumentName("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  function handleDocument(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(txt|md|csv|json)$/i.test(file.name)) {
      setDocumentName("Unsupported file");
      setDocumentContext("");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "").replace(/\r/g, "").slice(0, 3000);
      setDocumentName(file.name);
      setDocumentContext(text);
    };
    reader.readAsText(file);
  }

  function toggleVoice() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "mr-IN";
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      setValue((current) => `${current}${transcript}`.slice(0, MAX_MESSAGE_LENGTH));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
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
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.json,text/plain,text/markdown"
                  onChange={handleDocument}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  title="Attach text document"
                  aria-label="Attach text document"
                >
                  <FileText size={14} />
                </button>
                {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`rounded-md p-1.5 ${isListening ? "bg-rose-100 text-rose-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"}`}
                    title={isListening ? "Stop voice input" : "Start voice input"}
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  >
                    <Mic size={14} />
                  </button>
                )}
                {documentName && (
                  <span className="ml-1 max-w-28 truncate text-[10px] text-indigo-500" title={documentName}>
                    {documentName}
                  </span>
                )}
              </div>
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
                onClick={isGenerating ? onStop : submit}
                disabled={isGenerating ? false : !canSend}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
                aria-label={isGenerating ? "Stop generating" : "Send message"}
                title={isGenerating ? "Stop generating" : "Send message"}
              >
                {isGenerating ? (
                  <Square size={15} fill="currentColor" />
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
