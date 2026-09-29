import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export function Link({ href, onClick, ...props }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("/") && !href.startsWith("//")) {
      event.preventDefault();
      window.history.pushState({}, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
    onClick?.(event);
  };

  return <a href={href} onClick={handleClick} {...props} />;
}

export function usePathname() {
  return window.location.pathname.replace(/\/$/, "") || "/";
}
