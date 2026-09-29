type LiveProjectButtonProps = {
  className?: string;
  /** Defaults to the configured hero CTA destination when a project has no URL. */
  href?: string;
  text?: string;
};

export default function LiveProjectButton({
  className = "",
  href = "/projects",
  text = "Live Project",
}: LiveProjectButtonProps) {
  return (
    <a
      href={href}
      className={`inline-block shrink-0 rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 focus-visible:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base ${className}`}
    >
      {text}
    </a>
  );
}
