import type { SupabaseClient } from "@supabase/supabase-js";
import type { Enquiry, SiteContent } from "../content/types";
import { resolveContent, resolveEnquiry } from "../content/resolve";

/**
 * The only place that talks to the external backend.
 *
 * Public pages are still a fully static build — nothing here runs unless the
 * admin panel is used or a visitor submits the contact form. The Supabase
 * client is imported dynamically so its code lands in its own chunk and never
 * weighs down the first paint of the portfolio.
 *
 * Only the *anon* key is ever referenced. It is safe to ship because Supabase
 * row-level security (see `supabase/schema.sql`) decides who may read and who
 * may write. The service-role key must never appear in a `VITE_` variable,
 * because Vite inlines those into the public bundle.
 */

const BUCKET = "portfolio";
const CONTENT_ROW = "published";
const IMAGE_PREFIX = "images/";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const url = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const backendStatus = {
  configured: /^https?:\/\//i.test(url) && anonKey.length > 20,
  url: url || null,
  /** true when a key is present but does not look usable */
  misconfigured: Boolean(url || anonKey) && !/^https?:\/\//i.test(url),
};

let clientPromise: Promise<SupabaseClient | null> | null = null;

/** Lazily creates the shared client. Resolves to `null` when unconfigured. */
export async function getClient(): Promise<SupabaseClient | null> {
  if (!backendStatus.configured) return null;
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
        global: { headers: { "x-application-name": "shourya-portfolio" } },
      }),
    );
  }
  return clientPromise;
}

const describe = (error: unknown): string => {
  if (!error) return "Unknown error.";
  if (typeof error === "string") return error;
  const message = (error as { message?: string }).message;
  // A misconfigured endpoint can hand back a whole HTML page; show one clean line.
  if (message && /<html|<!doctype/i.test(message)) {
    return "The endpoint answered with a web page instead of data. Check VITE_SUPABASE_URL.";
  }
  return (message || "The request could not be completed.").slice(0, 220);
};

/** Turns a Supabase error into something a person can act on. */
function friendly(error: unknown, fallback: string): string {
  const raw = describe(error);
  if (/row-level security|not authorized|permission denied/i.test(raw)) {
    return "Supabase refused this request. Check the row-level security policies in supabase/schema.sql and that you are signed in.";
  }
  if (/fetch failed|network|failed to fetch/i.test(raw)) {
    return "Could not reach the backend. Check your connection and the VITE_SUPABASE_URL value.";
  }
  return `${fallback} ${raw}`;
}

async function withClient<T>(
  fallback: string,
  run: (client: SupabaseClient) => Promise<{ data?: T; error?: unknown }>,
): Promise<Result<T>> {
  const client = await getClient();
  if (!client) {
    return {
      ok: false,
      error: "No backend is connected. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local (see README).",
    };
  }
  try {
    const { data, error } = await run(client);
    if (error) return { ok: false, error: friendly(error, fallback) };
    return { ok: true, data: data as T };
  } catch (error) {
    return { ok: false, error: friendly(error, fallback) };
  }
}

/* ----------------------------------------------------------------- content -- */

export async function fetchPublishedContent(): Promise<Result<SiteContent | null>> {
  return withClient("Could not load the published site content.", async (client) => {
    const { data, error } = await client
      .from("site_content")
      .select("content, updated_at")
      .eq("id", CONTENT_ROW)
      .maybeSingle();
    if (error) return { error };
    const row = data as { content?: unknown; updated_at?: string } | null;
    if (!row) return { data: null };
    return {
      data: resolveContent({ ...(row.content as object), updatedAt: row.updated_at }),
    };
  });
}

export async function publishContent(
  content: SiteContent,
  author: string,
): Promise<Result<string>> {
  return withClient("Could not publish your changes.", async (client) => {
    const stamp = new Date().toISOString();
    const { data, error } = await client
      .from("site_content")
      .upsert(
        { id: CONTENT_ROW, content: { ...content, updatedAt: stamp }, updated_at: stamp, updated_by: author },
        { onConflict: "id" },
      )
      .select("updated_at")
      .single();
    if (error) return { error };
    return { data: (data as { updated_at: string }).updated_at };
  });
}

/* ------------------------------------------------------------------ images -- */

export type StoredImage = {
  path: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
};

