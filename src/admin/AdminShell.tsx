import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FolderKanban,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import { Link, usePathname } from "../router";
import { useAuth } from "../lib/auth";
import { useSiteContent } from "../content/SiteContentProvider";
import { useEnquiries } from "./EnquiriesProvider";
import { IconButton } from "./ui";

export const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/website", label: "Website", icon: Type, exact: false },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban, exact: false },
  { href: "/admin/images", label: "Images", icon: ImageIcon, exact: false },
  { href: "/admin/enquiries", label: "Enquiries", icon: Sparkles, exact: false },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon, exact: false },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const { unread } = useEnquiries();

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.exact ? path === item.href : path.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA] ${
              active
                ? "border border-white/15 bg-white/10 text-white"
                : "border border-transparent text-[#D7E2EA]/65 hover:bg-white/5 hover:text-[#D7E2EA]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 font-medium tracking-wide">{item.label}</span>
            {item.label === "Enquiries" && unread > 0 ? (
              <span className="rounded-full bg-[#B600A8] px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                {unread} new
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { session, signOut } = useAuth();
  const { backendConfigured, source } = useSiteContent();

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <div>
        <Link
          href="/admin"
          onClick={onNavigate}
          className="glass-logo inline-flex items-center gap-2 rounded-full px-4 py-2 transition-transform duration-300 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA]"
        >
          <span className="text-sm font-black uppercase tracking-[0.16em] text-[#D7E2EA]">
            Shourya
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[#D7E2EA]/50">
            Studio
          </span>
        </Link>
      </div>

      <NavList onNavigate={onNavigate} />

      <div className="mt-auto flex flex-col gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="truncate text-xs font-medium text-[#D7E2EA]/80">
            {session?.email ?? "Signed in"}
          </p>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] text-[#D7E2EA]/40">
            {backendConfigured
              ? `Content: ${source === "remote" ? "live" : "local copy"}`
              : "Backend not connected"}
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#D7E2EA]/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
        <Link
          href="/"
          className="text-center text-[0.68rem] uppercase tracking-[0.16em] text-[#D7E2EA]/40 transition-colors hover:text-[#D7E2EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA]"
        >
          View site
        </Link>
      </div>
    </div>
  );
}

export default function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The drawer is a modal surface on small screens, so Escape closes it.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="admin-backdrop min-h-screen font-kanit text-[#D7E2EA]">
      <div className="mx-auto flex w-full max-w-[1600px] gap-0 px-0 lg:gap-6 lg:px-6">
        <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 py-6 lg:block">
          <div className="glass-sidebar h-full overflow-y-auto rounded-[28px] border border-white/10">
            <SidebarContent />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="glass-nav sticky top-0 z-40 flex items-center justify-between gap-3 rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-6 lg:mt-0 lg:rounded-[24px] lg:border">
            <div className="flex min-w-0 items-center gap-3">
              <IconButton
                label="Open navigation"
                className="lg:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </IconButton>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-[#D7E2EA] sm:text-base">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="truncate text-[0.7rem] text-[#D7E2EA]/45">{subtitle}</p>
                ) : null}
              </div>
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </header>

          <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-16">{children}</main>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-label="Admin navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="glass-sidebar relative h-full w-[86%] max-w-[320px] overflow-y-auto border-r border-white/10"
            >
              <IconButton
                label="Close navigation"
                className="absolute right-4 top-5 z-10"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </IconButton>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
}
