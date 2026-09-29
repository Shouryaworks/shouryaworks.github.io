import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  backendStatus,
  getClient,
  getSession,
  signIn as backendSignIn,
  signOut as backendSignOut,
  type SessionInfo,
} from "./backend";

export type AuthStatus = "loading" | "anonymous" | "authenticated";

type AuthValue = {
  status: AuthStatus;
  session: SessionInfo | null;
  error: string | null;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

/**
 * Admin authentication.
 *
 * Credentials are verified by Supabase; nothing secret is ever compiled into
 * this bundle, and the session itself lives in Supabase's own storage. The
 * public pages never read it — they only need to know whether *someone* is
 * signed in so a publish can be stamped with an author.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!backendStatus.configured) {
        setStatus("anonymous");
        return;
      }
      const result = await getSession();
      if (cancelled) return;
      if (result.ok) {
        setSession(result.data);
        setStatus(result.data ? "authenticated" : "anonymous");
      } else {
        setError(result.error);
        setStatus("anonymous");
      }

      const client = await getClient();
      if (!client || cancelled) return;
      const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
        if (cancelled) return;
        if (nextSession?.user) {
          setSession({ email: nextSession.user.email ?? "", userId: nextSession.user.id });
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("anonymous");
        }
      });
      return () => data.subscription.unsubscribe();
    };

    let unsubscribe: (() => void) | undefined;
    void boot().then((cleanup) => {
      unsubscribe = cleanup;
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const result = await backendSignIn(email, password);
    if (!result.ok) {
      setError(result.error);
      return result.error;
    }
    setSession(result.data);
    setStatus("authenticated");
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await backendSignOut();
    setSession(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      session,
      error,
      configured: backendStatus.configured,
      signIn,
      signOut,
    }),
    [status, session, error, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
