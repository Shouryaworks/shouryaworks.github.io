import { useMemo, useState } from "react";
import { Image as ImageIcon, Search } from "lucide-react";
import { useSiteContent } from "../../content/SiteContentProvider";
import { formatBytes, formatDimensions } from "../../lib/format";
import { Badge, Button, EmptyState, Modal, TextInput } from "../ui";
import UploadZone from "./UploadZone";

/**
 * The "select from library / upload" dialog used by every image slot:
 * Projects → Porsche 911 → Main image → Change image, and the same flow for
 * the hero, the About profile picture and the share image.
 */
export default function ImagePicker({
  open,
  onClose,
  onSelect,
  current,
  title = "Choose an image",
  description,
  allowClear,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  current?: string;
  title?: string;
  description?: string;
  allowClear?: boolean;
}) {
  const { library } = useSiteContent();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");

  const groups = useMemo(() => {
    const set = new Set(library.map((asset) => asset.group));
    return ["all", ...[...set].sort()];
  }, [library]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return library.filter((asset) => {
      if (group !== "all" && asset.group !== group) return false;
      if (!needle) return true;
      return (
        asset.id.toLowerCase().includes(needle) ||
        asset.alt.toLowerCase().includes(needle) ||
        asset.src.toLowerCase().includes(needle)
      );
    });
  }, [library, query, group]);

  const choose = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} wide>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D7E2EA]/35"
              aria-hidden="true"
            />
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or description"
              className="pl-11"
              aria-label="Search the image library"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
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
          </div>
        </div>

        {results.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((asset) => (
              <li key={asset.id}>
                <button
                  type="button"
                  onClick={() => choose(asset.id)}
                  aria-pressed={current === asset.id}
                  className={`group flex w-full flex-col gap-2 rounded-2xl border p-2 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA] ${
                    current === asset.id
                      ? "border-[#B600A8]/70 bg-[#B600A8]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/30">
                    <img
                      src={asset.src}
                      alt={asset.alt || "Image preview"}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="flex flex-col gap-1 px-1 pb-1">
                    <span className="truncate text-xs text-[#D7E2EA]/80">
                      {asset.alt || asset.id.split("/").pop()}
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[#D7E2EA]/40">
                      {formatDimensions(asset.width, asset.height)} · {formatBytes(asset.bytes)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<ImageIcon className="h-6 w-6" aria-hidden="true" />}
            title="No images match"
            description="Try a different search, or upload a new image below."
          />
        )}

        <details className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-[#D7E2EA]/70">
            Upload a new image
          </summary>
          <div className="mt-4">
            <UploadZone compact onUploaded={(ids) => ids.length && choose(ids[0])} />
          </div>
        </details>

        <div className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-4">
          {allowClear && current ? (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                onSelect("");
                onClose();
              }}
            >
              Remove image
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{results.length} shown</Badge>
            <Button type="button" variant="subtle" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
