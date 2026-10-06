import PageContainer from "./PageContainer";

export default function AuthCard({ eyebrow, title, intro, children, footer }) {
  return (
    <PageContainer className="flex justify-center py-10 sm:py-16 lg:py-20">
      <div className="w-full max-w-md">
        <div className="rounded-card border border-border bg-surface px-5 py-8 shadow-sm sm:px-9 sm:py-10">
          {eyebrow && (
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
          )}
          <h1 className="mt-2 font-display text-4xl leading-tight font-semibold text-balance sm:text-[2.75rem]">
            {title}
          </h1>
          {intro && <div className="mt-3 text-text-body">{intro}</div>}
          <div className="mt-7">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-text-body">{footer}</div>}
      </div>
    </PageContainer>
  );
}
