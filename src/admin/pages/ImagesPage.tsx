import { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Link2Off, RefreshCw, Search, Trash2 } from "lucide-react";
import { useSiteContent } from "../../content/SiteContentProvider";
import { clearImageReference, describeUsage } from "../../content/resolve";
import { backendStatus, deleteStoredImage, listStoredImages } from "../../lib/backend";
import { formatBytes, formatDimensions } from "../../lib/format";
import { probeImage } from "../../lib/imageTools";
import type { ImageAsset } from "../../content/types";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  IconButton,
  Panel,
  Skeleton,
  TextInput,
  useToast,
} from "../ui";
import UploadZone from "../components/UploadZone";
import SaveBar from "../components/SaveBar";

type Measured = { bytes?: number; width?: number; height?: number };

/**
 * The image library.
 *
 * Committed files (public/assets) and uploads (Supabase Storage) appear in one
 * grid with a preview, the file name, where each image is used, its dimensions
 * and its size — plus upload, replace, download and remove.
 */
export default function ImagesPage() {
  const { library, draft, update, dirty } = useSiteContent();
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [usedOnly, setUsedOnly] = useState(false);
  const [measured, setMeasured] = useState<Record<string, Measured>>({});
  const [probing, setProbing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ImageAsset | null>(null);
  const [deleting, setDeleting] = useState(false);
  const probed = useRef(false);

  const groups = useMemo(() => {
    const set = new Set(library.map((asset) => asset.group));
    return ["all", ...[...set].sort()];
  }, [library]);

  const usage = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const asset of library) map.set(asset.id, describeUsage(draft, asset.id));
    return map;
  }, [library, draft]);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return library.filter((asset) => {
      if (group !== "all" && asset.group !== group) return false;
      if (usedOnly && !(usage.get(asset.id)?.length ?? 0)) return false;
      if (!needle) return true;
      return (
        asset.id.toLowerCase().includes(needle) ||
        asset.alt.toLowerCase().includes(needle) ||
        (usage.get(asset.id) ?? []).join(" ").toLowerCase().includes(needle)
      );
    });
  }, [library, query, group, usedOnly, usage]);

  /**
   * Committed files carry their real intrinsic size in the catalog, but their
   * byte weight is only known at runtime — so measure once, cheaply, in the
   * background rather than shipping a hand-maintained table.
   */
  useEffect(() => {
    if (probed.current || !library.length) return;
    probed.current = true;
    setProbing(true);
    const missing = library.filter((asset) => !asset.bytes);
    (async () => {
      for (const asset of missing.slice(0, 24)) {
        const result = await probeImage(asset.src);
        if (!result) continue;
        setMeasured((current) => ({
          ...current,
          [asset.id]: { bytes: result.bytes, width: result.width, height: result.height },
        }));
      }
      setProbing(false);
    })();
  }, [library]);

  const removeAsset = async (asset: ImageAsset) => {
    setDeleting(true);
    const inUse = usage.get(asset.id) ?? [];
    if (asset.origin === "upload" && asset.path) {
      const result = await deleteStoredImage(asset.path);
      if (!result.ok) {
        push(result.error, "error");
        setDeleting(false);
        setPendingDelete(null);
        return;
      }
    }
    update((content) => {
      Object.assign(content, clearImageReference(content, asset.id));
    });
    push(
      inUse.length
        ? `“${asset.src.split("/").pop()}” was removed and ${inUse.length} reference(s) cleared.`
        : `“${asset.src.split("/").pop()}” was removed from the library.`,
      "success",
    );
    setDeleting(false);
    setPendingDelete(null);
  };

  const measuredBytes = library.reduce(
    (sum, asset) => sum + (measured[asset.id]?.bytes ?? asset.bytes ?? 0),
    0,
  );
  const measuredCount = library.filter((asset) => measured[asset.id] || asset.bytes).length;

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title="Image library"
        description={`${library.length} images · ${formatBytes(measuredBytes)} measured across ${measuredCount} file${measuredCount === 1 ? "" : "s"} · uploads are converted to WebP at 1x and 2x before they are stored.`}
      >
        <UploadZone
          onUploaded={(ids) => {
            if (ids.length) push(`Added ${ids.length} image(s). Save to publish them to the site.`, "success");
          }}
        />
      </Panel>

      <Panel title="All images" description="Search by file name, description or where it is used.">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D7E2EA]/35"
              aria-hidden="true"
            />
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search images"
              className="pl-11"
              aria-label="Search images"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {groups.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setGroup(entry)}
                aria-pressed={group === entry}
                className={`rounded-full border px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA] ${
                  group === entry
                    ? "border-white/30 bg-white/15 text-white"
                    : "border-white/12 bg-white/5 text-[#D7E2EA]/60 hover:bg-white/10"
                }`}
              >
                {entry}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setUsedOnly((value) => !value)}
              aria-pressed={usedOnly}
              className={`rounded-full border px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA] ${
                usedOnly
                  ? "border-[#B600A8]/60 bg-[#B600A8]/15 text-white"
                  : "border-white/12 bg-white/5 text-[#D7E2EA]/60 hover:bg-white/10"
              }`}
            >
              In use only
            </button>
          </div>
        </div>

        {probing ? (
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#D7E2EA]/35">
            Measuring files…
          </p>
        ) : null}

        {results.length ? (
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {results.map((asset) => {
              const info = measured[asset.id];
              const inUse = usage.get(asset.id) ?? [];
              return (
                <li
                  key={asset.id}
                  className="flex flex-col overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                    <img
                      src={asset.src}
                      alt={asset.alt || "Image preview"}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2">
                      <Badge tone={asset.origin === "upload" ? "accent" : "neutral"}>
                        {asset.origin === "upload" ? "Upload" : asset.group}
                      </Badge>
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="truncate text-xs text-[#D7E2EA]/85" title={asset.src}>
                      {asset.src.split("/").pop()}
                    </p>
                    <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[#D7E2EA]/40">
                      {formatDimensions(info?.width ?? asset.width, info?.height ?? asset.height)}
                      {" · "}
                      {formatBytes(info?.bytes ?? asset.bytes)}
                      {asset.src2x ? " · 2x" : ""}
                    </p>

                    <p className="min-h-[2.5rem] text-[0.7rem] leading-relaxed text-[#D7E2EA]/45">
                      {inUse.length ? (
                        <>Used by: {inUse.join(", ")}</>
                      ) : (
                        <>
                          <Link2Off className="mr-1 inline h-3 w-3" aria-hidden="true" />
                          Not used anywhere on the site
                        </>
                      )}
                    </p>

                    <TextInput
                      value={asset.alt}
                      placeholder="Describe this image"
                      aria-label={`Alt text for ${asset.src.split("/").pop()}`}
                      maxLength={180}
                      onChange={(event) => {
                        const alt = event.target.value;
                        update((content) => {
                          const existing = content.assets.find((entry) => entry.id === asset.id);
                          if (existing) {
                            existing.alt = alt;
                            return;
                          }
                          // Committed files are catalogued in code, so an alt-text
                          // change is stored as an override in the content document.
                          content.assets = [...content.assets, { ...asset, alt }];
                        });
                      }}
                    />

                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="subtle"
                        onClick={() => window.open(asset.src, "_blank", "noopener")}
                      >
                        View
                      </Button>
                      <IconButton
                        label="Remove image"
                        onClick={() => setPendingDelete(asset)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon={<ImageIcon className="h-6 w-6" aria-hidden="true" />}
              title="No images match"
              description="Try another search, or upload a new image above."
            />
          </div>
        )}

        {!backendStatus.configured ? (
          <div className="mt-5">
            <Alert tone="warn">
              Uploads need the Supabase image bucket. Everything else here — selecting, alt text and
              removing references — works without it. See the README for the one-time setup.
            </Alert>
          </div>
        ) : null}
      </Panel>

      <Panel
        title="Storage"
        description="Files stored in the Supabase bucket that are not registered in the content document."
        actions={
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={async () => {
              const result = await listStoredImages();
              if (!result.ok) {
                push(result.error, "error");
                return;
              }
              const known = new Set(library.filter((a) => a.path).map((a) => a.path));
              const orphans = result.data.filter((file) => !known.has(file.path));
              push(
                orphans.length
                  ? `${orphans.length} file(s) in storage are not referenced by the site.`
                  : "Storage matches the library.",
                orphans.length ? "info" : "success",
              );
              if (orphans.length) {
                orphans.forEach((orphan) =>
                  push(`${orphan.path} · ${formatBytes(orphan.bytes)}`, "info"),
                );
              }
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Check storage
          </Button>
        }
      >
        <p className="text-sm leading-relaxed text-[#D7E2EA]/55">
          Removing an uploaded image deletes the file from storage. Removing a committed file only
          detaches it from the site — the file stays in{" "}
          <code className="text-[#D7E2EA]">public/assets</code> until you delete it from the
          repository.
        </p>
      </Panel>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove this image?"
        busy={deleting}
        confirmLabel="Remove"
        message={
          pendingDelete ? (
            <>
              <span className="block">
                “{pendingDelete.src.split("/").pop()}” will be{" "}
                {pendingDelete.origin === "upload"
                  ? "deleted from storage and "
                  : ""}
                detached from the site.
              </span>
              {(usage.get(pendingDelete.id) ?? []).length ? (
                <span className="mt-2 block text-[#F0C4A8]">
                  It is currently used by: {(usage.get(pendingDelete.id) ?? []).join(", ")}.
                  Those references will be cleared.
                </span>
              ) : null}
            </>
          ) : null
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void removeAsset(pendingDelete)}
      />

      <SaveBar scope="Image library" />

      {dirty ? <Skeleton className="h-1 w-full" /> : null}
    </div>
  );
}
