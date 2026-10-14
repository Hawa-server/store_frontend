import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import AccessDenied from "../../components/AccessDenied";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormAlert from "../../components/form/FormAlert";
import DiscountForm from "../../components/admin/DiscountForm";
import NotFoundPage from "../NotFoundPage";
import { DiscountStatusBadge, OverLimitNote } from "./AdminDiscountsPage";
import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAnnounce } from "../../context/AnnouncerContext";
import { formatDateTime, formatGhs } from "../../lib/format";
import { usageText, valueText } from "../../lib/discounts";

const card = "rounded-card border border-border bg-surface p-5 sm:p-7";

function BackLink() {
  return (
    <Link to="/admin/discounts" className="inline-flex min-h-11 items-center gap-2 font-semibold text-text-muted hover:text-text">
      <ArrowLeft className="size-4" aria-hidden="true" />
      All discount codes
    </Link>
  );
}

function Redemptions({ items }) {
  return (
    <section aria-labelledby="redemptions-heading" className={`${card} mt-8`}>
      <h2 id="redemptions-heading" className="text-xl font-semibold sm:text-2xl">
        Recent orders using this code
      </h2>
      {items.length === 0 ? (
        <p className="mt-3 text-text-muted">No orders have used this code yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((r) => (
            <li key={r.orderId} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
              <div className="min-w-0">
                <Link
                  to={`/admin/orders/${r.orderId}`}
                  className="-my-2 inline-block py-2 font-semibold text-accent underline underline-offset-4 hover:text-accent-dark"
                >
                  {r.orderNumber}
                </Link>
                <p className="text-sm wrap-break-word text-text-muted">{r.email}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">− {formatGhs(r.discountGhs)}</p>
                <p className="text-sm text-text-muted">{formatDateTime(r.redeemedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminDiscountFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const announce = useAnnounce();
  const { data, error, loading, reload } = useApi(isEdit ? `/api/admin/discount-codes/${encodeURIComponent(id)}` : null);
  const [code, setCode] = useState(null);
  const [notice, setNotice] = useState(location.state?.notice ? { tone: "success", text: location.state.notice } : null);
  const [confirmingOff, setConfirmingOff] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    setCode(data?.discountCode ?? null);
  }, [data]);

  useEffect(() => {
    if (location.state?.notice) announce(location.state.notice);
  }, [location.state, announce]);

  useDocumentTitle(isEdit ? (code ? `${code.code} · Discounts · Admin` : "Discount code · Admin") : "New discount code · Admin");

  if (error?.status === 403) return <AccessDenied />;
  if (isEdit && error && (error.status === 404 || error.status === 400)) {
    return (
      <NotFoundPage
        title="Discount code not found"
        message="It may have been typed wrongly in the address."
        actions={<Button to="/admin/discounts">Back to discount codes</Button>}
      />
    );
  }

  function onSaved(saved) {
    if (!isEdit) {
      navigate(`/admin/discounts/${saved.id}`, { replace: true, state: { notice: `${saved.code} created.` } });
      return;
    }
    setCode((current) => ({ ...saved, redemptions: saved.redemptions ?? current?.redemptions ?? [] }));
    setNotice({ tone: "success", text: "Changes saved" });
    announce("Changes saved");
  }

  async function setActive(active) {
    setToggling(true);
    setNotice(null);
    try {
      const result = await api(`/api/admin/discount-codes/${code.id}`, { method: "PATCH", body: { isActive: active } });
      setCode((current) => ({ ...result.discountCode, redemptions: result.discountCode.redemptions ?? current.redemptions }));
      const text = active ? `${code.code} is on. Shoppers can use it.` : `${code.code} is off. Shoppers can't use it.`;
      setNotice({ tone: "success", text });
      announce(text);
    } catch (err) {
      setNotice({ tone: "error", text: err.message });
      announce(err.message);
    } finally {
      setToggling(false);
      setConfirmingOff(false);
    }
  }

  if (isEdit && (loading || !code) && !error) {
    return (
      <>
        <BackLink />
        <div className="mt-6 space-y-6" aria-hidden="true">
          <div className="h-12 w-1/2 animate-pulse rounded-full bg-disabled" />
          <div className="h-96 animate-pulse rounded-card bg-disabled" />
        </div>
      </>
    );
  }

  return (
    <>
      <BackLink />
      {isEdit && error ? (
        <div className="mt-6">
          <ErrorMessage error={error} onRetry={reload} />
        </div>
      ) : (
        <>
          <header className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
              <h1 className="font-display text-3xl leading-tight font-semibold sm:text-5xl">
                {isEdit ? <span className="tracking-wide break-all">{code.code}</span> : "New discount code"}
              </h1>
              {isEdit && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
                  <DiscountStatusBadge status={code.status} />
                  <span>{valueText(code)}</span>
                  <span>{usageText(code)}</span>
                  <OverLimitNote code={code} />
                </div>
              )}
            </div>
            {isEdit &&
              (code.isActive ? (
                <Button variant="secondary" onClick={() => setConfirmingOff(true)} disabled={toggling}>
                  Turn off
                </Button>
              ) : (
                <Button onClick={() => setActive(true)} disabled={toggling}>
                  {toggling ? "Turning on…" : "Turn on"}
                </Button>
              ))}
          </header>

          {notice && (
            <FormAlert tone={notice.tone} className="mt-6 max-w-2xl">
              {notice.text}
            </FormAlert>
          )}

          <DiscountForm
            key={isEdit ? `${code.id}-${code.updatedAt}` : "new"}
            discountCode={isEdit ? code : null}
            onSaved={onSaved}
            onSubmitStart={() => setNotice(null)}
          />

          {isEdit && <Redemptions items={code.redemptions ?? []} />}

          {isEdit && (
            <ConfirmDialog
              open={confirmingOff}
              title={`Turn off ${code.code}?`}
              message="Shoppers won't be able to use it."
              confirmLabel="Turn off"
              cancelLabel="Keep it on"
              busy={toggling}
              onConfirm={() => setActive(false)}
              onCancel={() => setConfirmingOff(false)}
            />
          )}
        </>
      )}
    </>
  );
}
