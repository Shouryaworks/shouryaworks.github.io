import { useRef, useState } from "react";
import { UploadCloud, FileImage } from "lucide-react";
import { ACCEPT_ATTRIBUTE } from "../../lib/imageTools";
import { backendStatus } from "../../lib/backend";
import { useImageUpload } from "../useImageUpload";
import { Alert, Button } from "../ui";

/**
 * Drag-and-drop / file-picker upload surface. Validation and messaging live in
 * `useImageUpload` so every entry point behaves identically.
 */
export default function UploadZone({
  onUploaded,
  label = "Upload images",
  hint = "JPG, PNG, WebP, AVIF or GIF up to 20 MB. Files are resized and converted to WebP before upload.",
  compact,
}: {
  onUploaded?: (ids: string[]) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
}) {
  const { upload, tasks, busy } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const created = await upload(Array.from(fileList));
    if (created.length && onUploaded) onUploaded(created.map((asset) => asset.id));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed px-5 text-center transition-colors duration-300 ${
          compact ? "py-6" : "py-10"
        } ${
          dragging
            ? "border-[#B600A8]/70 bg-[#B600A8]/10"
            : "border-white/15 bg-white/[0.02] hover:border-white/25"
        }`}
      >
        <UploadCloud className="h-6 w-6 text-[#D7E2EA]/45" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D7E2EA]">
            {label}
          </p>
          <p className="max-w-md text-xs leading-relaxed text-[#D7E2EA]/45">{hint}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
          <FileImage className="h-3.5 w-3.5" aria-hidden="true" />
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          onChange={(event) => void handleFiles(event.target.files)}
          aria-label={label}
        />
      </div>

      {tasks.length ? (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-xs text-[#D7E2EA]/70">
                <span className="truncate">{task.name}</span>
                <span className="shrink-0 uppercase tracking-[0.12em]">{task.stage}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#B600A8] to-[#BE4C00] transition-[width] duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {!backendStatus.configured ? (
        <Alert tone="warn">
          Image storage is not connected yet. Add the Supabase keys to{" "}
          <code className="text-[#D7E2EA]">.env.local</code> to upload new files — until then you
          can still pick any of the existing images.
        </Alert>
      ) : null}
    </div>
  );
}
