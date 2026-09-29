import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { localImages, toAsset } from "../assets";
import { siteUrl } from "../lib/url";
import { defaultContent } from "./defaults";
import {
  isSameContent,
  resolveContent,
  resolveImage,
  unusedImageIds,
  type ImageLibrary,
} from "./resolve";
import type { ImageAsset, SiteContent } from "./types";
import {
  backendStatus,
  fetchPublishedContent,
  publishContent,
  type SessionInfo,
} from "../lib/backend";

const DRAFT_KEY = "shourya.content.draft.v1";
const PUBLISHED_KEY = "shourya.content.published.v1";
/** Optional static snapshot produced by the admin panel's Export button. */
const snapshotUrl = () => siteUrl("content/site.json");

export type ContentSource = "defaults" | "snapshot" | "cache" | "remote" | "draft";

export type SaveOutcome = {
  ok: boolean;
  /** `remote` = published to the backend, `local` = kept in this browser only */
  mode: "remote" | "local";
  message: string;
  errors: string[];
};

type ContextValue = {
  /** what the public site renders right now */
  content: SiteContent;
  /** the editable copy the admin panel is working on */
  draft: SiteContent;
  library: ImageLibrary;
  unused: Set<string>;
  status: "loading" | "ready";
  source: ContentSource;
  previewing: boolean;
  dirty: boolean;
  saving: boolean;
  lastSavedAt: string | null;
  lastError: string | null;
  backendConfigured: boolean;
  /** set once the remote snapshot has been consulted */
  remoteChecked: boolean;
  /** who is signed in, used to stamp published rows */
  session: SessionInfo | null;
  update: (mutate: (draft: SiteContent) => void) => void;
  replaceDraft: (next: SiteContent) => void;
  save: () => Promise<SaveOutcome>;
  revert: () => void;
  refresh: () => Promise<void>;
  imageFor: (id: string) => ReturnType<typeof resolveImage>;
  /** opens the real site with the unpublished draft applied */
  openPreview: () => void;
};

const SiteContentContext = createContext<ContextValue | null>(null);

