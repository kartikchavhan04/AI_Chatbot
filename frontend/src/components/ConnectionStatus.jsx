import { Check, LoaderCircle, X } from "lucide-react";

const statusConfig = {
  checking: { label: "Checking", Icon: LoaderCircle, classes: "text-slate-400" },
  online: { label: "Connected", Icon: Check, classes: "text-emerald-600 dark:text-emerald-400" },
  offline: { label: "Offline", Icon: X, classes: "text-rose-600 dark:text-rose-400" },
};

export default function ConnectionStatus({ label, status, compact = false }) {
  const config = statusConfig[status] || statusConfig.checking;
  const { Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${config.classes}`}
      title={`${label}: ${config.label}`}
      aria-label={`${label}: ${config.label}`}
    >
      {status === "checking" ? (
        <Icon size={13} className="animate-spin" aria-hidden="true" />
      ) : status === "online" ? (
        <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
      ) : (
        <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
      )}
      {!compact && <span className="text-slate-600 dark:text-slate-300">{label}</span>}
    </span>
  );
}
