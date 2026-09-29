import { useCallback, useRef, useState } from "react";
import { useSiteContent } from "../content/SiteContentProvider";
import { useToast } from "./ui";
import type { ImageAsset } from "../content/types";
import { optimizeImage, validateImageFile } from "../lib/imageTools";
import { slugify } from "../lib/format";
import { storageHelpers, uploadStoredImage } from "../lib/backend";

export type UploadTask = { id: string; name: string; stage: string; progress: number };

/**
 * The one place images are added to the library.
 *
 * Every file is validated, re-encoded to WebP at 1x and 2x in the browser,
 * checked against a content hash so the same picture is never stored twice, and
 * only then uploaded to storage and registered in the content document.
 */
export function useImageUpload() {
  const { update, library, backendConfigured } = useSiteContent();
  const { push } = useToast();
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const counter = useRef(0);

  const setTask = (id: string, patch: Partial<UploadTask>) =>
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)));

  const hashFile = async (file: File): Promise<string | null> => {
    try {
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch {
      // `crypto.subtle` needs a secure context; duplicate detection is skipped there.
      return null;
    }
  };

  const upload = useCallback(
    async (files: File[]): Promise<ImageAsset[]> => {
      if (!files.length) return [];
      if (!backendConfigured) {
        push(
          "Uploads need the connected image storage. Add the Supabase keys to .env.local, then reload.",
          "error",
        );
        return [];
      }

      const created: ImageAsset[] = [];
      const failures: string[] = [];

      for (const file of files) {
        counter.current += 1;
        const id = `task-${counter.current}`;
        setTasks((current) => [
          ...current,
          { id, name: file.name, stage: "Checking", progress: 5 },
        ]);

        const check = validateImageFile(file);
        if (!check.ok) {
          failures.push(check.error);
          setTasks((current) => current.filter((task) => task.id !== id));
          continue;
        }

        const hash = await hashFile(file);
        const duplicate = hash ? library.find((asset) => asset.hash === hash) : undefined;
        if (duplicate) {
          push(`“${file.name}” is already in the library — reused instead of uploading it again.`, "info");
          setTasks((current) => current.filter((task) => task.id !== id));
          created.push(duplicate);
          continue;
        }

        let optimized;
        try {
          setTask(id, { stage: "Optimising", progress: 25 });
          optimized = await optimizeImage(file);
        } catch (error) {
          failures.push(
            `“${file.name}” could not be processed: ${
              error instanceof Error ? error.message : "unknown error"
            }`,
          );
          setTasks((current) => current.filter((task) => task.id !== id));
          continue;
        }

        const stamp = Date.now().toString(36);
        const base = `${slugify(file.name.replace(/\.[a-z0-9]+$/i, ""))}-${stamp}`;
        const primaryPath = `${storageHelpers.prefix}${base}.webp`;
        const retinaPath = optimized.two ? `${storageHelpers.prefix}${base}@2x.webp` : "";

        try {
          setTask(id, { stage: "Uploading", progress: 60 });
          const primary = await uploadStoredImage(primaryPath, optimized.one);
          if (!primary.ok) throw new Error(primary.error);

          if (retinaPath && optimized.two) {
            setTask(id, { stage: "Uploading 2x", progress: 82 });
            const retina = await uploadStoredImage(retinaPath, optimized.two);
            if (!retina.ok) {
              // The 1x file is already stored; continue with it rather than failing.
              push(`The 2x variant of “${file.name}” failed to upload.`, "error");
            }
          }
        } catch (error) {
          failures.push(
            `“${file.name}” failed to upload: ${
              error instanceof Error ? error.message : "unknown error"
            }`,
          );
          setTasks((current) => current.filter((task) => task.id !== id));
          continue;
        }

        const asset: ImageAsset = {
          id: `upload:${primaryPath}`,
          src: storageHelpers.publicUrl(primaryPath),
          src2x: retinaPath ? storageHelpers.publicUrl(retinaPath) : undefined,
          width: optimized.width,
          height: optimized.height,
          width2x: optimized.width2x,
          alt: file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
          bytes: optimized.bytes,
          format: optimized.format,
          origin: "upload",
          group: "uploads",
          path: primaryPath,
          hash: hash ?? undefined,
          addedAt: new Date().toISOString(),
        };
        created.push(asset);
        setTask(id, { stage: "Done", progress: 100 });
      }

      if (created.length) {
        update((draft) => {
          draft.assets = [...draft.assets, ...created];
        });
        push(
          `${created.length} image${created.length === 1 ? "" : "s"} added to the library.`,
          "success",
        );
      }

      failures.forEach((message) => push(message, "error"));
      window.setTimeout(() => setTasks([]), 900);
      return created;
    },
    // The published copy is never touched here: uploads land in the draft and
    // only reach the live site when the draft is saved.
    [backendConfigured, library, push, update],
  );

  return { upload, tasks, busy: tasks.length > 0 };
}