export async function listStoredImages(): Promise<Result<StoredImage[]>> {
  return withClient("Could not load the image library from storage.", async (client) => {
    const { data, error } = await client.storage
      .from(BUCKET)
      .list(IMAGE_PREFIX, { limit: 500 });
    if (error) return { error };
    const files = (data ?? []).filter((file) => !!file.name);
    const out: StoredImage[] = [];
    for (const file of files) {
      const path = `${IMAGE_PREFIX}${file.name}`;
      const publicUrl = client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const size = await fetch(publicUrl, { method: "HEAD" })
        .then((res) => (res.ok ? Number(res.headers.get("content-length") ?? 0) : 0))
        .catch(() => 0);
      const dimensions = file.metadata?.width
        ? { width: Number(file.metadata.width), height: Number(file.metadata.height) }
        : null;
      out.push({
        path,
        width: dimensions?.width ?? 1600,
        height: dimensions?.height ?? 1000,
        bytes: size || 0,
        alt: file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " "),
      });
    }
    return { data: out };
  });
}

export async function uploadStoredImage(
  path: string,
  file: Blob,
): Promise<Result<{ path: string }>> {
  return withClient("Upload failed.", async (client) => {
    const { error } = await client.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "31536000", upsert: true });
    if (error) return { error };
    return { data: { path } };
  });
}

export async function deleteStoredImage(path: string): Promise<Result<string>> {
  return withClient("Could not delete that file.", async (client) => {
    const { error } = await client.storage.from(BUCKET).remove([path]);
    if (error) return { error };
    return { data: path };
  });
}

/* --------------------------------------------------------------- enquiries -- */

export type NewEnquiry = Pick<Enquiry, "name" | "email" | "type" | "budget" | "message">;

export async function sendEnquiry(enquiry: NewEnquiry): Promise<Result<string>> {
  return withClient("Your message could not be sent.", async (client) => {
    const { data, error } = await client
      .from("enquiries")
      .insert({ ...enquiry, read: false, archived: false })
      .select("id")
      .single();
    if (error) return { error };
    return { data: (data as { id: string }).id };
  });
}

export async function listEnquiries(): Promise<Result<Enquiry[]>> {
  return withClient("Could not load enquiries.", async (client) => {
    const { data, error } = await client
      .from("enquiries")
      .select("id, name, email, type, budget, message, created_at, read, archived")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return { error };
    const rows = ((data ?? []) as unknown[])
      .map(resolveEnquiry)
      .filter((row): row is Enquiry => row !== null);
    return { data: rows };
  });
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, "read" | "archived">>,
): Promise<Result<string>> {
  return withClient("Could not update that enquiry.", async (client) => {
    const { error } = await client.from("enquiries").update(patch).eq("id", id);
    if (error) return { error };
    return { data: id };
  });
}

export async function deleteEnquiry(id: string): Promise<Result<string>> {
  return withClient("Could not delete that enquiry.", async (client) => {
    const { error } = await client.from("enquiries").delete().eq("id", id);
    if (error) return { error };
    return { data: id };
  });
}

/* -------------------------------------------------------------------- auth -- */

export type SessionInfo = { email: string; userId: string };

export async function signIn(email: string, password: string): Promise<Result<SessionInfo>> {
  const client = await getClient();
  if (!client) {
    return {
      ok: false,
      error: "No backend is connected. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local (see README).",
    };
  }
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    const raw = describe(error);
    return {
      ok: false,
      error: /invalid login credentials/i.test(raw)
        ? "That email and password combination was not recognised."
        : friendly(error, "Sign in failed."),
    };
  }
  return {
    ok: true,
    data: {
      email: data.user?.email ?? email,
      userId: data.user?.id ?? "",
    },
  };
}

export async function signOut(): Promise<Result<boolean>> {
  const client = await getClient();
  if (!client) return { ok: true, data: true };
  const { error } = await client.auth.signOut();
  if (error) return { ok: false, error: friendly(error, "Sign out failed.") };
  return { ok: true, data: true };
}

/** Returns the signed-in admin, or `null` when there is no session. */
export async function getSession(): Promise<Result<SessionInfo | null>> {
  const client = await getClient();
  if (!client) return { ok: false, error: "No backend is connected." };
  const { data, error } = await client.auth.getSession();
  if (error) return { ok: false, error: friendly(error, "Could not restore your session.") };
  const user = data.session?.user;
  return {
    ok: true,
    data: user ? { email: user.email ?? "", userId: user.id } : null,
  };
}

/** Cheap connectivity probe used by the dashboard's backend card. */
export async function ping(): Promise<Result<string>> {
  const client = await getClient();
  if (!client) return { ok: false, error: "No backend is connected." };
  try {
    const { error } = await client.from("site_content").select("id").limit(1);
    if (error) return { ok: false, error: friendly(error, "Backend unreachable.") };
    return { ok: true, data: "connected" };
  } catch (error) {
    return { ok: false, error: friendly(error, "Backend unreachable.") };
  }
}

export const storageHelpers = {
  bucket: BUCKET,
  prefix: IMAGE_PREFIX,
  publicUrl: (path: string) =>
    `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path}`,
};
