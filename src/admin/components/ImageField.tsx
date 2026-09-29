import { useState } from "react";
import { ImageOff, Pencil, RefreshCw } from "lucide-react";
import { useSiteContent } from "../../content/SiteContentProvider";
import { describeUsage } from "../../content/resolve";
import { formatBytes, formatDimensions } from "../../lib/format";
import { Button, Field, TextInput } from "../ui";
import ImagePicker from "./ImagePicker";

/**
 * A single editable image slot: preview, change-from-library / upload, alt text
 * and a quick "replace with the same file" path for uploads.
 */
export default function ImageField({
  label,
  imageId,
  onChange,
  onAltChange,
  alt,
  hint,
  slotLabel,
  className = "",
}: {
  label: string;
  imageId: string;
  onChange: (id: string) => void;
  alt?: string;
  onAltChange?: (alt: string) => void;
  hint?: string;
  slotLabel?: string;
  className?: string;
}) {
  const { library, content } = useSiteContent();
  const [open, setOpen] = useState(false);
  const asset = library.find((entry) => entry.id === imageId);
  const usage = asset ? describeUsage(content, asset.id) : [];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Field label={slotLabel ? `${slotLabel} — ${label}` : label} hint={hint}>
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
              {asset ? (
                <img
                  src={asset.src}
                  alt={asset.alt || `${label} preview`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[#D7E2EA]/25">
                  <ImageOff className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
            </div>

            <div className="flex min-w-[160px] flex-1 flex-col gap-2">
              <p className="text-xs leading-relaxed text-[#D7E2EA]/60">
                {asset ? (
                  <>
                    <span className="block truncate text-[#D7E2EA]/85">
                      {asset.src.split("/").pop()}
                    </span>
                    {formatDimensions(asset.width, asset.height)}
                    {asset.bytes ? ` · ${formatBytes(asset.bytes)}` : ""}
                    <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.12em] text-[#D7E2EA]/35">
                      {asset.origin === "upload" ? "Uploaded" : "Committed file"}
                    </span>
                  </>
                ) : (
                  <span className="text-[#D7E2EA]/45">
                    No image selected. The site falls back to the hero portrait until you pick one.
                  </span>
                )}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => setOpen(true)}>
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  {asset ? "Change image" : "Choose image"}
                </Button>
                {asset && asset.origin === "upload" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="subtle"
                    onClick={() => {
                      if (asset.path) window.open(asset.src, "_blank", "noopener");
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Open original
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {usage.length ? (
            <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[#D7E2EA]/35">
              Used by: {usage.join(", ")}
            </p>
          ) : null}

          {onAltChange ? (
            <TextInput
              value={alt ?? asset?.alt ?? ""}
              onChange={(event) => onAltChange(event.target.value)}
              placeholder="Describe this image for screen readers"
              aria-label={`Alt text for ${label}`}
              maxLength={180}
            />
          ) : null}
        </div>
      </Field>

      <ImagePicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onChange}
        current={imageId}
        title={`Change ${label.toLowerCase()}`}
        description="Pick an existing image or upload a new one — no code needed."
        allowClear
      />
    </div>
  );
}
