import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { formatConversationDate } from "../utils/helpers.js";

export default function Sidebar({
  conversations,
  activeId,
  collapsed,
  mobileOpen,
  onToggle,
  onCloseMobile,
  onNewChat,
  onSelect,
  onDelete,
  onRename,
  onDeleteAll,
}) {
  const [search, setSearch] = useState("");
  const filteredConversations = conversations.filter((conversation) =>
    `${conversation.title} ${conversation.messages.map((message) => message.content).join(" ")}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const groupedConversations = filteredConversations.reduce((groups, conversation) => {
    const label = formatConversationDate(conversation.updatedAt || conversation.createdAt);
    groups[label] = [...(groups[label] || []), conversation];
    return groups;
  }, {});

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-slate-200 bg-[#f8f9fc] transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[76px]" : "lg:w-[280px]"}`}
      >
        <div
          className={`flex h-[72px] shrink-0 items-center ${
            collapsed ? "lg:justify-center lg:px-3" : "justify-between px-5"
          } px-5`}
        >
          <div className={`flex items-center gap-3 ${collapsed ? "lg:gap-0" : ""}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:bg-indigo-500 dark:shadow-none">
              <Bot size={19} strokeWidth={1.8} />
            </div>
            <span
              className={`whitespace-nowrap text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              Local AI
            </span>
          </div>
          <button
            className="icon-button hidden lg:inline-flex"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
          <button
            className="icon-button lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className={`px-3 ${collapsed ? "lg:px-3" : "px-4"}`}>
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white shadow-sm shadow-indigo-200/70 transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 ${
              collapsed ? "lg:px-0" : ""
            }`}
            title={collapsed ? "New chat" : undefined}
          >
            <Plus size={17} />
            <span className={collapsed ? "lg:hidden" : ""}>New chat</span>
          </button>
        </div>

        {!collapsed && (
          <div className="mt-3 px-4">
            <label className="relative block">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
            {conversations.length > 0 && (
              <div className="mt-2 flex justify-end gap-1">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(conversations, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "local-ai-conversations.json";
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  title="Export conversations"
                  aria-label="Export conversations"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete all conversations?")) onDeleteAll();
                  }}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                  title="Delete all conversations"
                  aria-label="Delete all conversations"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className={`mt-8 min-h-0 flex-1 overflow-y-auto ${
            collapsed ? "px-2 lg:px-2" : "px-3"
          }`}
        >
          <div
            className={`mb-3 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <span className={collapsed ? "lg:hidden" : ""}>Recent chats</span>
            {collapsed && <MessageSquare size={15} className="hidden lg:block" />}
          </div>

          {conversations.length === 0 ? (
            <p className={`px-2 py-2 text-xs leading-5 text-slate-400 ${collapsed ? "lg:hidden" : ""}`}>
              Your conversations will appear here.
            </p>
          ) : (
            Object.entries(groupedConversations).map(([group, items]) => (
              <div key={group} className="mb-5">
                <p className={`mb-1.5 px-2 text-[11px] text-slate-400 ${collapsed ? "lg:hidden" : ""}`}>
                  {group}
                </p>
                <div className="space-y-0.5">
                  {items.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`group flex items-center gap-1 rounded-lg ${
                        activeId === conversation.id
                          ? "bg-slate-100 dark:bg-slate-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelect(conversation.id);
                          onCloseMobile();
                        }}
                        className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-slate-700 transition dark:text-slate-300 ${
                          collapsed ? "lg:justify-center lg:px-0" : ""
                        }`}
                        title={collapsed ? conversation.title : undefined}
                      >
                        <MessageSquare size={15} className="shrink-0 text-slate-400" />
                        <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>
                          {conversation.title}
                        </span>
                      </button>
                      <button
                        className={`rounded-md p-1.5 text-slate-400 opacity-0 transition hover:bg-white hover:text-indigo-600 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-slate-700 ${
                          collapsed ? "lg:hidden" : ""
                        }`}
                        onClick={() => {
                          const title = window.prompt("Conversation name", conversation.title);
                          if (title) onRename(conversation.id, title);
                        }}
                        aria-label={`Rename ${conversation.title}`}
                        title="Rename chat"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className={`mr-1 rounded-md p-1.5 text-slate-400 opacity-0 transition hover:bg-white hover:text-rose-600 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-slate-700 ${
                          collapsed ? "lg:hidden" : ""
                        }`}
                        onClick={() => onDelete(conversation.id)}
                        aria-label={`Delete ${conversation.title}`}
                        title="Delete chat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className={`border-t border-slate-200/80 p-4 dark:border-slate-800 ${
            collapsed ? "lg:p-3" : ""
          }`}
        >
          <div className={`flex items-center gap-3 ${collapsed ? "lg:justify-center" : ""}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles size={15} />
            </div>
            <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Private by design
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">Powered on your machine</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
