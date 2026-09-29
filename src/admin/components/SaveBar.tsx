import { AnimatePresence, motion } from "framer-motion";
import { Eye, RotateCcw, Save } from "lucide-react";
import { useSiteContent } from "../../content/SiteContentProvider";
import { formatRelative } from "../../lib/format";
import { Button } from "../ui";

/**
 * Sticky Edit / Preview / Save bar. It only appears when there is something to
 * save, and it explains exactly what "Save" will do before you press it.
 */
export default function SaveBar({ scope }: { scope: string }) {
  const { dirty, saving, save, revert, openPreview, lastSavedAt, backendConfigured, source } =
    useSiteContent();

  return (
    <AnimatePresence>
      {dirty ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:pb-5"
        >
          <div className="glass-sidebar pointer-events-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/12 px-4 py-3">
            <p className="min-w-0 text-xs leading-relaxed text-[#D7E2EA]/65">
              <span className="font-semibold uppercase tracking-[0.14em] text-[#D7E2EA]">
                Unsaved changes
              </span>
              <span className="hidden sm:inline"> · {scope}</span>
              <span className="mt-0.5 block text-[0.68rem] text-[#D7E2EA]/45">
                {backendConfigured
                  ? "Save publishes to the live site."
                  : "No backend connected — save keeps changes in this browser, then export the JSON to publish."}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="subtle" onClick={revert}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Revert
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={openPreview}>
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Preview
              </Button>
              <Button type="button" size="sm" variant="primary" loading={saving} onClick={() => void save()}>
                {!saving ? <Save className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {saving ? "Saving" : "Save"}
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-3 sm:pb-5"
        >
          <div className="glass-sidebar pointer-events-auto flex flex-wrap items-center gap-3 rounded-full border border-white/10 px-4 py-2">
            <Button type="button" size="sm" variant="subtle" onClick={openPreview}>
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              Preview site
            </Button>
            <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#D7E2EA]/40">
              {source === "remote" ? "Live" : source === "snapshot" ? "Snapshot" : "Defaults"} ·
              saved {formatRelative(lastSavedAt)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
