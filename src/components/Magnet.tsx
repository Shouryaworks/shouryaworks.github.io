import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue } from "framer-motion";

export type MagnetProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Extra distance (px) around the element that still counts as "inside". */
  padding?: number;
  /** Divisor for the pointer offset — bigger means a subtler pull. */
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
};

/**
 * Magnetic hover: while the cursor is within `padding` of the element's box the
 * element drifts towards it, otherwise it eases back to rest.
 */
export default function Magnet({
  children,
  className,
  style,
  padding = 100,
  strength = 2,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      // Positive when the pointer sits to the right of / below the centre.
      const offsetX = event.clientX - centerX;
      const offsetY = event.clientY - centerY;

      const inside =
        Math.abs(offsetX) < rect.width / 2 + padding &&
        Math.abs(offsetY) < rect.height / 2 + padding;

      if (inside) {
        setIsActive(true);
        x.set(offsetX / strength);
        y.set(offsetY / strength);
      } else {
        setIsActive(false);
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [padding, strength, x, y]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        x,
        y,
        willChange: "transform",
        transition: isActive ? activeTransition : inactiveTransition,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
