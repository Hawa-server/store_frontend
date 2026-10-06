import Button from "../components/Button";
import PageContainer from "../components/PageContainer";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFoundPage({
  title = "We couldn't find that page",
  message = "The page may have moved, or the link may be wrong. Everything in the shop is still here.",
}) {
  useDocumentTitle("Not found");

  return (
    <PageContainer className="flex flex-col items-center py-20 text-center lg:py-32">
      <p className="text-sm font-semibold tracking-[0.24em] text-accent uppercase">Error 404</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight font-semibold text-balance sm:text-5xl lg:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-md text-lg text-text-body">{message}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/products">Back to all products</Button>
        <Button to="/" variant="secondary">
          Go to the home page
        </Button>
      </div>
    </PageContainer>
  );
}
