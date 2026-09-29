import { useEffect } from "react";
import { Eye, RefreshCw } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useSiteContent } from "../content/SiteContentProvider";
import AdminShell from "./AdminShell";
import LoginScreen from "./LoginScreen";
import { EnquiriesProvider } from "./EnquiriesProvider";
import DashboardPage from "./pages/DashboardPage";
import WebsitePage from "./pages/WebsitePage";
import ProjectsPage from "./pages/ProjectsPage";
import ImagesPage from "./pages/ImagesPage";
import EnquiriesPage from "./pages/EnquiriesPage";
import SettingsPage from "./pages/SettingsPage";
import { Button, LoadingBlock, ToastProvider, useToast } from "./ui";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Everything at a glance" },
  "/website": { title: "Website", subtitle: "Hero, about, services, previews, pricing, contact" },
  "/projects": { title: "Projects", subtitle: "NOVA Dinajpur and Porsche 911 Interactive Showcase" },
  "/images": { title: "Images", subtitle: "Library, uploads and usage" },
  "/enquiries": { title: "Enquiries", subtitle: "Messages from the contact form" },
  "/settings": { title: "Settings", subtitle: "Account, publishing and data" },
};

/**
 * Admin area.
 *
 * Everything below `/admin` is behind a Supabase session — the routes simply do
 * not exist for a signed-out visitor, and every write is additionally blocked by
 * row-level security on the database itself.
 */
export default function AdminApp({ route }: { route: string }) {
  const { status } = useAuth();

  // The browser title should never sit on "Shourya | Designer & Developer".
  useEffect(() => {
    const previous = document.title;
    document.title = "Admin · Shourya";
    return () => {
      document.title = previous;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="admin-backdrop min-h-screen font-kanit">
        <LoadingBlock label="Checking your session" />
      </div>
    );
  }

  if (status !== "authenticated") return <LoginScreen />;

  return (
    <ToastProvider>
      <EnquiriesProvider>
        <AdminArea route={route} />
      </EnquiriesProvider>
    </ToastProvider>
  );
}

function AdminArea({ route }: { route: string }) {
  const { dirty, openPreview, save, saving, refresh } = useSiteContent();
  const { push } = useToast();
  const meta = TITLES[route] ?? TITLES["/"];

  const page = (() => {
    switch (route) {
      case "/website":
        return <WebsitePage />;
      case "/projects":
        return <ProjectsPage />;
      case "/images":
        return <ImagesPage />;
      case "/enquiries":
        return <EnquiriesPage />;
      case "/settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  })();

  return (
    <AdminShell
      title={meta.title}
      subtitle={meta.subtitle}
      actions={
        <>
          <Button type="button" size="sm" variant="ghost" onClick={openPreview}>
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={dirty ? "primary" : "ghost"}
            loading={saving}
            onClick={() =>
              void save().then((result) =>
                push(
                  result.errors.length ? result.errors.join(" ") : result.message,
                  result.ok ? (result.mode === "remote" ? "success" : "info") : "error",
                ),
              )
            }
          >
            {dirty ? "Save" : "Saved"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="subtle"
            onClick={() => void refresh()}
            aria-label="Reload content from the backend"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </>
      }
    >
      {page}
    </AdminShell>
  );
}
