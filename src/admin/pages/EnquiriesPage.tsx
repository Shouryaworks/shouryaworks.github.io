import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Inbox,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEnquiries } from "../EnquiriesProvider";
import { backendStatus } from "../../lib/backend";
import { formatDateTime, formatRelative } from "../../lib/format";
import type { Enquiry } from "../../content/types";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  IconButton,
  Panel,
  Select,
  Skeleton,
  TextInput,
  useToast,
} from "../ui";

type Filter = "all" | "unread" | "read" | "archived";
type Sort = "newest" | "oldest";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
  { id: "archived", label: "Archived" },
];

/**
 * The enquiry inbox. Every message the public contact form has sent, with the
 * usual read/archive/search/filter/sort controls.
 */
export default function EnquiriesPage() {
  const { rows, unread, status, error, refresh, markRead, markArchived, remove } = useEnquiries();
  const { push } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Enquiry | null>(null);
  const [busy, setBusy] = useState(false);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (filter === "archived" ? !row.archived : row.archived) return false;
      if (filter === "unread" && (row.read || row.archived)) return false;
      if (filter === "read" && !row.read) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        row.email.toLowerCase().includes(needle) ||
        row.message.toLowerCase().includes(needle) ||
        (row.type ?? "").toLowerCase().includes(needle) ||
        (row.budget ?? "").toLowerCase().includes(needle)
      );
    });
    return filtered.sort((a, b) => {
      const delta = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sort === "newest" ? -delta : delta;
    });
  }, [rows, filter, sort, query]);

  const run = async (action: () => Promise<string | null>, success: string) => {
    setBusy(true);
    const failure = await action();
    setBusy(false);
    push(failure ?? success, failure ? "error" : "success");
  };

  return (
    <div className="flex flex-col gap-5">
      {error ? <Alert tone="error">{error}</Alert> : null}

      {!backendStatus.configured ? (
        <Alert tone="warn">
          No backend is connected, so the inbox is empty. Messages still arrive by email until you
          add the Supabase keys — see the README.
        </Alert>
      ) : null}

      <Panel
        title="Enquiries"
        description={
          unread
            ? `${unread} unread message${unread === 1 ? "" : "s"} from the contact form.`
            : "Messages sent through the portfolio contact form."
        }
        actions={
          <>
            <Badge tone={unread ? "accent" : "neutral"}>{unread} new</Badge>
            <Button type="button" size="sm" variant="ghost" onClick={() => void refresh()}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Refresh
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D7E2EA]/35"
              aria-hidden="true"
            />
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or message"
              className="pl-11"
              aria-label="Search enquiries"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setFilter(entry.id)}
                aria-pressed={filter === entry.id}
                className={`rounded-full border px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA] ${
                  filter === entry.id
                    ? "border-white/30 bg-white/15 text-white"
                    : "border-white/12 bg-white/5 text-[#D7E2EA]/60 hover:bg-white/10"
                }`}
              >
                {entry.label}
              </button>
            ))}

            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              aria-label="Sort enquiries"
              className="w-auto min-w-[140px]"
            >
              <option value="newest" className="bg-[#0C0C0C]">
                Newest first
              </option>
              <option value="oldest" className="bg-[#0C0C0C]">
                Oldest first
              </option>
            </Select>
          </div>
        </div>

        {status === "loading" ? (
          <div className="mt-5 flex flex-col gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : results.length ? (
          <ul className="mt-5 flex flex-col gap-3">
            {results.map((row) => {
              const isOpen = openId === row.id;
              return (
                <li
                  key={row.id}
                  className={`rounded-[22px] border transition-colors duration-300 ${
                    row.read ? "border-white/10 bg-white/[0.02]" : "border-[#B600A8]/25 bg-[#B600A8]/[0.06]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3 p-4">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        row.read ? "bg-white/20" : "bg-[#B600A8]"
                      }`}
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setOpenId(isOpen ? null : row.id);
                        if (!row.read) void run(() => markRead(row.id, true), "Marked as read.");
                      }}
                      className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA]"
                      aria-expanded={isOpen}
                    >
                      <span className="block truncate text-sm text-[#D7E2EA]">
                        {row.name}
                        <span className="text-[#D7E2EA]/40"> · {row.email}</span>
                      </span>
                      <span className="block truncate text-xs text-[#D7E2EA]/45">
                        {row.message}
                      </span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {row.type ? <Badge tone="neutral">{row.type}</Badge> : null}
                      {row.budget ? <Badge tone="neutral">{row.budget}</Badge> : null}
                      {row.archived ? <Badge tone="warn">Archived</Badge> : null}
                      <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#D7E2EA]/35">
                        {formatRelative(row.created_at)}
                      </span>

                      <IconButton
                        label={row.read ? "Mark as unread" : "Mark as read"}
                        onClick={() =>
                          void run(
                            () => markRead(row.id, !row.read),
                            row.read ? "Marked as unread." : "Marked as read.",
                          )
                        }
                      >
                        {row.read ? (
                          <Mail className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <MailOpen className="h-4 w-4" aria-hidden="true" />
                        )}
                      </IconButton>

                      <IconButton
                        label={row.archived ? "Restore from archive" : "Archive"}
                        onClick={() =>
                          void run(
                            () => markArchived(row.id, !row.archived),
                            row.archived ? "Restored." : "Archived.",
                          )
                        }
                      >
                        {row.archived ? (
                          <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Archive className="h-4 w-4" aria-hidden="true" />
                        )}
                      </IconButton>

                      <IconButton label="Delete enquiry" onClick={() => setPendingDelete(row)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </div>
                  </div>

                  {isOpen ? (
                    <div className="border-t border-white/10 px-4 pb-4 pt-3">
                      <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D7E2EA]/40">
                            Name
                          </dt>
                          <dd className="text-[#D7E2EA]">{row.name}</dd>
                        </div>
                        <div>
                          <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D7E2EA]/40">
                            Email
                          </dt>
                          <dd>
                            <a
                              href={`mailto:${row.email}?subject=${encodeURIComponent(
                                `Re: your enquiry — ${row.type || "project"}`,
                              )}`}
                              className="text-[#D7E2EA] underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA]"
                            >
                              {row.email}
                            </a>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D7E2EA]/40">
                            Interested in
                          </dt>
                          <dd className="text-[#D7E2EA]/80">{row.type || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D7E2EA]/40">
                            Budget
                          </dt>
                          <dd className="text-[#D7E2EA]/80">{row.budget || "—"}</dd>
                        </div>
                      </dl>

                      <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.03] p-4 leading-relaxed text-[#D7E2EA]/85">
                        {row.message}
                      </p>

                      <p className="mt-3 text-[0.68rem] uppercase tracking-[0.12em] text-[#D7E2EA]/35">
                        Received {formatDateTime(row.created_at)}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon={<Inbox className="h-6 w-6" aria-hidden="true" />}
              title={rows.length ? "Nothing matches those filters" : "No enquiries yet"}
              description={
                rows.length
                  ? "Try a different filter or search."
                  : "Messages sent from the contact page will appear here."
              }
            />
          </div>
        )}
      </Panel>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this enquiry?"
        busy={busy}
        confirmLabel="Delete"
        message={
          pendingDelete ? (
            <>
              The message from {pendingDelete.name} will be permanently removed. This cannot be
              undone.
            </>
          ) : null
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setBusy(true);
          const failure = await remove(pendingDelete.id);
          setBusy(false);
          setPendingDelete(null);
          push(failure ?? "Enquiry deleted.", failure ? "error" : "success");
        }}
      />
    </div>
  );
}
