import Button from "./Button";

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-card border border-border bg-status-alert-bg p-5 text-status-alert-text sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="font-medium">{error?.message ?? "Something went wrong. Please try again."}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="shrink-0">
          Try again
        </Button>
      )}
    </div>
  );
}