const readCache = (key: string): SiteContent | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? resolveContent(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

const writeCache = (key: string, content: SiteContent) => {
  try {
    localStorage.setItem(key, JSON.stringify(content));
  } catch {
    /* Private-mode browsers simply lose the cache; the defaults still render. */
  }
};

const clearCache = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

/** `?preview=draft` renders the unpublished draft in a second tab. */
const wantsPreview = () =>
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("preview") === "draft";

/** Field-level checks that stop obviously broken content being published. */
export function validateContent(content: SiteContent): string[] {
  const errors: string[] = [];
  if (!content.hero.headline.trim()) errors.push("The hero headline cannot be empty.");
  if (!content.hero.ctaText.trim()) errors.push("The hero button needs a label.");
  if (!content.about.title.trim()) errors.push("The About heading cannot be empty.");
  if (!content.services.items.length) errors.push("Add at least one service, or hide them all.");
  if (content.services.items.some((item) => !item.title.trim()))
    errors.push("Every visible service needs a title.");
  if (content.projects.items.some((project) => !project.name.trim()))
    errors.push("Every project needs a name.");
  content.projects.items.forEach((project) => {
    if (project.images.filter((image) => image.slot !== "extra").length === 0) {
      errors.push(`“${project.name}” needs at least one card image.`);
    }
  });
  content.settings.navLinks.forEach((link) => {
    if (!link.href.trim()) errors.push(`The “${link.label}” navigation link needs a destination.`);
  });
  return errors;
}

export function SiteContentProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: SessionInfo | null;
}) {
  const previewing = useMemo(wantsPreview, []);
  const [published, setPublished] = useState<SiteContent>(() =>
    structuredClone(defaultContent),
  );
  const [draft, setDraft] = useState<SiteContent>(() => structuredClone(defaultContent));
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [source, setSource] = useState<ContentSource>("defaults");
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [remoteChecked, setRemoteChecked] = useState(!backendStatus.configured);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  /* ----------------------------------------------------------- bootstrap -- */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let base: SiteContent | null = readCache(PUBLISHED_KEY);
      let resolvedSource: ContentSource = base ? "cache" : "defaults";

      // A static snapshot committed to public/content wins over a stale cache,
      // which is what makes "Export JSON" a valid deploy path.
      try {
        const response = await fetch(snapshotUrl(), { cache: "no-store" });
        if (response.ok) {
          const json = (await response.json()) as unknown;
          const snapshot = resolveContent(json);
          base = snapshot;
          resolvedSource = "snapshot";
        }
      } catch {
        /* no snapshot shipped — normal */
      }

      if (backendStatus.configured) {
        const result = await fetchPublishedContent();
        if (!cancelled && result.ok && result.data) {
          base = result.data;
          resolvedSource = "remote";
        } else if (!cancelled && !result.ok) {
          setLastError(result.error);
        }
      }
      if (cancelled) return;

      const next = base ?? structuredClone(defaultContent);
      setPublished(next);
      setSource(resolvedSource);
      setDraft(readCache(DRAFT_KEY) ?? structuredClone(next));
      setLastSavedAt(readCache(PUBLISHED_KEY)?.updatedAt ?? null);
      setStatus("ready");
      setRemoteChecked(true);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------- keep tabs in sync on save -- */
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === DRAFT_KEY && event.newValue) {
        try {
          setDraft(resolveContent(JSON.parse(event.newValue)));
        } catch {
          /* ignore malformed payloads from another tab */
        }
      }
      if (event.key === PUBLISHED_KEY && event.newValue && !previewing) {
        try {
          const next = resolveContent(JSON.parse(event.newValue));
          setPublished(next);
          setSource("remote");
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [previewing]);

  /* ------------------------------------------------------- derived state -- */

  /**
   * The library is the committed catalog plus everything the admin registered.
   * An entry in `assets` that shares an id with a committed file is treated as
   * an override (alt text), so real dimensions never have to be duplicated into
   * the content document.
   */
  const buildLibrary = (overrides: ImageAsset[]): ImageLibrary => {
    const localIds = new Set(localImages.map((entry) => entry.id));
    const overridesById = new Map<string, ImageAsset>();
    const uploads: ImageAsset[] = [];
    const seen = new Set<string>();

    for (const asset of overrides) {
      if (localIds.has(asset.id)) {
        overridesById.set(asset.id, asset);
        continue;
      }
      if (seen.has(asset.id)) continue;
      seen.add(asset.id);
      uploads.push(asset);
    }

    const base = localImages.map((entry) => {
      const asset = toAsset(entry);
      const override = overridesById.get(asset.id);
      return override?.alt ? { ...asset, alt: override.alt } : asset;
    });

    return [...base, ...uploads];
  };

  const library = useMemo(
    () => buildLibrary([...published.assets, ...draft.assets]),
    [published.assets, draft.assets],
  );

  const publishedLibrary = useMemo(
    () => buildLibrary(published.assets),
    [published.assets],
  );

  const content = previewing ? draft : published;
  const activeLibrary = previewing ? library : publishedLibrary;
  const unused = useMemo(
    () => unusedImageIds(content, activeLibrary),
    [content, activeLibrary],
  );
  const dirty = useMemo(
    () => !isSameContent(draft, published),
    [draft, published],
  );

  const imageFor = useCallback(
    (id: string) => resolveImage(activeLibrary, id),
    [activeLibrary],
  );

  const update = useCallback((mutate: (value: SiteContent) => void) => {
    setDraft((current) => {
      const next = structuredClone(current);
      mutate(next);
      writeCache(DRAFT_KEY, next);
      return next;
    });
  }, []);

  const replaceDraft = useCallback((next: SiteContent) => {
    const value = resolveContent(next);
    writeCache(DRAFT_KEY, value);
    setDraft(value);
  }, []);

  const revert = useCallback(() => {
    clearCache(DRAFT_KEY);
    setDraft(structuredClone(published));
  }, [published]);

  const refresh = useCallback(async () => {
    if (!backendStatus.configured) return;
    setRemoteChecked(false);
    const result = await fetchPublishedContent();
    setRemoteChecked(true);
    if (result.ok && result.data) {
      setPublished(result.data);
      writeCache(PUBLISHED_KEY, result.data);
      setSource("remote");
      setLastSavedAt(result.data.updatedAt);
    } else if (!result.ok) {
      setLastError(result.error);
    }
  }, []);

  const save = useCallback(async (): Promise<SaveOutcome> => {
    const errors = validateContent(draftRef.current);
    if (errors.length) {
      return { ok: false, mode: "local", message: "Fix the highlighted fields first.", errors };
    }

    setSaving(true);
    setLastError(null);
    try {
      if (backendStatus.configured) {
        const result = await publishContent(draftRef.current, session?.email ?? "admin");
        if (!result.ok) {
          setLastError(result.error);
          return { ok: false, mode: "local", message: result.error, errors: [] };
        }
        const stamp = result.data;
        const next = { ...structuredClone(draftRef.current), updatedAt: stamp };
        setPublished(next);
        setDraft(structuredClone(next));
        writeCache(PUBLISHED_KEY, next);
        writeCache(DRAFT_KEY, next);
        setSource("remote");
        setLastSavedAt(stamp);
        return { ok: true, mode: "remote", message: "Published. The live site is updated.", errors: [] };
      }

      const stamp = new Date().toISOString();
      const next = { ...structuredClone(draftRef.current), updatedAt: stamp };
      writeCache(PUBLISHED_KEY, next);
      writeCache(DRAFT_KEY, next);
      setPublished(next);
      setSource("cache");
      setLastSavedAt(stamp);
      return {
        ok: true,
        mode: "local",
        message:
          "Saved in this browser. Connect Supabase (see README) or use Export JSON to publish site-wide.",
        errors: [],
      };
    } finally {
      setSaving(false);
    }
  }, [session]);

  const openPreview = useCallback(() => {
    window.open(siteUrl("/", { preview: "draft" }), "_blank", "noopener,noreferrer");
  }, []);

  const value = useMemo<ContextValue>(
    () => ({
      content,
      draft,
      library,
      unused,
      status,
      source,
      previewing,
      dirty,
      saving,
      lastSavedAt,
      lastError,
      backendConfigured: backendStatus.configured,
      remoteChecked,
      session,
      update,
      replaceDraft,
      save,
      revert,
      refresh,
      imageFor,
      openPreview,
    }),
    [
      content,
      draft,
      library,
      unused,
      status,
      source,
      previewing,
      dirty,
      saving,
      lastSavedAt,
      lastError,
      remoteChecked,
      session,
      update,
      replaceDraft,
      save,
      revert,
      refresh,
      imageFor,
      openPreview,
    ],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): ContextValue {
  const value = useContext(SiteContentContext);
  if (!value) throw new Error("useSiteContent must be used inside <SiteContentProvider>");
  return value;
}

/** Convenience hook for components that only need the rendered content. */
export function useContent(): SiteContent {
  return useSiteContent().content;
}
