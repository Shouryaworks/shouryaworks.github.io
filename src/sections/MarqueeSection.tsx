import { useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import ResponsiveImage from "../components/ResponsiveImage";
import type { MarqueeItem } from "../assets";
import { useSiteContent } from "../content/SiteContentProvider";

/** Scroll weight applied to the raw page-scroll distance. */
const SCROLL_FACTOR = 0.3;
/** Base offset subtracted from the parallax distance. */
const PARALLAX_BASE = 200;

const TILE_SIZES = "420px";

type RowProps = {
  items: MarqueeItem[];
  /** +1 drifts right with the scroll, -1 drifts left. */
  direction: 1 | -1;
  distance: MotionValue<number>;
};

function MarqueeRow({ items, direction, distance }: RowProps) {
  // Tripled so the strip can travel a full tile-length before wrapping.
  const loop = useMemo(() => [...items, ...items, ...items], [items]);

  const x = useTransform(distance, (value) => `${direction * value}px`);

  return (
    <motion.div className="flex gap-3" style={{ x, willChange: "transform" }}>
      {loop.map((item, index) => {
        const isDuplicate = index >= items.length;
        return (
          <div
            key={`${item.slug}-${index}`}
            className="h-[270px] w-[420px] shrink-0 overflow-hidden rounded-2xl"
          >
            <ResponsiveImage
              image={item}
              sizes={TILE_SIZES}
              alt={isDuplicate ? "" : item.alt}
              aria-hidden={isDuplicate}
              className="h-full w-full object-cover"
            />
          </div>
        );
      })}
    </motion.div>
  );
}

export default function MarqueeSection() {
  const { content, imageFor, library } = useSiteContent();
  const section = useRef<HTMLElement>(null);
  const distance = useMotionValue(0);

  /**
   * The strip is driven by image ids held in the content document, so tiles can
   * be reordered, added or removed from the admin panel without touching code.
   */
  const build = (ids: string[]): MarqueeItem[] =>
    ids
      .map((id) => {
        const asset = library.find((entry) => entry.id === id);
        return {
          ...imageFor(id),
          slug: id,
          alt: asset?.alt ?? "Website preview",
        };
      })
      .filter((item) => Boolean(item.src));

  const rowOne = useMemo(
    () => build(content.marquee.rowOne),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content.marquee.rowOne, library],
  );
  const rowTwo = useMemo(
    () => build(content.marquee.rowTwo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content.marquee.rowTwo, library],
  );

  useEffect(() => {
    const measure = () => {
      const top = section.current?.offsetTop ?? 0;
      const offset = (window.scrollY - top + window.innerHeight) * SCROLL_FACTOR;
      distance.set(offset - PARALLAX_BASE);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [distance]);

  if (!rowOne.length && !rowTwo.length) return null;

  return (
    <section
      ref={section}
      className="overflow-hidden bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40"
      aria-label={content.marquee.title}
    >
      <div className="flex flex-col gap-3">
        {rowOne.length ? (
          <MarqueeRow items={rowOne} direction={1} distance={distance} />
        ) : null}
        {rowTwo.length ? (
          <MarqueeRow items={rowTwo} direction={-1} distance={distance} />
        ) : null}
      </div>
    </section>
  );
}
