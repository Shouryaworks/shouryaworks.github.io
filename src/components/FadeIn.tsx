import { motion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

/**
 * `motion.create()` is the current way to build a motion component for an
 * arbitrary element type, so we memoise one per tag instead of hard-coding a
 * list of `motion.div` / `motion.h2` / ... wrappers.
 */
type AnyMotionComponent = typeof motion.div;

const cache = new Map<ElementType, AnyMotionComponent>();

function getMotion(tag: ElementType): AnyMotionComponent {
  const cached = cache.get(tag);
  if (cached) return cached;
  const created = motion.create(tag) as unknown as AnyMotionComponent;
  cache.set(tag, created);
  return created;
}

export type FadeInProps = {
  /** Element (or component) to animate. */
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
} & Record<string, unknown>;

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function FadeIn({
  as = "div",
  children,
  className,
  style,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  ...rest
}: FadeInProps) {
  const Comp = getMotion(as);

  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
