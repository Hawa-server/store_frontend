import { Link } from "react-router-dom";
import { ChevronRight, LayoutDashboard, LogOut, Mail, Package, User } from "lucide-react";
import Button from "../components/Button";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import { firstName, useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-4">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-bg text-text-muted">
        <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-sm text-text-muted">{label}</dt>
        <dd className="mt-0.5 font-semibold wrap-break-word">{value}</dd>
      </div>
    </div>
  );
}

export default function AccountPage() {
  useDocumentTitle("Your account");
  const { user: sessionUser, logout, loggingOut } = useAuth();
  const { data, error, loading, reload } = useApi("/api/auth/me");
  const user = data?.user;

  return (
    <PageContainer className="py-10 lg:py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Your account</p>
        <h1 className="mt-2 min-h-12 font-display text-4xl leading-tight font-semibold sm:text-5xl">
          {user ? `Hello, ${firstName(user)}` : loading ? "" : "Your account"}
        </h1>

        <div className="mt-8">
          {error ? (
            <ErrorMessage error={error} onRetry={reload} />
          ) : loading ? (
            <div className="h-48 animate-pulse rounded-card bg-disabled" aria-hidden="true" />
          ) : (
            <section
              aria-labelledby="details-heading"
              className="rounded-card border border-border bg-surface px-5 py-4 sm:px-8 sm:py-6"
            >
              <h2 id="details-heading" className="font-display text-2xl font-semibold">
                Your details
              </h2>
              <dl className="mt-2 divide-y divide-border">
                <Detail icon={User} label="Name" value={user.name} />
                <Detail icon={Mail} label="Email" value={user.email} />
              </dl>
              <p className="mt-2 border-t border-border pt-4 text-sm text-text-muted">
                Member since {dateFormat.format(new Date(user.createdAt))}
              </p>
            </section>
          )}
        </div>

        <nav aria-label="Account" className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            to="/orders"
            className="flex min-h-16 items-center gap-4 rounded-card border border-border bg-surface px-5 py-4 font-semibold transition-colors hover:border-text"
          >
            <Package className="size-5" strokeWidth={1.6} aria-hidden="true" />
            <span className="flex-1">My orders</span>
            <ChevronRight className="size-4 text-text-muted" aria-hidden="true" />
          </Link>
          {sessionUser?.isAdmin && (
            <Link
              to="/admin"
              className="flex min-h-16 items-center gap-4 rounded-card border border-border bg-surface px-5 py-4 font-semibold transition-colors hover:border-text"
            >
              <LayoutDashboard className="size-5" strokeWidth={1.6} aria-hidden="true" />
              <span className="flex-1">Store admin</span>
              <ChevronRight className="size-4 text-text-muted" aria-hidden="true" />
            </Link>
          )}
        </nav>

        <Button variant="secondary" onClick={logout} disabled={loggingOut} className="mt-8">
          <LogOut className="size-4.5" aria-hidden="true" />
          {loggingOut ? "Logging out…" : "Log out"}
        </Button>
      </div>
    </PageContainer>
  );
}
