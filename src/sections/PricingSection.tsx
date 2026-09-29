import { Check } from "lucide-react";
import FadeIn from "../components/FadeIn";
import { Link } from "../router";
import { useSiteContent } from "../content/SiteContentProvider";

/**
 * Renders nothing until pricing tiers exist, so the shipped portfolio is
 * untouched. Once tiers are added from the admin panel they appear on the
 * pricing page using the same glass language as the project cards.
 */
export default function PricingSection() {
  const { content } = useSiteContent();
  const { pricing } = content;
  const tiers = pricing.tiers.filter((tier) => tier.visible);

  if (!tiers.length) return null;

  return (
    <section
      id="pricing"
      className="rounded-t-[40px] bg-[#0C0C0C] px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <FadeIn
        as="h2"
        delay={0}
        y={40}
        className="hero-heading mb-6 text-center text-[clamp(2.5rem,8vw,96px)] font-black uppercase leading-none tracking-tight"
      >
        {pricing.title}
      </FadeIn>

      {pricing.subtitle.trim() ? (
        <FadeIn
          as="p"
          delay={0.1}
          y={20}
          className="mx-auto mb-16 max-w-2xl text-center font-light leading-relaxed text-[#D7E2EA]/70"
        >
          {pricing.subtitle}
        </FadeIn>
      ) : null}

      <ul className="mx-auto grid w-full max-w-5xl gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <FadeIn
            as="li"
            key={tier.id}
            delay={index * 0.08}
            y={30}
            className={`glass-panel flex flex-col rounded-[32px] border p-7 sm:p-8 ${
              tier.highlighted
                ? "border-[#B600A8]/40 shadow-[0_20px_70px_rgba(182,0,168,0.18)]"
                : "border-white/12"
            }`}
          >
            <h3 className="text-xs uppercase tracking-[0.24em] text-[#D7E2EA]/60">{tier.title}</h3>

            <p className="mt-4 flex items-baseline gap-2">
              <span className="hero-heading text-4xl font-black uppercase leading-none sm:text-5xl">
                {tier.price}
              </span>
              {tier.period.trim() ? (
                <span className="text-xs uppercase tracking-[0.18em] text-[#D7E2EA]/50">
                  {tier.period}
                </span>
              ) : null}
            </p>

            {tier.description.trim() ? (
              <p className="mt-4 font-light leading-relaxed text-[#D7E2EA]/70">{tier.description}</p>
            ) : null}

            {tier.features.length ? (
              <ul className="mt-6 flex flex-col gap-2.5">
                {tier.features.filter(Boolean).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-[#D7E2EA]/80">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#B600A8]"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <Link
              href={tier.ctaHref || "/contact"}
              className="mt-8 inline-block self-start rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#D7E2EA] transition-all duration-300 hover:scale-105 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA]"
            >
              {tier.ctaText}
            </Link>
          </FadeIn>
        ))}
      </ul>

      {pricing.note.trim() ? (
        <FadeIn as="p" delay={0.2} y={20} className="mx-auto mt-12 max-w-2xl text-center text-xs uppercase tracking-[0.2em] text-[#D7E2EA]/45">
          {pricing.note}
        </FadeIn>
      ) : null}
    </section>
  );
}
