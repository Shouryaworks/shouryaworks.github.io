import { useEffect } from "react";
import Magnet from "../components/Magnet";
import FadeIn from "../components/FadeIn";
import ContactButton from "../components/ContactButton";
import ResponsiveImage from "../components/ResponsiveImage";
import { HERO_PORTRAIT_SIZES } from "../assets";
import { useSiteContent } from "../content/SiteContentProvider";
import { releaseStaleHeroPreload } from "../lib/seo";

export default function HeroSection() {
  const { content, imageFor } = useSiteContent();
  const { hero } = content;
  const portrait = imageFor(hero.portrait);

  /*
   * The portrait is the largest contentful paint, so index.html preloads the
   * shipped file. If the portrait has been replaced from the admin panel the
   * stale request is dropped rather than wasted.
   */
  useEffect(() => {
    releaseStaleHeroPreload(portrait.src);
  }, [portrait.src]);

  return (
    <section
      id="home"
      className="relative flex h-screen flex-col overflow-x-clip bg-[#0C0C0C]"
    >
      {/* ------------------------------------------------------------ nav */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-24 bg-gradient-to-b from-black/20 to-transparent" />
      {/* -------------------------------------------------------- heading */}
      <FadeIn
        delay={0.15}
        y={40}
        className="mt-6 overflow-hidden sm:mt-4 md:-mt-5"
      >
        {hero.badge ? (
          <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-[#D7E2EA]/50">
            {hero.badge}
          </p>
        ) : null}
        <h1
          className="hero-heading w-full whitespace-nowrap text-[14vw] font-black uppercase leading-none tracking-tight sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]"
        >
          {hero.headline}
        </h1>
      </FadeIn>

      {/* --------------------------------------------------------- bottom */}
      <div className="mt-auto flex items-end justify-between gap-6 pb-7 sm:pb-8 md:pb-10">
        <FadeIn
          as="p"
          delay={0.35}
          y={20}
          className="max-w-[160px] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[220px] md:max-w-[260px]"
          style={{ fontSize: "clamp(0.75rem, 1.4vw, 1.5rem)" }}
        >
          {hero.subtitle}
        </FadeIn>

        {/*
          The long hero description is not part of the visual design; it is
          exposed to assistive technology (and to anything reading the markup)
          without changing a single pixel.
        */}
        {hero.description.trim() ? <p className="sr-only">{hero.description}</p> : null}

        <FadeIn delay={0.5} y={20}>
          <ContactButton />
        </FadeIn>
      </div>

      {/* -------------------------------------------------------- portrait */}
      {/*
        The centring translate lives on this plain wrapper on purpose: a motion
        element writes its own inline `transform`, which would override the
        Tailwind `-translate-*` utilities.
      */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:bottom-0 sm:top-auto sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]">        <FadeIn delay={0.6} y={30}>
          <Magnet
            className="pointer-events-auto"
            padding={150}
            strength={3}
            activeTransition="transform 0.3s ease-out"
            inactiveTransition="transform 0.6s ease-in-out"
          >
            <ResponsiveImage
              image={portrait}
              sizes={HERO_PORTRAIT_SIZES}
              alt={hero.portraitAlt}
              priority
              className="block h-auto w-full select-none"
              draggable={false}
            />
          </Magnet>
        </FadeIn>
      </div>
    </section>
  );
}
