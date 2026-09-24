document.documentElement.classList.add("js");

/* Contact-page interactions. Gmail opens as a normal HTTPS link in a new tab;
   no desktop mail handler is used. */

const copyButton = document.querySelector("[data-copy-email]");
const copyLabel = document.querySelector("[data-copy-label]");
const copyStatus = document.querySelector("[data-copy-status]");
let resetTimer;

function legacyCopy(text) {
  const previouslyFocused = document.activeElement;
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand("copy");
  textArea.remove();
  previouslyFocused?.focus?.();
  return copied;
}

function showCopyState(message, state) {
  window.clearTimeout(resetTimer);

  if (copyLabel) copyLabel.textContent = state === "success" ? "Email copied" : "Copy email";
  if (copyStatus) copyStatus.textContent = message;
  copyButton?.setAttribute("data-state", state);

  if (state === "success") {
    resetTimer = window.setTimeout(() => {
      if (copyLabel) copyLabel.textContent = "Copy email";
      if (copyStatus) copyStatus.textContent = "Email address copied to clipboard.";
      copyButton?.removeAttribute("data-state");
    }, 2600);
  }
}

async function copyEmail() {
  const email = copyButton?.dataset.copyEmail;
  if (!email) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email);
    } else if (!legacyCopy(email)) {
      throw new Error("Clipboard unavailable");
    }

    showCopyState("Email address copied to clipboard.", "success");
  } catch {
    showCopyState("Copy was blocked. Select the email address and copy it manually.", "error");
  }
}

copyButton?.addEventListener("click", copyEmail);

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
