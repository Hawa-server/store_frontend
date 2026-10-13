import { ChevronDown } from "lucide-react";
import Button from "../Button";
import FormAlert from "../form/FormAlert";
import { FieldError, inputClasses } from "../form/TextField";
import { useMoney } from "../../lib/money";
import { OTHER_TOWN } from "../../lib/delivery";

function Select({ id, label, value, onChange, disabled, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClasses} appearance-none pr-10 ${error ? "border-status-alert-text" : "border-input-border"}`}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
      </div>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}

export default function DeliveryAreaFields({ areas, value, onChange, errors = {} }) {
  const money = useMoney();
  const { data, error, loading, reload } = areas;
  const regions = data?.regions ?? [];
  const region = regions.find((r) => String(r.id) === String(value.regionId));

  if (error) {
    return (
      <FormAlert
        action={
          <Button variant="secondary" onClick={reload}>
            Try again
          </Button>
        }
      >
        We couldn't load the delivery areas. {error.message}
      </FormAlert>
    );
  }

  if (loading && !data) {
    return (
      <div className="grid animate-pulse gap-5 sm:grid-cols-2" aria-hidden="true">
        <div className="h-20 rounded-field bg-disabled" />
        <div className="h-20 rounded-field bg-disabled" />
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Select
        id="delivery-region"
        label="Region"
        value={value.regionId}
        onChange={(event) => onChange({ regionId: event.target.value, townKey: "" })}
        error={errors.region}
      >
        <option value="">Choose a region</option>
        {regions.map((r) => (
          <option key={r.id} value={String(r.id)}>
            {r.name} — {money({ ghs: r.feeGhs, usd: r.feeUsd })}
          </option>
        ))}
      </Select>
      <Select
        id="delivery-town"
        label="Town"
        value={value.townKey}
        onChange={(event) => onChange({ ...value, townKey: event.target.value })}
        disabled={!region}
        error={errors.town}
      >
        <option value="">{region ? "Choose a town" : "Choose a region first"}</option>
        {region?.towns.map((t) => (
          <option key={t.id} value={String(t.id)}>
            {t.name} — {money({ ghs: t.feeGhs, usd: t.feeUsd })}
          </option>
        ))}
        {region && (
          <option value={OTHER_TOWN}>
            Other town in this region — {money({ ghs: region.feeGhs, usd: region.feeUsd })}
          </option>
        )}
      </Select>
    </div>
  );
}
