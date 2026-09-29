import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import FadeIn from "./FadeIn";
import { useSiteContent } from "../content/SiteContentProvider";
import { sendEnquiry } from "../lib/backend";

type Status = "idle" | "sending" | "sent" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function EnquiryForm() {
  const { content, backendConfigured } = useSiteContent();
  const { contact } = content;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState(contact.enquiryTypes[0] ?? "");
  const [budget, setBudget] = useState(contact.budgets[0] ?? "");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const mailtoHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    `Enquiry — ${type || "Project"}`,
  )}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please add your name.");
    if (!EMAIL_PATTERN.test(email.trim())) return setError("That email address looks incomplete.");
    if (!message.trim()) return setError("Please tell me a little about the project.");
    // Bots fill every field they find; humans never see this one.
    if (honeypot) return setStatus("sent");

    // Without a connected backend the form degrades to the visitor's mail app
    // instead of failing silently.
    if (!backendConfigured) {
      window.location.href = mailtoHref;
      return;
    }

    setStatus("sending");
    const result = await sendEnquiry({
      name: name.trim(),
      email: email.trim(),
      type,
      budget,
      message: message.trim(),
    });

    if (result.ok) {
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
      return;
    }
    setStatus("error");
    setError(result.error);
  };

  if (status === "sent") {
    return (
      <FadeIn className="glass-panel mt-10 w-full rounded-[32px] p-7 sm:p-9" y={24}>
        <h3 className="text-lg font-medium uppercase tracking-[0.18em] text-[#D7E2EA] sm:text-xl">
          Thank you
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D7E2EA]/75 sm:text-base">
          Your enquiry has been received. {contact.formNote}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#D7E2EA] transition-all duration-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7E2EA]"
        >
          Send another
        </button>
      </FadeIn>
    );
  }

  const inputClass =
    "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-[#D7E2EA] placeholder:text-[#D7E2EA]/40 outline-none transition-colors duration-200 focus:border-white/35 focus:bg-white/10 sm:text-base";

  return (
    <FadeIn className="mt-10 w-full border-t border-white/10 pt-8" y={24}>
      <h3 className="text-xs uppercase tracking-[0.28em] text-[#D7E2EA]/60 sm:text-sm">
        {contact.formTitle}
      </h3>

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="enquiry-name"
            className="text-xs uppercase tracking-[0.18em] text-[#D7E2EA]/60"
          >
            Name
          </label>
          <input
            id="enquiry-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            maxLength={120}
            className={inputClass}
            placeholder="Your name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="enquiry-email"
            className="text-xs uppercase tracking-[0.18em] text-[#D7E2EA]/60"
          >
            Email
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            maxLength={160}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="enquiry-type"
            className="text-xs uppercase tracking-[0.18em] text-[#D7E2EA]/60"
          >
            What do you need?
          </label>
          <select
            id="enquiry-type"
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {contact.enquiryTypes.map((option) => (
              <option key={option} value={option} className="bg-[#0C0C0C]">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="enquiry-budget"
            className="text-xs uppercase tracking-[0.18em] text-[#D7E2EA]/60"
          >
            Budget
          </label>
          <select
            id="enquiry-budget"
            name="budget"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {contact.budgets.map((option) => (
              <option key={option} value={option} className="bg-[#0C0C0C]">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label
            htmlFor="enquiry-message"
            className="text-xs uppercase tracking-[0.18em] text-[#D7E2EA]/60"
          >
            Message
          </label>
          <textarea
            id="enquiry-message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            rows={5}
            maxLength={4000}
            className={`${inputClass} resize-y`}
            placeholder="What are you building, and what should it feel like?"
          />
        </div>

        {/* Honeypot — hidden from people, irresistible to bots. */}
        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="enquiry-company">Company</label>
          <input
            id="enquiry-company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="sm:col-span-2 rounded-2xl border border-[#BE4C00]/40 bg-[#BE4C00]/10 px-4 py-3 text-sm text-[#F0C4A8]"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button
            type="submit"
            disabled={status === "sending"}
            className="glass-button inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Send enquiry
              </>
            )}
          </button>

          <p className="text-xs text-[#D7E2EA]/50">
            {backendConfigured
              ? contact.formNote
              : "Sending opens your email app — the form is not connected to a backend yet."}
          </p>
        </div>
      </form>
    </FadeIn>
  );
}
