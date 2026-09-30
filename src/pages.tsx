import { lazy, Suspense, useEffect, useState } from "react";
import PageNav from "./components/PageNav";
import HeroSection from "./sections/HeroSection";
import MarqueeSection from "./sections/MarqueeSection";
import AboutSection from "./sections/AboutSection";
import ServicesSection from "./sections/ServicesSection";
import PricingSection from "./sections/PricingSection";
import ProjectsSection from "./sections/ProjectsSection";
import ContactPage from "./sections/ContactPage";
import { usePathname } from "./router";
import { useSiteContent } from "./content/SiteContentProvider";
import { applySeo, releaseStaleHeroPreload } from "./lib/seo";

/**
 * The admin panel is a separate chunk: a visitor to the portfolio never
 * downloads a byte of it, and the public bundle stays the size it always was.
 */
const AdminApp = lazy(() => import("./admin/AdminApp"));

function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
    </>
  );
}

/** One continuous page: services introduction → pricing packages → custom order. */
function PricingPage() {
  return <PricingSection />;
}

export default function Pages() {
  const initial = usePathname();
  const [path, setPath] = useState(initial);
  const { content, imageFor } = useSiteContent();

  useEffect(() => {
    const handlePopState = () => setPath(usePathname());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Keeps the document head in step with the editable settings.
  useEffect(() => {
    applySeo(
      content.settings,
      content.settings.ogImage ? imageFor(content.settings.ogImage) : null,
    );
  }, [content.settings, imageFor]);

  // The hero preload is only useful on the page that shows the hero.
  useEffect(() => {
    if (path !== "/") releaseStaleHeroPreload();
  }, [path]);

  if (path === "/admin" || path.startsWith("/admin/")) {
    return (
      <Suspense
        fallback={
          <div className="admin-backdrop flex min-h-screen items-center justify-center font-kanit">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D7E2EA]/50">
              Opening the studio
            </span>
          </div>
        }
      >
        <AdminApp route={path.slice("/admin".length) || "/"} />
      </Suspense>
    );
  }

  const content_ = (() => {
    switch (path) {
      case "/about":
        return <AboutSection />;
      case "/pricing":
        return <PricingPage />;
      case "/projects":
        return <ProjectsSection />;
      case "/contact":
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  })();

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0C0C0C] font-kanit">
      <PageNav />
      <main id="main">{content_}</main>
    </div>
  );
}
