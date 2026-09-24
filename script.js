/* The portfolio uses native scrolling and no automatic motion. */
const root = document.documentElement;
let ticking = false;

function updateProgress() {
  const distance = Math.max(root.scrollHeight - window.innerHeight, 1);
  root.style.setProperty("--progress", Math.min(window.scrollY / distance, 1).toFixed(4));
  ticking = false;
}

function requestProgressUpdate() {
  if (ticking) return;
  window.requestAnimationFrame(updateProgress);
  ticking = true;
}

window.addEventListener("scroll", requestProgressUpdate, { passive: true });
window.addEventListener("resize", requestProgressUpdate);
updateProgress();

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
