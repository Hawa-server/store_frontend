const styles = {
  Pending: "bg-status-pending-bg text-status-pending-text",
  Shipped: "bg-status-shipped-bg text-status-shipped-text",
  Delivered: "bg-status-success-bg text-status-success-text",
  Cancelled: "bg-status-cancelled-bg text-status-cancelled-text",
};

export default function StatusBadge({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
        styles[status] ?? styles.Cancelled
      } ${className}`}
    >
      {status}
    </span>
  );
}
