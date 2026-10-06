import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import Button from "./Button";
import PageContainer from "./PageContainer";
import { PLACEHOLDER } from "./Img";
import { ikUrl } from "../lib/format";
import heroSlides from "../config/heroSlides";

const INTERVAL_MS = 6000;

const pauseCircle =
  "inline-flex size-8 items-center justify-center rounded-full border border-hero-text/60 bg-scrim/35 text-hero-text backdrop-blur-sm transition-colors group-hover:bg-hero-text/20";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function SlidePhoto({ slide, eager }) {
  const [failed, setFailed] = useState(false);
  const style = { "--pos-phone": slide.phonePosition, "--pos-desktop": slide.desktopPosition };
  const imgClass =
    "absolute inset-0 size-full object-cover object-[var(--pos-phone)] md:object-[var(--pos-desktop)]";

  if (failed) return <img src={PLACEHOLDER} alt={slide.alt} className={imgClass} />;

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={ikUrl(slide.image, slide.desktopTransform)} />
      <img
        src={ikUrl(slide.image, slide.phoneTransform)}
        alt={slide.alt}
        style={style}
        className={imgClass}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        onLoad={eager ? slide.onLoad : undefined}
        onError={() => setFailed(true)}
      />
    </picture>
  );
}

function Slide({ slide, index, total, active, showPhoto, onFirstLoad }) {
  const right = slide.textSide === "right";

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} of ${total}`}
      aria-hidden={!active}
      inert={!active}
      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
        active ? "z-10 opacity-100" : "z-0 opacity-0"
      }`}
    >
      {showPhoto && <SlidePhoto slide={{ ...slide, onLoad: onFirstLoad }} eager={index === 0} />}

      <div className="absolute inset-0 bg-linear-to-t from-scrim/90 via-scrim/70 via-45% to-scrim/0 md:hidden" />
      <div
        className={`absolute inset-0 hidden from-scrim/85 via-scrim/70 via-45% to-scrim/0 md:block ${
          right ? "bg-linear-to-l" : "bg-linear-to-r"
        }`}
      />

      <PageContainer
        className={`relative flex h-full flex-col justify-end pb-24 md:justify-center md:pb-12 ${
          right ? "md:items-end" : "md:items-start"
        }`}
      >
        <div className="max-w-xl text-hero-text lg:max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.24em] text-hero-eyebrow uppercase sm:text-sm">
            {slide.heading}
          </p>
          <h2 className="mt-3 font-display text-[2.75rem] leading-[1.02] font-semibold text-balance sm:text-6xl lg:text-[5.25rem] lg:leading-[0.98]">
            {slide.headline}
          </h2>
          <p className="mt-4 max-w-md text-base text-hero-text/90 sm:text-lg lg:mt-6">{slide.sentence}</p>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-8">
            <Button to={slide.button.to} variant="photo" className="w-full sm:w-auto">
              {slide.button.text}
            </Button>
            {slide.secondButton && (
              <span className="hidden sm:contents">
                <Button to={slide.secondButton.to} variant="photoOutline">
                  {slide.secondButton.text}
                </Button>
              </span>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

export default function HeroSlider({ slides = heroSlides }) {
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(prefersReducedMotion);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [restReady, setRestReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event) => {
      if (event.matches) setUserPaused(true);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (restReady) return;
    const timer = setTimeout(() => setRestReady(true), 3000);
    return () => clearTimeout(timer);
  }, [restReady]);

  useEffect(() => {
    if (userPaused || hovered || focused || total < 2) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % total), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, userPaused, hovered, focused, total]);

  function goTo(next) {
    const target = (next + total) % total;
    setIndex(target);
    setAnnouncement(`Slide ${target + 1} of ${total}: ${slides[target].headline}`);
  }

  function togglePause() {
    setUserPaused((paused) => !paused);
    setAnnouncement(userPaused ? "Slideshow playing" : "Slideshow paused");
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative h-150 overflow-hidden bg-scrim md:h-170"
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => event.target.matches(":focus-visible") && setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {slides.map((slide, i) => (
        <Slide
          key={slide.image}
          slide={slide}
          index={i}
          total={total}
          active={i === index}
          showPhoto={i === 0 || i === index || restReady}
          onFirstLoad={() => setRestReady(true)}
        />
      ))}

      {total > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-20 md:bottom-10">
          <PageContainer className="flex items-center justify-center gap-1 md:justify-start">
            <div className="flex items-center md:-ml-3">
              {slides.map((slide, i) => (
                <button
                  key={slide.image}
                  type="button"
                  className="group inline-flex size-11 items-center justify-center rounded-full focus-visible:outline-hero-text"
                  aria-label={`Show slide ${i + 1} of ${total}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => goTo(i)}
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      i === index ? "w-7 bg-hero-text" : "w-2 bg-hero-text/50 group-hover:bg-hero-text/80"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              className="group inline-flex size-11 items-center justify-center rounded-full focus-visible:outline-hero-text"
              onClick={togglePause}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              title={userPaused ? "Play slideshow" : "Pause slideshow"}
            >
              <span className={pauseCircle}>
                {userPaused ? (
                  <Play className="ml-px size-3.5" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Pause className="size-3.5" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                )}
              </span>
            </button>
          </PageContainer>
        </div>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
