import type { CSSProperties, ImgHTMLAttributes } from "react";
import type { LocalImage } from "../assets";

export type ResponsiveImageProps = {
  image: LocalImage;
  alt: string;
  /** CSS `sizes` descriptor, e.g. "40vw". Omit to emit a bare 1x/2x choice. */
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height" | "alt">;

/**
 * Renders a locally hosted asset with a 1x/2x `srcset`, an explicit
 * `sizes` hint, and intrinsic `width`/`height` so nothing shifts on load.
 */
export default function ResponsiveImage({
  image,
  alt,
  sizes,
  className,
  style,
  priority = false,
  ...rest
}: ResponsiveImageProps) {
  /*
   * React 18 does not map the camelCase `fetchPriority` prop onto the DOM
   * attribute (it warns in development), so the attribute is passed in its
   * lowercase form, which React forwards verbatim and the HTML spec expects.
   */
  const fetchPriority = priority
    ? ({ fetchpriority: "high" } as Record<string, string>)
    : undefined;

  return (
    <img
      src={image.src}
      srcSet={`${image.src} ${image.width}w, ${image.src2x} ${image.width2x}w`}
      sizes={sizes}
      alt={alt}
      width={image.width}
      height={image.height}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...fetchPriority}
      {...rest}
    />
  );
}
