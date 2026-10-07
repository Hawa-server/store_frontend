import { ShieldAlert } from "lucide-react";
import Button from "./Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function AccessDenied() {
  useDocumentTitle("No access");

  return (
    <div className="flex flex-col items-center px-4 py-20 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-status-alert-bg text-status-alert-text">
        <ShieldAlert className="size-7" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-display text-4xl font-semibold sm:text-5xl">You don't have access to this page.</h1>
      <p className="mt-4 max-w-md text-lg text-text-body">
        This area is for store staff. If you think you should have access, log in with your admin account.
      </p>
      <Button to="/" className="mt-8">
        Back to the shop
      </Button>
    </div>
  );
}
