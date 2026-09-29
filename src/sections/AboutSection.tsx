import FadeIn from "../components/FadeIn";
import AnimatedText from "../components/AnimatedText";
import ContactButton from "../components/ContactButton";
import ResponsiveImage from "../components/ResponsiveImage";
import { useSiteContent } from "../content/SiteContentProvider";

export default function AboutSection() {
  const { content, imageFor } = useSiteContent();
  const { about } = content;

  return (
    <section
      id="about"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0C0C0C] px-5 py-20 sm:px-8 md:px-10"
    >
      {/* ------------------------------------------------- decorative 3D */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]"
      >
        <ResponsiveImage
          image={imageFor(about.decor.moon)}
          sizes="(min-width: 768px) 210px, (min-width: 640px) 160px, 120px"
          alt="3D moon"
          className="block h-auto w-full"
        />
      </FadeIn>

      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]"
      >
        <ResponsiveImage
          image={imageFor(about.decor.lego)}
          sizes="(min-width: 768px) 210px, (min-width: 640px) 160px, 120px"
          alt="3D lego brick"
          className="block h-auto w-full"
        />
      </FadeIn>

      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]"
      >
        <ResponsiveImage
          image={imageFor(about.decor.p59)}
          sizes="(min-width: 768px) 180px, (min-width: 640px) 140px, 100px"
          alt="3D abstract object"
          className="block h-auto w-full"
        />
      </FadeIn>

      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]"
      >
        <ResponsiveImage
          image={imageFor(about.decor.group)}
          sizes="(min-width: 768px) 220px, (min-width: 640px) 170px, 130px"
          alt="3D abstract group"
          className="block h-auto w-full"
        />
      </FadeIn>

      {/* --------------------------------------------------------- content */}
      <FadeIn
        as="h2"
        delay={0}
        y={40}
        className="hero-heading text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight"
      >
        {about.title}
      </FadeIn>

      <FadeIn
        delay={0.2}
        y={30}
        className="mt-10 flex w-full max-w-[560px] justify-center sm:mt-14 md:mt-16"
      >
        <AnimatedText
          text={about.body}
          className="text-center font-medium leading-relaxed text-[#D7E2EA]"
          style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
        />
      </FadeIn>

      {about.extraText.trim() ? (
        <FadeIn
          delay={0.35}
          y={24}
          className="mt-8 flex w-full max-w-[720px] justify-center"
        >
          <div className="text-center">
            {about.extraTitle.trim() ? (
              <h3 className="mb-3 text-lg font-medium uppercase tracking-[0.2em] text-[#D7E2EA]/70 sm:text-xl">
                {about.extraTitle}
              </h3>
            ) : null}
            <p className="text-center font-light leading-relaxed text-[#D7E2EA]/75">
              {about.extraText}
            </p>
          </div>
        </FadeIn>
      ) : null}

      {about.location.trim() ? (
        <FadeIn delay={0.4} y={20} className="mt-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#D7E2EA]/50 sm:text-sm">
            {about.location}
          </p>
        </FadeIn>
      ) : null}

      {about.ctaText.trim() ? (
        <FadeIn delay={0.45} y={20} className="mt-16 sm:mt-20 md:mt-24">
          <ContactButton text={about.ctaText} href={about.ctaHref} />
        </FadeIn>
      ) : null}
    </section>
  );
}
