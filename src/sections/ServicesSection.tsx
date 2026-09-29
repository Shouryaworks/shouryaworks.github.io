import FadeIn from "../components/FadeIn";
import { useSiteContent } from "../content/SiteContentProvider";

export default function ServicesSection() {
  const { content } = useSiteContent();
  const services = content.services.items.filter((service) => service.visible);

  return (
    <section
      id="services"
      className="rounded-t-[40px] bg-white px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <FadeIn
        as="h2"
        delay={0}
        y={40}
        className="mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight text-[#0C0C0C] sm:mb-20 md:mb-28"
      >
        {content.services.title}
      </FadeIn>

      {content.services.description.trim() ? (
        <FadeIn
          as="p"
          delay={0.1}
          y={20}
          className="mx-auto mb-16 max-w-2xl text-center font-light leading-relaxed text-[#0C0C0C]/60"
        >
          {content.services.description}
        </FadeIn>
      ) : null}

      <ul className="mx-auto w-full max-w-5xl">
        {services.map((service, index) => (
          <FadeIn
            as="li"
            key={service.id}
            delay={index * 0.1}
            y={30}
            className="flex items-start gap-4 border-b border-[rgba(12,12,12,0.15)] py-8 first:border-t sm:gap-6 sm:py-10 md:gap-8 md:py-12"
          >
            <span
              className="shrink-0 font-black leading-none text-[#0C0C0C]"
              style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="flex min-w-0 flex-col justify-center gap-1 sm:gap-2">
              <h3
                className="font-medium uppercase leading-tight text-[#0C0C0C]"
                style={{ fontSize: "clamp(1rem, 2.2vw, 2.1rem)" }}
              >
                {service.title}
              </h3>
              <p
                className="max-w-2xl font-light leading-relaxed text-[#0C0C0C] opacity-60"
                style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)" }}
              >
                {service.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </ul>
    </section>
  );
}
