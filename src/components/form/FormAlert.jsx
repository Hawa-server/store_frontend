import { CircleAlert, CircleCheck, Info } from "lucide-react";

const tones = {
  error: { classes: "bg-status-alert-bg text-status-alert-text", Icon: CircleAlert, role: "alert" },
  success: { classes: "bg-status-success-bg text-status-success-text", Icon: CircleCheck, role: "status" },
  info: { classes: "bg-status-pending-bg text-status-pending-text", Icon: Info, role: "status" },
};

export default function FormAlert({ tone = "error", children, action, className = "" }) {
  if (!children) return null;
  const { classes, Icon, role } = tones[tone];

  return (
    <div role={role} className={`rounded-field px-4 py-3.5 ${classes} ${className}`}>
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1 font-medium">{children}</div>
      </div>
      {action && <div className="mt-3 pl-7.5">{action}</div>}
    </div>
  );
}
