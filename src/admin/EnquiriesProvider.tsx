import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Enquiry } from "../content/types";
import { unreadCount } from "../content/resolve";
import { deleteEnquiry, listEnquiries, updateEnquiry } from "../lib/backend";
import { useAuth } from "../lib/auth";

type EnquiriesValue = {
  rows: Enquiry[];
  unread: number;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  refresh: () => Promise<void>;
  markRead: (id: string, read: boolean) => Promise<string | null>;
  markArchived: (id: string, archived: boolean) => Promise<string | null>;
  remove: (id: string) => Promise<string | null>;
};

const EnquiriesContext = createContext<EnquiriesValue | null>(null);

/**
 * Enquiries are loaded once for the whole admin session so the sidebar badge,
 * the dashboard and the inbox never disagree.
 */
export function EnquiriesProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [status, setStatus] = useState<EnquiriesValue["status"]>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authStatus !== "authenticated") {
      setRows([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const result = await listEnquiries();
    if (result.ok) {
      setRows(result.data);
      setError(null);
      setStatus("ready");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }, [authStatus]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Applies a change locally first so the UI never lags behind a click. */
  const patch = useCallback(async (id: string, changes: Partial<Enquiry>) => {
    const previous = rows;
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    );
    const result = await updateEnquiry(id, {
      read: changes.read,
      archived: changes.archived,
    });
    if (!result.ok) {
      setRows(previous);
      return result.error;
    }
    return null;
  }, [rows]);

  const value = useMemo<EnquiriesValue>(
    () => ({
      rows,
      unread: unreadCount(rows),
      status,
      error,
      refresh,
      markRead: (id, read) => patch(id, { read }),
      markArchived: (id, archived) => patch(id, { archived }),
      remove: async (id) => {
        const previous = rows;
        setRows((current) => current.filter((row) => row.id !== id));
        const result = await deleteEnquiry(id);
        if (!result.ok) {
          setRows(previous);
          return result.error;
        }
        return null;
      },
    }),
    [rows, status, error, refresh, patch],
  );

  return <EnquiriesContext.Provider value={value}>{children}</EnquiriesContext.Provider>;
}

export function useEnquiries(): EnquiriesValue {
  const value = useContext(EnquiriesContext);
  if (!value) throw new Error("useEnquiries must be used inside <EnquiriesProvider>");
  return value;
}
