import { Fragment, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

type AnimatedCharProps = {
  char: string;
  /** Scroll-progress window [start, end] this character fades across. */
  range: [number, number];
  progress: MotionValue<number>;
};

const MIN_OPACITY = 0.2;

function AnimatedChar({ char, range, progress }: AnimatedCharProps) {
  const opacity = useTransform(progress, range, [MIN_OPACITY, 1]);

  // The invisible placeholder reserves the glyph's box so revealing it never
  // reflows the line; the animated glyph is painted on top.
  return (
    <span className="relative inline-block">
      <span className="invisible">{char}</span>
      <motion.span className="absolute inset-0" style={{ opacity }}>
        {char}
      </motion.span>
    </span>
  );
}

export type AnimatedTextProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

export default function AnimatedText({ text, className = "", style }: AnimatedTextProps) {
  const target = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 0.8", "end 0.2"],
  });

  const total = useMemo(() => Array.from(text).length, [text]);

  /**
   * Words are `inline-block` + `nowrap` groups so a line can only break between
   * words, never inside one. Each glyph still gets its own scroll window based
   * on its position in the full string.
   */
  const nodes = useMemo<ReactNode[]>(() => {
    const words = text.split(" ").filter(Boolean);
    const out: ReactNode[] = [];
    let cursor = 0;

    words.forEach((word, wordIndex) => {
      if (wordIndex > 0) out.push(<Fragment key={`sp-${wordIndex}`}> </Fragment>);

      const chars = Array.from(word);
      const wordStart = cursor;
      cursor += chars.length + 1; // glyphs plus the trailing space

      out.push(
        <span key={`w-${wordIndex}`} className="inline-block whitespace-nowrap">
          {chars.map((char, charIndex) => (
            <AnimatedChar
              key={`c-${charIndex}`}
              char={char}
              range={[(wordStart + charIndex) / total, (wordStart + charIndex + 1) / total]}
              progress={scrollYProgress}
            />
          ))}
        </span>,
      );
    });

    return out;
  }, [text, total, scrollYProgress]);

  return (
    <p ref={target} className={className} style={style}>
      {/*
        The per-character markup is a purely visual effect, and because the
        placeholder glyphs are `visibility: hidden` the whole paragraph would
        otherwise vanish from the accessibility tree. So the real sentence is
        exposed once through a screen-reader-only span, while the character
        spans are hidden from assistive tech and excluded from selection —
        which also keeps copy/paste returning the sentence exactly once.
      */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="select-none">
        {nodes}
      </span>
    </p>
  );
}
