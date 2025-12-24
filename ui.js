/* =========================================================
   SHARED UI UTILITIES
   ========================================================= */

const loader = document.getElementById("globalLoader");
const toastContainer = document.getElementById("toastContainer");

/* ---------- Loader ---------- */

function showLoader(text = "Processing…") {
  if (!loader) return;
  loader.querySelector("p").textContent = text;
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader?.classList.add("hidden");
}

/* ---------- Toasts ---------- */

function showToast(message, type = "info", timeout = 3000) {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, timeout);
}

/* ---------- Expose globally ---------- */
window.UI = {
  showLoader,
  hideLoader,
  showToast
};

/* =========================================================
   SHORTCUTS OVERLAY LOGIC
   ========================================================= */

const shortcutsOverlay = document.getElementById("shortcutsOverlay");

function toggleShortcuts() {
  if (!shortcutsOverlay) return;
  shortcutsOverlay.classList.toggle("hidden");
}

/* Toggle with ? */
document.addEventListener("keydown", (e) => {
  if (e.key === "?" || (e.shiftKey && e.key === "/")) {
    e.preventDefault();
    toggleShortcuts();
  }

  if (e.key === "Escape" && shortcutsOverlay &&
      !shortcutsOverlay.classList.contains("hidden")) {
    shortcutsOverlay.classList.add("hidden");
  }
});

/* Close on backdrop click */
shortcutsOverlay?.addEventListener("click", (e) => {
  if (e.target.classList.contains("shortcuts-backdrop")) {
    shortcutsOverlay.classList.add("hidden");
  }
});
