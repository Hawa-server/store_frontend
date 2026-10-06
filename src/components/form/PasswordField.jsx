import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TextField from "./TextField";

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField {...props} type={visible ? "text" : "password"} inputClassName="pr-14">
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-field text-text-muted hover:text-text"
      >
        {visible ? (
          <EyeOff className="size-5" strokeWidth={1.6} aria-hidden="true" />
        ) : (
          <Eye className="size-5" strokeWidth={1.6} aria-hidden="true" />
        )}
      </button>
    </TextField>
  );
}
