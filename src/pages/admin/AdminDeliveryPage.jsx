import { useEffect, useId, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import AccessDenied from "../../components/AccessDenied";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormAlert from "../../components/form/FormAlert";
import TextField from "../../components/form/TextField";
import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAnnounce } from "../../context/AnnouncerContext";
import { formatGhs, pesewasToInput } from "../../lib/format";
import { parseGhsAmount } from "../../lib/orders";

const FEE_ERROR = "Enter a fee from GH₵ 0 to GH₵ 1,000, with at most 2 decimal places.";

function parseFee(text) {
  const parsed = parseGhsAmount(text, { max: 100000, maxError: FEE_ERROR, allowZero: true });
  return parsed.error ? { error: FEE_ERROR } : parsed;
}

function Switch({ checked, onChange, label, disabled }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3">
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="h-7 w-12 rounded-full bg-input-border transition-colors peer-checked:bg-text peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
        />
        <span
          aria-hidden="true"
          className="absolute top-1 left-1 size-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5"
        />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function HiddenBadge() {
  return (
    <span className="inline-flex rounded-full bg-status-cancelled-bg px-2.5 py-0.5 text-xs font-semibold text-status-cancelled-text">
      Hidden
    </span>
  );
}

function TownRow({ town, regionFee, onSaved, onAskHide, announce }) {
  const [name, setName] = useState(town.name);
  const [useRegion, setUseRegion] = useState(town.feePesewas === null);
  const [fee, setFee] = useState(town.feePesewas === null ? "" : pesewasToInput(town.feePesewas));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function save(event) {
    event.preventDefault();
    setMessage(null);
    const found = {};
    const body = {};
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) found.name = "Enter the town name (2–80 characters).";
    else if (trimmed !== town.name) body.name = trimmed;

    if (useRegion) {
      if (town.feePesewas !== null) body.feePesewas = null;
    } else {
      const parsed = parseFee(fee);
      if (parsed.error) found.feePesewas = parsed.error;
      else if (parsed.pesewas !== town.feePesewas) body.feePesewas = parsed.pesewas;
    }
    setErrors(found);
    if (Object.keys(found).length) return;
    if (Object.keys(body).length === 0) {
      setMessage({ tone: "info", text: "Nothing to save yet." });
      return;
    }

    setSaving(true);
    try {
      const data = await api(`/api/admin/delivery-towns/${town.id}`, { method: "PATCH", body });
      onSaved(data.town);
      announce(`Saved ${data.town.name}`);
    } catch (err) {
      if (err.fields) setErrors({ name: err.fields.name, feePesewas: err.fields.feePesewas });
      setMessage({ tone: "error", text: err.fields?._ ?? err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className={`py-4 ${town.isActive ? "" : "opacity-70"}`}>
      <form onSubmit={save} noValidate className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-semibold">
            {town.name}
            {!town.isActive && <HiddenBadge />}
          </p>
          <p className="text-sm text-text-muted">
            {town.feePesewas === null
              ? `Uses region fee (${formatGhs(regionFee)})`
              : `Own fee: ${formatGhs(town.feePesewas)}`}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Town name"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <TextField
            label="Town fee (GH₵)"
            inputMode="decimal"
            autoComplete="off"
            placeholder={useRegion ? `Region fee: ${pesewasToInput(regionFee)}` : "10.00"}
            value={useRegion ? "" : fee}
            disabled={useRegion}
            onChange={(e) => setFee(e.target.value)}
            error={errors.feePesewas}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-6">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={useRegion}
                onChange={(e) => {
                  setUseRegion(e.target.checked);
                  if (!e.target.checked && !fee) setFee(pesewasToInput(regionFee));
                }}
                className="size-5 accent-text"
              />
              Use region fee
            </label>
            <Switch
              checked={town.isActive}
              label={town.isActive ? "Shown in checkout" : "Hidden from checkout"}
              onChange={(next) => onAskHide(town, next)}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={saving} className="min-h-11 px-5 text-sm">
            {saving ? "Saving…" : "Save town"}
          </Button>
        </div>
        {message && <FormAlert tone={message.tone}>{message.text}</FormAlert>}
      </form>
    </li>
  );
}

function AddTown({ region, onAdded, announce }) {
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function add(event) {
    event.preventDefault();
    const found = {};
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) found.name = "Enter the town name (2–80 characters).";
    let feePesewas = null;
    if (fee.trim()) {
      const parsed = parseFee(fee);
      if (parsed.error) found.feePesewas = parsed.error;
      else feePesewas = parsed.pesewas;
    }
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const data = await api("/api/admin/delivery-towns", {
        method: "POST",
        body: { regionId: region.id, name: trimmed, feePesewas },
      });
      onAdded(data.town);
      setName("");
      setFee("");
      announce(`Added ${data.town.name}`);
    } catch (err) {
      setErrors(err.fields ? { name: err.fields.name ?? err.fields.regionId, feePesewas: err.fields.feePesewas } : { name: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={add} noValidate className="mt-4 rounded-field border border-dashed border-input-border p-4">
      <p className="mb-3 text-sm font-semibold">Add a town to {region.name}</p>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-start">
        <TextField label="Town name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <TextField
          label="Fee (optional)"
          inputMode="decimal"
          autoComplete="off"
          placeholder={pesewasToInput(region.feePesewas)}
          hint="Empty = region fee"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          error={errors.feePesewas}
        />
        <Button type="submit" disabled={saving} className="min-h-12 sm:mt-7">
          <Plus className="size-4.5" aria-hidden="true" />
          {saving ? "Adding…" : "Add town"}
        </Button>
      </div>
    </form>
  );
}

function RegionCard({ region, onRegionSaved, onTownSaved, onAskHide, announce, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const [fee, setFee] = useState(pesewasToInput(region.feePesewas));
  const [feeError, setFeeError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const panelId = useId();

  useEffect(() => {
    setFee(pesewasToInput(region.feePesewas));
  }, [region.feePesewas]);

  async function saveFee(event) {
    event.preventDefault();
    setMessage(null);
    const parsed = parseFee(fee);
    if (parsed.error) {
      setFeeError(parsed.error);
      return;
    }
    setFeeError(null);
    if (parsed.pesewas === region.feePesewas) {
      setMessage({ tone: "info", text: "Nothing to save yet." });
      return;
    }
    setSaving(true);
    try {
      const data = await api(`/api/admin/delivery-regions/${region.id}`, { method: "PATCH", body: { feePesewas: parsed.pesewas } });
      onRegionSaved(data.region);
      setMessage({ tone: "success", text: "Saved" });
      announce(`Saved ${region.name}`);
    } catch (err) {
      setFeeError(err.fields?.feePesewas ?? null);
      setMessage({ tone: "error", text: err.fields?._ ?? err.message });
    } finally {
      setSaving(false);
    }
  }

  const activeTowns = region.towns.filter((t) => t.isActive).length;

  return (
    <li className={`rounded-card border border-border bg-surface ${region.isActive ? "" : "opacity-80"}`}>
      <h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-16 w-full items-center gap-3 rounded-card px-5 py-4 text-left sm:px-6"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2 text-lg font-semibold">
              {region.name}
              {!region.isActive && <HiddenBadge />}
            </span>
            <span className="block text-sm text-text-muted">
              {formatGhs(region.feePesewas)} · {activeTowns} of {region.towns.length} {region.towns.length === 1 ? "town" : "towns"} shown
            </span>
          </span>
          <ChevronDown className={`size-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </h2>

      {open && (
        <div id={panelId} className="border-t border-border px-5 pt-4 pb-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <form onSubmit={saveFee} noValidate className="flex flex-wrap items-start gap-3">
              <div className="w-40">
                <TextField
                  label="Region fee (GH₵)"
                  inputMode="decimal"
                  autoComplete="off"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  error={feeError}
                />
              </div>
              <Button type="submit" disabled={saving} className="min-h-12 sm:mt-7">
                {saving ? "Saving…" : "Save"}
              </Button>
            </form>
            <Switch
              checked={region.isActive}
              label={region.isActive ? "Region shown in checkout" : "Region hidden from checkout"}
              onChange={(next) => onAskHide({ kind: "region", item: region }, next)}
            />
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Applies to "Other town in this region" and every town set to use the region fee. 0 = free delivery.
          </p>
          {message && (
            <FormAlert tone={message.tone} className="mt-3">
              {message.text}
            </FormAlert>
          )}

          <h3 className="mt-6 text-base font-semibold">Towns</h3>
          {region.towns.length === 0 ? (
            <p className="mt-2 text-sm text-text-muted">No towns yet: shoppers choose "Other town in this region".</p>
          ) : (
            <ul className="divide-y divide-border">
              {region.towns.map((town) => (
                <TownRow
                  key={`${town.id}-${town.updatedAt}`}
                  town={town}
                  regionFee={region.feePesewas}
                  onSaved={(saved) => onTownSaved(region.id, saved)}
                  onAskHide={(t, next) => onAskHide({ kind: "town", item: t, regionId: region.id }, next)}
                  announce={announce}
                />
              ))}
            </ul>
          )}
          <AddTown region={region} onAdded={(town) => onTownSaved(region.id, town)} announce={announce} />
        </div>
      )}
    </li>
  );
}

export default function AdminDeliveryPage() {
  useDocumentTitle("Delivery · Admin");
  const { data, error, loading, reload } = useApi("/api/admin/delivery-areas");
  const announce = useAnnounce();
  const [regions, setRegions] = useState([]);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (data?.regions) setRegions(data.regions);
  }, [data]);

  if (error?.status === 403) return <AccessDenied />;

  const sortTowns = (towns) => [...towns].sort((a, b) => a.name.localeCompare(b.name));

  function regionSaved(region) {
    setRegions((list) => list.map((r) => (r.id === region.id ? { ...region, towns: sortTowns(region.towns) } : r)));
  }

  function townSaved(regionId, town) {
    setRegions((list) =>
      list.map((r) => {
        if (r.id !== regionId) return r;
        const exists = r.towns.some((t) => t.id === town.id);
        const towns = exists ? r.towns.map((t) => (t.id === town.id ? town : t)) : [...r.towns, town];
        return { ...r, towns: sortTowns(towns) };
      }),
    );
  }

  async function setActive(target, active) {
    setBusy(true);
    setNotice(null);
    try {
      if (target.kind === "region") {
        const result = await api(`/api/admin/delivery-regions/${target.item.id}`, { method: "PATCH", body: { isActive: active } });
        regionSaved(result.region);
      } else {
        const result = await api(`/api/admin/delivery-towns/${target.item.id}`, { method: "PATCH", body: { isActive: active } });
        townSaved(target.regionId, result.town);
      }
      const text = `${target.item.name} is ${active ? "shown in" : "hidden from"} checkout.`;
      setNotice({ tone: "success", text });
      announce(text);
    } catch (err) {
      setNotice({ tone: "error", text: err.message });
      announce(err.message);
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  function askHide(target, next) {
    if (next) setActive(target, true);
    else setPending(target);
  }

  return (
    <>
      <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">Delivery</h1>
      <p className="mt-3 max-w-2xl text-text-body">
        Fees are charged from Kumasi. Changing a fee only affects new orders.
      </p>
      {notice && (
        <FormAlert tone={notice.tone} className="mt-6 max-w-2xl">
          {notice.text}
        </FormAlert>
      )}

      <div className="mt-8">
        {error ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="space-y-3" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-card bg-disabled" />
            ))}
          </div>
        ) : (
          <ul className="space-y-4" aria-label="Delivery regions">
            {regions.map((region, index) => (
              <RegionCard
                key={region.id}
                region={region}
                defaultOpen={index === 0}
                onRegionSaved={regionSaved}
                onTownSaved={townSaved}
                onAskHide={askHide}
                announce={announce}
              />
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={pending ? `Hide ${pending.item.name} from checkout?` : ""}
        message={
          pending?.kind === "region"
            ? "Shoppers won't be able to choose this region or any of its towns. Past orders aren't affected."
            : "Shoppers won't be able to choose this town. Past orders aren't affected."
        }
        confirmLabel="Hide from checkout"
        cancelLabel="Keep it shown"
        busy={busy}
        onConfirm={() => setActive(pending, false)}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
