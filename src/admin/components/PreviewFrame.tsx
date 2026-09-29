import { useState } from "react";
import { ExternalLink, Monitor, RefreshCw, Smartphone } from "lucide-react";
import { useSiteContent } from "../../content/SiteContentProvider";
import { Button, IconButton } from "../ui";
import { siteUrl } from "../../lib/url";

/**
 * Live preview of the real site.
 *
 * It is an iframe of the portfolio itself opened with `?preview=draft`, which
 * makes the site render the unpublished draft — so what you see is exactly what
 * visitors will get, with no second copy of the layout to keep in sync.
 */
export default function PreviewFrame({
  path = "/",
  height = "70vh",
}: {
  path?: string;
  height?: string;
}) {
  const { openPreview } = useSiteContent();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [nonce, setNonce] = useState(0);
  const [loading, setLoading] = useState(true);

  const src = siteUrl(path, { preview: "draft", t: String(nonce) });

  return (
    <div className="glass-card overflow-hidden rounded-[28px] border border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#B600A8]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#7621B0]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#BE4C00]/70" />
          </span>
          <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D7E2EA]/45">
            Preview · {path}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            label={device === "desktop" ? "Switch to mobile preview" : "Switch to desktop preview"}
            onClick={() => setDevice(device === "desktop" ? "mobile" : "desktop")}
          >
            {device === "desktop" ? (
              <Smartphone className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Monitor className="h-4 w-4" aria-hidden="true" />
            )}
          </IconButton>
          <IconButton label="Reload preview" onClick={() => setNonce((value) => value + 1)}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </IconButton>
          <Button type="button" size="sm" variant="ghost" onClick={openPreview}>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Open in a tab
          </Button>
        </div>
      </div>

      <div className="flex justify-center overflow-hidden bg-black/40 p-0 sm:p-4">
        <div
          className={`relative h-full w-full overflow-hidden transition-[max-width] duration-500 ease-out ${
            device === "mobile" ? "max-w-[390px] rounded-[28px] border-x border-white/10" : "max-w-none"
          }`}
          style={{ height }}
        >
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0C0C0C]/80">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D7E2EA]/50">
                Loading preview
              </span>
            </div>
          ) : null}
          <iframe
            key={nonce}
            src={src}
            title="Live preview of the portfolio"
            onLoad={() => setLoading(false)}
            className="h-full w-full border-0 bg-[#0C0C0C]"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
