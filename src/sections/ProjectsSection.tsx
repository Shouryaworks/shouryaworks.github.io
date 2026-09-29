import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FadeIn from "../components/FadeIn";
import LiveProjectButton from "../components/LiveProjectButton";
import ResponsiveImage from "../components/ResponsiveImage";
import { useSiteContent } from "../content/SiteContentProvider";
import type { ProjectItem, ProjectImageSlot } from "../content/types";

/** Each successive card sits a little lower and scales a little smaller. */
const CARD_OFFSET_STEP = 28;
const SCALE_STEP = 0.03;

/** Sticky offset expressed with a custom property so Tailwind can still own
 *  the responsive part (top-24 on mobile, top-32 from md). */
const stickyStyle = (index: number): CSSProperties =>
  ({ "--stack-offset": `${index * CARD_OFFSET_STEP}px` } as CSSProperties);

type ProjectCardProps = {
  project: ProjectItem;
  index: number;
  total: number;
};

function ProjectCard({ project, index, total }: ProjectCardProps) {
  const track = useRef<HTMLDivElement>(null);
  const { imageFor } = useSiteContent();

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  const targetScale = 1 - (total - 1 - index) * SCALE_STEP;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  /** The three card tiles, in slot order, falling back to gallery order. */
  const pick = (slot: ProjectImageSlot) => {
    const inSlot = project.images.find((image) => image.slot === slot);
    return inSlot ?? project.images.filter((image) => image.slot !== "extra")[slot === "a" ? 0 : slot === "b" ? 1 : 2];
  };

  const tileA = pick("a");
  const tileB = pick("b");
  const tileC = pick("c");
  const extras = project.images.filter((image) => image.slot === "extra");

  return (
    <>
      <div
        ref={track}
        className="sticky top-[calc(6rem+var(--stack-offset))] h-[85vh] md:top-[calc(8rem+var(--stack-offset))]"
        style={stickyStyle(index)}
      >
        <motion.article
          style={{ scale, willChange: "transform" }}
          className="glass-project flex h-full flex-col gap-4 rounded-[40px] border border-white/20 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:gap-6 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
        >
          {/* ------------------------------------------------------- header */}
          {/*
            The title block has a min-width, so on a phone — where the huge
            number plus the pill leave too little room — the button wraps onto its
            own line instead of colliding with the project name. From `sm` up there
            is always spare room and the layout stays on one line.
          */}
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 sm:gap-x-6">
            <div className="flex min-w-0 items-start gap-4 sm:gap-6 md:gap-8">
              <span
                className="shrink-0 font-black leading-none text-[#D7E2EA]"
                style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}
              >
                {project.number}
              </span>

              <div className="flex min-w-[9rem] flex-1 flex-col justify-center gap-1 pt-1 sm:min-w-[12rem] sm:gap-2 sm:pt-2">
                <p className="text-[#D7E2EA] text-xs uppercase tracking-widest opacity-60 sm:text-sm">
                  {project.category}
                </p>
                <h3
                  className="font-medium uppercase leading-tight text-[#D7E2EA]"
                  style={{ fontSize: "clamp(1rem, 2.2vw, 2.1rem)" }}
                >
                  {project.name}
                </h3>
              </div>
            </div>

            {project.ctaText.trim() ? (
              <LiveProjectButton
                className="ml-auto"
                href={project.url.trim() || "/projects"}
                text={project.ctaText}
              />
            ) : null}
          </div>

          {/* -------------------------------------------------------- images */}
          {/*
            The row is `flex-1 min-h-0` so the card always fits its 85vh box. The
            two left tiles carry the specified clamp() heights and only compress
            when a short viewport would otherwise push the card off-screen.
          */}
          <div className="flex min-h-0 flex-1 gap-3 sm:gap-4 md:gap-6">
            <div className="flex h-full min-h-0 w-[40%] flex-col gap-3 sm:gap-4 md:gap-6">
              <div
                className="min-h-0 overflow-hidden rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
                style={{ height: "clamp(130px, 16vw, 230px)" }}
              >
                <ResponsiveImage
                  image={imageFor(tileA?.image ?? "")}
                  sizes="40vw"
                  alt={tileA?.alt || `${project.name} screen one`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                className="min-h-0 overflow-hidden rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
                style={{ height: "clamp(160px, 22vw, 340px)" }}
              >
                <ResponsiveImage
                  image={imageFor(tileB?.image ?? "")}
                  sizes="40vw"
                  alt={tileB?.alt || `${project.name} screen two`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="h-full min-h-0 w-[60%] overflow-hidden rounded-[40px] sm:rounded-[50px] md:rounded-[60px]">
              <ResponsiveImage
                image={imageFor(tileC?.image ?? "")}
                sizes="60vw"
                alt={tileC?.alt || `${project.name} hero screen`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </motion.article>
      </div>

      {/*
        Gallery images beyond the three card tiles scroll with the card instead
        of stacking, so the sticky stack above is untouched.
      */}
      {extras.length ? (
        <div className="mx-auto mt-6 flex w-full max-w-[1400px] flex-wrap gap-3 sm:gap-4 md:gap-6">
          {extras.map((extra) => (
            <div
              key={extra.id}
              className="h-[180px] w-[240px] overflow-hidden rounded-[28px] border border-white/10 sm:h-[240px] sm:w-[320px] md:h-[300px] md:w-[420px]"
            >
              <ResponsiveImage
                image={imageFor(extra.image)}
                sizes="420px"
                alt={extra.alt || `${project.name} gallery image`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export default function ProjectsSection() {
  const { content } = useSiteContent();
  const projects = content.projects.items.filter((project) => project.visible);

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 pb-20 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pb-24 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-32 md:pt-32"
    >
      <FadeIn
        as="h2"
        delay={0}
        y={40}
        className="hero-heading mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28"
      >
        {content.projects.title}
      </FadeIn>

      {content.projects.subtitle.trim() ? (
        <FadeIn
          as="p"
          delay={0.1}
          y={20}
          className="mx-auto mb-14 max-w-2xl text-center font-light leading-relaxed text-[#D7E2EA]/70"
        >
          {content.projects.subtitle}
        </FadeIn>
      ) : null}

      <div className="mx-auto w-full max-w-[1400px]">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            total={projects.length}
          />
        ))}

        {projects.length === 0 ? (
          <FadeIn className="mx-auto max-w-lg text-center text-sm uppercase tracking-[0.2em] text-[#D7E2EA]/50">
            No projects are published yet.
          </FadeIn>
        ) : null}
      </div>
    </section>
  );
}
