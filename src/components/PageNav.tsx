import { Link } from "../router";
import { useSiteContent } from "../content/SiteContentProvider";
import { usePathname } from "../router";

export default function PageNav() {
  const { content } = useSiteContent();
  const path = usePathname();

  return (
    <nav className="glass-nav relative z-50 mx-4 mt-4 flex items-center justify-between gap-2 rounded-full px-3 py-3 sm:mx-6 sm:mt-6 sm:px-5 md:mx-10 md:mt-8">
      <Link
        href="/"
        className="glass-logo rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#D7E2EA] transition-transform duration-300 hover:scale-105 md:text-base"
      >
        {content.settings.brand}
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        {content.settings.navLinks.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            aria-current={path === link.href ? "page" : undefined}
            className="rounded-full px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#D7E2EA] transition-all duration-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-md sm:px-4 sm:text-xs md:text-sm"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
