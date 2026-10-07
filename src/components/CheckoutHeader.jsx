import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import PageContainer from "./PageContainer";
import ThemeToggle from "./ThemeToggle";
import Logo from "./ui/Logo";

export default function CheckoutHeader() {
  return (
    <header className="border-b border-border bg-bg">
      <PageContainer className="flex h-16 items-center gap-3 lg:h-20">
        <div className="flex flex-1">
          <Logo />
        </div>
        <p className="hidden items-center gap-2 text-text-muted sm:flex">
          <Lock className="size-4.5" strokeWidth={1.7} aria-hidden="true" />
          Secure checkout
        </p>
        <div className="flex flex-1 items-center justify-end gap-1">
          <Link
            to="/products"
            className="inline-flex min-h-11 items-center px-1 text-sm font-semibold whitespace-nowrap text-accent underline underline-offset-4 hover:text-accent-dark sm:text-base"
          >
            Continue shopping
          </Link>
          <ThemeToggle className="-mr-2.5" />
        </div>
      </PageContainer>
    </header>
  );
}
