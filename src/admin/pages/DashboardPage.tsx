import { useMemo } from "react";
import {
  ArrowUpRight,
  FolderKanban,
  Image as ImageIcon,
  Mail,
  RefreshCw,
  Sparkles,
  Type,
} from "lucide-react";
import { Link } from "../../router";
import { useSiteContent } from "../../content/SiteContentProvider";
import { useEnquiries } from "../EnquiriesProvider";
import { backendStatus, ping } from "../../lib/backend";
import { formatRelative, formatDateTime } from "../../lib/format";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Panel,
  Skeleton,
  useToast,
} from "../ui";
import PreviewFrame from "../components/PreviewFrame";
import type { ReactNode } from "react";

function Stat({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass-card flex items-start gap-4 rounded-[24px] border p-5 ${
        accent ? "border-[#B600A8]/35" : "border-white/10"
      }`}
    >
      <span className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[#D7E2EA]/70">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-3xl font-black leading-none text-[#D7E2EA]">{value}</p>
        <p className="mt-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[#D7E2EA]/55">
          {label}
        </p>
        {hint ? <p className="mt-1 text-xs text-[#D7E2EA]/40">{hint}</p> : null}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { content, library, refresh, source, lastSavedAt, remoteChecked } = useSiteContent();
  const { rows, unread, status, error, refresh: refreshEnquiries } = useEnquiries();
  const { push } = useToast();

  const visibleProjects = content.projects.items.filter((project) => project.visible).length;
  const recent = useMemo(() => rows.slice(0, 5), [rows]);

  const quickActions = [
    { href: "/admin/website?tab=hero", label: "Hero", icon: <Type className="h-3.5 w-3.5" /> },
    { href: "/admin/website?tab=about", label: "About", icon: <Type className="h-3.5 w-3.5" /> },
    {
      href: "/admin/website?tab=services",
      label: "Services",
      icon: <Type className="h-3.5 w-3.5" />,
    },
    {
      href: "/admin/website?tab=pricing",
      label: "Pricing",
      icon: <Type className="h-3.5 w-3.5" />,
    },
    {
      href: "/admin/projects",
      label: "Projects",
      icon: <FolderKanban className="h-3.5 w-3.5" />,
    },
    {
      href: "/admin/images",
      label: "Images",
      icon: <ImageIcon className="h-3.5 w-3.5" />,
    },
  ];

  const pingBackend = async () => {
    const result = await ping();
    push(
      result.ok ? "Backend reachable." : result.error,
      result.ok ? "success" : "error",
    );
    await Promise.all([refresh(), refreshEnquiries()]);
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Projects"
          value={content.projects.items.length}
          hint={`${visibleProjects} visible on the site`}
          icon={<FolderKanban className="h-5 w-5" aria-hidden="true" />}
        />
        <Stat
          label="Images"
          value={library.length}
          hint="Committed files and uploads"
          icon={<ImageIcon className="h-5 w-5" aria-hidden="true" />}
        />
        <Stat
          label="Enquiries"
          value={status === "loading" ? "—" : rows.length}
          hint={error ? "Could not load" : "From the contact form"}
          icon={<Mail className="h-5 w-5" aria-hidden="true" />}
        />
        <Stat
          label="Unread"
          value={unread}
          hint={unread ? "Waiting for a reply" : "All caught up"}
          accent={unread > 0}
          icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Recent enquiries"
          description="Straight from the contact form on the public site."
          actions={
            <Link href="/admin/enquiries">
              <Button type="button" size="sm" variant="ghost">
                Open inbox
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </Link>
          }
        >
          {status === "loading" ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : recent.length ? (
            <ul className="flex flex-col gap-2">
              {recent.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      row.read ? "bg-white/20" : "bg-[#B600A8]"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#D7E2EA]">
                      {row.name}
                      <span className="text-[#D7E2EA]/40"> · {row.email}</span>
                    </p>
                    <p className="truncate text-xs text-[#D7E2EA]/45">{row.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.type ? <Badge tone="neutral">{row.type}</Badge> : null}
                    <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#D7E2EA]/35">
                      {formatRelative(row.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Mail className="h-6 w-6" aria-hidden="true" />}
              title="No enquiries yet"
              description="Messages sent through the contact form will land here."
            />
          )}
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel title="Quick edits" description="Jump straight to a section.">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button type="button" size="sm" variant="ghost">
                    {action.icon}
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Publishing" description="Where the site is reading its content from.">
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#D7E2EA]/50">Backend</dt>
                <dd>
                  <Badge tone={backendStatus.configured ? "good" : "warn"}>
                    {backendStatus.configured ? "Connected" : "Not connected"}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#D7E2EA]/50">Content source</dt>
                <dd className="text-xs uppercase tracking-[0.12em] text-[#D7E2EA]/70">
                  {source}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#D7E2EA]/50">Last published</dt>
                <dd className="text-xs text-[#D7E2EA]/70">{formatRelative(lastSavedAt)}</dd>
              </div>
            </dl>

            {!backendStatus.configured ? (
              <div className="mt-4">
                <Alert tone="warn">
                  Add <code className="text-[#D7E2EA]">VITE_SUPABASE_URL</code> and{" "}
                  <code className="text-[#D7E2EA]">VITE_SUPABASE_ANON_KEY</code> to{" "}
                  <code className="text-[#D7E2EA]">.env.local</code> to enable sign-in, publishing
                  and enquiries. The site still works without it.
                </Alert>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => void pingBackend()}
                disabled={!remoteChecked && !backendStatus.configured}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Sync now
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Panel
        title="Live preview"
        description="The real site, rendering your unsaved draft."
        actions={
          <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#D7E2EA]/35">
            {content.updatedAt ? `Draft · ${formatDateTime(content.updatedAt)}` : "Draft"}
          </span>
        }
      >
        <PreviewFrame height="62vh" />
      </Panel>
    </div>
  );
}
