import { formatDateTime } from "../../lib/format";

export default function StatusTimeline({ history, showChangedBy = false }) {
  return (
    <ol className="relative mt-5 space-y-5 border-l-2 border-border pl-6">
      {history.map((entry, index) => {
        const latest = index === history.length - 1;
        return (
          <li key={`${entry.toStatus}-${entry.changedAt}`} className="relative">
            <span
              className={`absolute top-1.5 -left-[1.95rem] size-3.5 rounded-full border-2 border-surface ${
                latest ? "bg-text" : "bg-input-border"
              }`}
              aria-hidden="true"
            />
            <p className="font-semibold">
              {entry.fromStatus === null ? "Order placed" : entry.toStatus}
              {latest && <span className="sr-only"> (current status)</span>}
            </p>
            <p className="text-sm text-text-muted">
              <time dateTime={entry.changedAt}>{formatDateTime(entry.changedAt)}</time>
              {showChangedBy && <> · {entry.changedBy?.name ?? "System"}</>}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
