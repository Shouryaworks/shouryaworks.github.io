import FadeIn from "../components/FadeIn";
import EnquiryForm from "../components/EnquiryForm";
import { Link } from "../router";
import { useSiteContent } from "../content/SiteContentProvider";

export default function ContactPage() {
  const { content } = useSiteContent();
  const { contact } = content;

  return (
    <section className="relative flex min-h-[calc(100vh-100px)] flex-col items-center justify-center overflow-hidden px-5 py-20 sm:px-8 md:px-10">
      <div className="pointer-events-none absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-[#B600A8]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[8%] h-48 w-48 rounded-full bg-[#BE4C00]/20 blur-3xl" />
      <FadeIn className="glass-panel relative w-full max-w-5xl rounded-[40px] p-7 sm:p-10 md:rounded-[56px] md:p-16" y={40}>
        <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[#D7E2EA]/60 sm:text-sm">
          {contact.eyebrow}
        </p>
        <h1 className="hero-heading max-w-4xl text-[clamp(3.5rem,11vw,9rem)] font-black uppercase leading-[0.88] tracking-tight">
          {contact.title}
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#D7E2EA]/75 sm:text-lg md:text-xl">
          {contact.description}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={`mailto:${contact.email}`}
            className="glass-button rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-transform duration-300 hover:scale-105 sm:px-9"
          >
            {contact.ctaText}
          </a>
          <Link
            href={contact.secondaryCtaHref}
            className="rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#D7E2EA] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/10 sm:px-9"
          >
            {contact.secondaryCtaText}
          </Link>
        </div>

        {contact.socials.filter((social) => social.href.trim()).length ? (
          <ul className="mt-8 flex flex-wrap gap-3">
            {contact.socials
              .filter((social) => social.href.trim())
              .map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-[#D7E2EA]/80 transition-all duration-300 hover:bg-white/10 hover:text-white"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
          </ul>
        ) : null}

        {contact.formEnabled ? <EnquiryForm /> : null}
      </FadeIn>
    </section>
  );
}
