import { useRef, useState } from "react";
import { Download, LogOut, RefreshCw, Upload } from "lucide-react";
import { useSiteContent } from "../../content/SiteContentProvider";
import { useAuth } from "../../lib/auth";
import { backendStatus } from "../../lib/backend";
import { defaultContent } from "../../content/defaults";
import { formatDateTime, formatRelative } from "../../lib/format";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  Panel,
  useToast,
} from "../ui";
import ImageField from "../components/ImageField";

/**
 * Settings: account, publishing status and data management (export / import /
 * reset). Exporting produces the exact JSON the site can be pointed at when no
 * backend is connected.
 */
export default function SettingsPage() {
  const { draft, replaceDraft, save, dirty, refresh, source, lastSavedAt, status } =
    useSiteContent();
  const { session, signOut, configured } = useAuth();
  const { push } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "site.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    push(
      "Downloaded site.json — drop it in public/content/ and rebuild to publish without a backend.",
      "success",
    );
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      replaceDraft(parsed);
      push("Content imported. Review it, then press Save.", "success");
    } catch {
      push("That file is not valid site content JSON.", "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Panel title="Account" description="Who is signed in to the admin panel.">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm text-[#D7E2EA]">{session?.email ?? "Unknown"}</p>
            <p className="mt-1 text-xs text-[#D7E2EA]/45">
              Authentication is handled by Supabase. No password is stored in this app.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={configured ? "good" : "warn"}>
              {configured ? "Auth connected" : "Auth not configured"}
            </Badge>
            <Button type="button" size="sm" onClick={() => void signOut()}>
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Publishing" description="Where visitors' copy comes from.">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D7E2EA]/40">
              Backend
            </dt>
            <dd className="mt-1 text-sm text-[#D7E2EA]/80">
              {backendStatus.configured ? backendStatus.url : "Not configured"}
            </dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D7E2EA]/40">
              Content source
            </dt>
            <dd className="mt-1 text-sm text-[#D7E2EA]/80">
              {source === "remote"
                ? "Published document from the backend"
                : source === "snapshot"
                  ? "public/content/site.json"
                  : source === "cache"
                    ? "This browser only"
                    : "Shipped defaults in code"}
            </dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D7E2EA]/40">
              Last published
            </dt>
            <dd className="mt-1 text-sm text-[#D7E2EA]/80">
              {formatDateTime(lastSavedAt)} · {formatRelative(lastSavedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D7E2EA]/40">
              Draft
            </dt>
            <dd className="mt-1 text-sm text-[#D7E2EA]/80">
              {dirty ? "Unsaved changes" : "Matches the published copy"}
              {status === "loading" ? " · loading…" : ""}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => void refresh()}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh from backend
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={() =>
              void save().then((result) =>
                push(
                  result.errors.length ? result.errors.join(" ") : result.message,
                  result.ok ? "success" : "error",
                ),
              )
            }
          >
            Save now
          </Button>
        </div>
      </Panel>

      <Panel title="Share image" description="Used when the site link is shared.">
        <ImageField
          label="Social share image"
          hint="Defaults to the hero portrait when empty."
          imageId={draft.settings.ogImage}
          onChange={(id) =>
            replaceDraft({ ...draft, settings: { ...draft.settings, ogImage: id } })
          }
        />
      </Panel>

      <Panel title="Content data" description="Move the website content in and out.">
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={exportJson}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export site.json
          </Button>
          <Button type="button" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Import site.json
          </Button>
          <Button type="button" size="sm" variant="danger" onClick={() => setConfirmReset(true)}>
            Reset to shipped defaults
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => void importJson(event.target.files?.[0])}
            aria-label="Import site.json"
          />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#D7E2EA]/55">
          The exported file contains every editable string, list, project and image reference —
          but no credentials. Copy it to{" "}
          <code className="text-[#D7E2EA]">public/content/site.json</code> and rebuild to publish
          through GitHub Pages without a backend.
        </p>

        {!backendStatus.configured ? (
          <div className="mt-4">
            <Alert tone="info">
              Right now edits only live in this browser. Export the JSON (or connect Supabase) to
              publish them for real visitors.
            </Alert>
          </div>
        ) : null}
      </Panel>

      <Panel title="Danger zone" description="Irreversible actions.">
        <p className="text-sm leading-relaxed text-[#D7E2EA]/55">
          Resetting replaces the editable copy with the content the portfolio shipped with: the same
          hero, about copy, services, the two existing projects and all 21 preview tiles. Nothing
          else is touched, and you can undo it by importing a saved export.
        </p>
        <div className="mt-4">
          <Button type="button" size="sm" variant="danger" onClick={() => setConfirmReset(true)}>
            Reset content to defaults
          </Button>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all content?"
        confirmLabel="Reset"
        message="Every edit in the draft is replaced with the shipped defaults. Your published copy is only replaced when you save."
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          replaceDraft(structuredClone(defaultContent));
          setConfirmReset(false);
          push("Content reset to the shipped defaults.", "info");
        }}
      />

      <p className="pb-6 text-center text-[0.68rem] uppercase tracking-[0.16em] text-[#D7E2EA]/25">
        Shourya Studio · content v{draft.version}
      </p>
    </div>
  );
}
