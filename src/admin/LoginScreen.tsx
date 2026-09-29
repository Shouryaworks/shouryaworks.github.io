import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { Link } from "../router";
import { useAuth } from "../lib/auth";
import { Alert, Button, TextInput } from "./ui";

/**
 * Admin sign-in.
 *
 * There is no password check in this file and there never will be one — the
 * credentials are verified by Supabase, so nothing secret is compiled into the
 * public bundle. Without a configured backend the form is replaced by setup
 * instructions rather than a fake local login.
 */
export default function LoginScreen() {
  const { signIn, configured, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!email.trim() || !password) {
      setFormError("Enter your email address and password.");
      return;
    }
    setBusy(true);
    const failure = await signIn(email.trim(), password);
    setBusy(false);
    if (failure) setFormError(failure);
  };

  return (
    <div className="admin-backdrop flex min-h-screen items-center justify-center px-4 py-10 font-kanit">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[12%] top-[18%] h-56 w-56 rounded-full bg-[#B600A8]/20 blur-3xl" />
        <div className="absolute bottom-[14%] right-[10%] h-64 w-64 rounded-full bg-[#BE4C00]/16 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-[32px] border border-white/12 p-7 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:p-9">
          <div className="glass-logo inline-flex items-center gap-2 rounded-full px-4 py-2">
            <ShieldCheck className="h-4 w-4 text-[#D7E2EA]" aria-hidden="true" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D7E2EA]">
              Shourya Studio
            </span>
          </div>

          <h1 className="hero-heading mt-7 text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
            Admin
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#D7E2EA]/60">
            Sign in to edit the portfolio, manage images and read enquiries.
          </p>

          {configured ? (
            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="admin-email"
                  className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#D7E2EA]/60"
                >
                  Email
                </label>
                <TextInput
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="admin-password"
                  className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#D7E2EA]/60"
                >
                  Password
                </label>
                <TextInput
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {formError ? <Alert tone="error">{formError}</Alert> : null}
              {error && !formError ? <Alert tone="error">{error}</Alert> : null}

              <Button
                type="submit"
                variant="primary"
                loading={busy}
                className="mt-2 w-full"
              >
                {!busy ? <LogIn className="h-4 w-4" aria-hidden="true" /> : null}
                {busy ? "Signing in" : "Sign in"}
              </Button>
            </form>
          ) : (
            <div className="mt-8 flex flex-col gap-4">
              <Alert tone="warn">
                <strong className="font-medium">No backend connected.</strong>
                <p className="mt-1.5">
                  The admin panel needs Supabase for authentication, content storage and
                  enquiries. Create a <code className="text-[#D7E2EA]">.env.local</code> file
                  with <code className="text-[#D7E2EA]">VITE_SUPABASE_URL</code> and{" "}
                  <code className="text-[#D7E2EA]">VITE_SUPABASE_ANON_KEY</code>, run{" "}
                  <code className="text-[#D7E2EA]">supabase/schema.sql</code>, then restart the
                  dev server. The README walks through it.
                </p>
              </Alert>
              {error ? <Alert tone="error">{error}</Alert> : null}
            </div>
          )}

          <Link
            href="/"
            className="mt-7 inline-flex text-xs uppercase tracking-[0.16em] text-[#D7E2EA]/45 transition-colors hover:text-[#D7E2EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA]"
          >
            ← Back to the portfolio
          </Link>
        </div>
      </motion.div>

      {busy ? (
        <span className="sr-only" role="status">
          <Loader2 aria-hidden="true" />
          Signing in
        </span>
      ) : null}
    </div>
  );
}
