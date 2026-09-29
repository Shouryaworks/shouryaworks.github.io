import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";

/* --------------------------------------------------------------- surfaces -- */

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
  as: Tag = "section",
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      className={`glass-card rounded-[28px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-7 ${className}`}
    >
      {(title || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D7E2EA]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#D7E2EA]/55">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </header>
      )}
      {children}
    </Tag>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  required,
  children,
  className = "",
}: {
  label: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#D7E2EA]/60"
      >
        {label}
        {required ? <span className="ml-1 text-[#BE4C00]">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-[#D7E2EA]/45">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ input -- */

const controlClass =
  "w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-[#D7E2EA] placeholder:text-[#D7E2EA]/35 outline-none transition-colors duration-200 focus:border-white/35 focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:text-[0.95rem]";

export function TextInput({
  className = "",
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`${controlClass} ${invalid ? "border-[#BE4C00]/70" : ""} ${className}`}
    />
  );
}

export function TextArea({
  className = "",
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={`${controlClass} resize-y leading-relaxed ${invalid ? "border-[#BE4C00]/70" : ""} ${className}`}
    />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${controlClass} appearance-none ${className}`}>
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
  className = "",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className={`flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 ${className}`}>
      <div className="min-w-0">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#D7E2EA]"
        >
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-[#D7E2EA]/50">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        id={inputId}
        role="switch"
        aria-checked={checked}
        aria-label={typeof label === "string" ? label : "Toggle"}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA] ${
          checked ? "border-transparent bg-[#B600A8]/80" : "border-white/15 bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
            checked ? "translate-x-[1.4rem]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/** Chip-style list editor used for technologies, features and nav labels. */
export function TagInput({
  values,
  onChange,
  placeholder = "Add and press Enter",
  id,
  label,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
  label: string;
}) {
  const [entry, setEntry] = useState("");

  const commit = () => {
    const value = entry.trim();
    if (!value) return;
    if (!values.includes(value)) onChange([...values, value]);
    setEntry("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-[#D7E2EA]"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="rounded-full p-0.5 text-[#D7E2EA]/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D7E2EA]"
              aria-label={`Remove ${value}`}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        {values.length === 0 ? (
          <span className="text-xs text-[#D7E2EA]/35">Nothing added yet.</span>
        ) : null}
      </div>
      <div className="flex gap-2">
        <TextInput
          id={id}
          aria-label={label}
          value={entry}
          placeholder={placeholder}
          onChange={(event) => setEntry(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              commit();
            } else if (event.key === "Backspace" && !entry && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
        />
        <button
          type="button"
          onClick={commit}
          className="shrink-0 rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#D7E2EA] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA]"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- buttons -- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md";
  loading?: boolean;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "glass-button text-white shadow-[0_10px_30px_rgba(182,0,168,0.22)] hover:scale-[1.02]",
  ghost: "border border-white/15 bg-white/5 text-[#D7E2EA] hover:bg-white/10",
  subtle: "text-[#D7E2EA]/70 hover:bg-white/5 hover:text-[#D7E2EA]",
  danger: "border border-[#BE4C00]/40 bg-[#BE4C00]/15 text-[#F0C4A8] hover:bg-[#BE4C00]/25",
};

export function Button({
  variant = "ghost",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.14em] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA] disabled:cursor-not-allowed disabled:opacity-50 ${
        size === "sm" ? "px-4 py-2 text-[0.68rem]" : "px-5 py-3 text-xs"
      } ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5 text-[#D7E2EA]/70 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- status -- */

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "warn" | "good";
}) {
  const tones = {
    neutral: "border-white/15 bg-white/5 text-[#D7E2EA]/70",
    accent: "border-[#B600A8]/40 bg-[#B600A8]/15 text-[#E7A9E1]",
    warn: "border-[#BE4C00]/40 bg-[#BE4C00]/15 text-[#F0C4A8]",
    good: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#D7E2EA]/50">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </span>
  );
}

export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/8 bg-white/[0.04] ${className}`}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-white/12 px-6 py-14 text-center">
      {icon ? <div className="text-[#D7E2EA]/35">{icon}</div> : null}
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#D7E2EA]">{title}</p>
      {description ? (
        <p className="max-w-md text-sm leading-relaxed text-[#D7E2EA]/50">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ modal -- */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className={`glass-card max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] border border-white/12 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.6)] sm:rounded-[28px] sm:p-7 ${
              wide ? "sm:max-w-5xl" : "sm:max-w-2xl"
            }`}
          >
            <header className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D7E2EA]">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-[#D7E2EA]/55">
                    {description}
                  </p>
                ) : null}
              </div>
              <IconButton label="Close" onClick={onClose}>
                <X className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            </header>
            {children}
            {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  busy,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-[#D7E2EA]/70">{message}</p>
    </Modal>
  );
}

/* ----------------------------------------------------------------- toasts -- */

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };
type ToastValue = { push: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((message: string, tone: Toast["tone"] = "info") => {
    counter.current += 1;
    const id = counter.current;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 5200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />,
    error: <XCircle className="h-4 w-4 text-[#F0C4A8]" aria-hidden="true" />,
    info: <Info className="h-4 w-4 text-[#D7E2EA]/70" aria-hidden="true" />,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="glass-card pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border border-white/12 px-4 py-3 text-sm text-[#D7E2EA] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              {icons[toast.tone]}
              <span className="leading-relaxed">{toast.message}</span>
              <button
                type="button"
                onClick={() =>
                  setToasts((current) => current.filter((item) => item.id !== toast.id))
                }
                className="ml-1 rounded-full p-1 text-[#D7E2EA]/40 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D7E2EA]"
                aria-label="Dismiss notification"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside <ToastProvider>");
  return value;
}

/* ------------------------------------------------------------------ misc -- */

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string; badge?: ReactNode }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Editor sections"
      className="flex flex-wrap gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1.5"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA] ${
              isActive ? "text-white" : "text-[#D7E2EA]/55 hover:text-[#D7E2EA]"
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId="admin-tab"
                className="glass-button absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10 inline-flex items-center gap-2">
              {tab.label}
              {tab.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error";
  children: ReactNode;
}) {
  const tones = {
    info: "border-white/12 bg-white/[0.04] text-[#D7E2EA]/70",
    warn: "border-[#BE4C00]/35 bg-[#BE4C00]/10 text-[#F0C4A8]",
    error: "border-red-400/35 bg-red-500/10 text-red-200",
  } as const;
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}
    >
      {tone === "info" ? (
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1.5">{children}</div>;
}
