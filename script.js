/* =========================================================
   CULLAI — COMPLETE FRONTEND INTERACTION SYSTEM
   =========================================================
   Handles:
   - 3D hero tilt
   - 3D feature cards
   - Upload lab logic
   - Validation & UI states
   - AI processing overlay flow
   - Accessibility & performance
========================================================= */
const thresholdSlider = document.getElementById("thresholdSlider");
const thresholdValue = document.getElementById("thresholdValue");

let currentThreshold = 50;

/* =========================================================
   UTILITIES
   ========================================================= */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function bytesToMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function totalSize(files) {
  return files.reduce((sum, f) => sum + f.size, 0);
}


/* =========================================================
   ACCESSIBILITY
   ========================================================= */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* =========================================================
   HERO — 3D TILT
   ========================================================= */

const hero = document.querySelector(".hero-3d");

if (hero && !prefersReducedMotion) {
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = mapRange(y, 0, rect.height, 8, -8);
    const rotateY = mapRange(x, 0, rect.width, -8, 8);

    hero.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(20px)
    `;
  });

  hero.addEventListener("mouseleave", () => {
    hero.style.transform = `
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0px)
    `;
  });
}


/* =========================================================
   FEATURE CARDS — 3D INTERACTION
   ========================================================= */

document.querySelectorAll(".feature-card").forEach((card) => {
  if (prefersReducedMotion) return;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = mapRange(y, 0, rect.height, 6, -6);
    const rotateY = mapRange(x, 0, rect.width, -6, 6);

    card.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(24px)
    `;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = `
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0px)
    `;
  });
});


/* =========================================================
   UPLOAD LAB — DOM REFERENCES
   ========================================================= */

const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const uploadText = document.getElementById("uploadText");
const uploadInfo = document.getElementById("uploadInfo");
const uploadError = document.getElementById("uploadError");
const startBtn = document.getElementById("startAnalysisBtn");

/* AI Overlay */
const aiOverlay = document.getElementById("aiOverlay");
const aiStatus = document.getElementById("aiStatus");


/* =========================================================
   UPLOAD LAB — CONFIG & STATE
   ========================================================= */

const MAX_FILES = 20;
const MAX_SIZE_MB = 10;

let selectedFiles = [];


/* =========================================================
   UPLOAD LAB — UI HELPERS
   ========================================================= */

function showError(message) {
  uploadError.textContent = message;
  uploadError.classList.remove("hidden");
  uploadZone.classList.remove("success");
}

function clearError() {
  uploadError.textContent = "";
  uploadError.classList.add("hidden");
}

function updateUploadUI() {
  const sizeMB = bytesToMB(totalSize(selectedFiles));

  uploadInfo.textContent =
    `${selectedFiles.length} / ${MAX_FILES} images · ${sizeMB} / ${MAX_SIZE_MB} MB`;

  if (selectedFiles.length > 0) {
    uploadText.innerHTML =
      "Files ready for analysis<br><span>Click to replace selection</span>";
    uploadZone.classList.add("success");

    startBtn.classList.remove("disabled");
    startBtn.disabled = false;
  } else {
    uploadText.innerHTML =
      "Drop images here<br><span>or click to browse</span>";
    uploadZone.classList.remove("success");

    startBtn.classList.add("disabled");
    startBtn.disabled = true;
  }
}


/* =========================================================
   UPLOAD LAB — VALIDATION
   ========================================================= */

function validateFiles(files) {
  if (files.length > MAX_FILES) {
    showError(`Maximum ${MAX_FILES} images allowed.`);
    return false;
  }

  if (bytesToMB(totalSize(files)) > MAX_SIZE_MB) {
    showError(`Total size must be under ${MAX_SIZE_MB} MB.`);
    return false;
  }

  if (files.some((f) => !f.type.startsWith("image/"))) {
    showError("Only image files are supported.");
    return false;
  }

  clearError();
  return true;
}


/* =========================================================
   UPLOAD LAB — FILE HANDLING
   ========================================================= */

function handleFiles(fileList) {
  const files = Array.from(fileList);
  if (!validateFiles(files)) return;

  selectedFiles = files;
  updateUploadUI();
}


/* =========================================================
   UPLOAD LAB — EVENTS
   ========================================================= */

uploadZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) handleFiles(fileInput.files);
});

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("drag-active");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("drag-active");
});

uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("drag-active");

  if (e.dataTransfer.files.length) {
    handleFiles(e.dataTransfer.files);
  }
});


/* =========================================================
   AI PROCESSING FLOW
   ========================================================= */

const AI_STEPS = [
  "Uploading images securely…",
  "Detecting sharpness and focus…",
  "Analyzing exposure and clarity…",
  "Grouping best shots…",
  "Finalizing results…"
];

function startAIProcessing() {
  if (!selectedFiles.length) return;

  aiOverlay.classList.remove("hidden");

  let stepIndex = 0;
  aiStatus.textContent = AI_STEPS[stepIndex];

  const interval = setInterval(() => {
    stepIndex++;

    if (stepIndex < AI_STEPS.length) {
      aiStatus.textContent = AI_STEPS[stepIndex];
    } else {
      clearInterval(interval);

      /* ===============================
         SIMULATED AI SORTING
         =============================== */

      const results = {
        sharp: [],
        blurry: []
      };

      selectedFiles.forEach((file) => {
  const imageURL = URL.createObjectURL(file);

  // 🔥 Simulated sharpness score (0–100)
  const simulatedSharpness = Math.floor(Math.random() * 100);

  if (simulatedSharpness >= currentThreshold) {
    results.sharp.push({
      src: imageURL,
      name: file.name,
      score: simulatedSharpness
    });
  } else {
    results.blurry.push({
      src: imageURL,
      name: file.name,
      score: simulatedSharpness
    });
  }
});


      /* ===============================
         STORE RESULTS
         =============================== */
      localStorage.setItem(
        "cullaiResults",
        JSON.stringify(results)
      );

      localStorage.setItem("cullaiThreshold", currentThreshold);

      /* ===============================
         REDIRECT TO RESULTS PAGE
         =============================== */
      setTimeout(() => {
        window.location.href = "results.html";
      }, 600);
    }
  }, 1400);
}

startBtn.addEventListener("click", startAIProcessing);


/* =========================================================
   INITIAL STATE
   ========================================================= */

updateUploadUI();

/* =========================================================
   THRESHOLD SLIDER
   ========================================================= */
   if (thresholdSlider) {
  thresholdSlider.addEventListener("input", (e) => {
    currentThreshold = Number(e.target.value);
    thresholdValue.textContent = currentThreshold;

    // Update slider fill visually
    thresholdSlider.style.background = `
      linear-gradient(
        to right,
        var(--accent) ${currentThreshold}%,
        rgba(255,255,255,.15) ${currentThreshold}%
      )
    `;
  });
}

/* =========================================================
   CALL TO ACTION BUTTON
   ========================================================= */
const ctaStartBtn = document.getElementById("ctaStartBtn");
const uploadZoneEl = document.getElementById("uploadZone");

if (ctaStartBtn && uploadZoneEl) {
  ctaStartBtn.addEventListener("click", () => {
  UI.showToast("Upload Here", "success");

  uploadZoneEl.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

}

/* =========================================================
   FAQ ACCORDION
   ========================================================= */

document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");

    // Close other items
    document.querySelectorAll(".faq-item").forEach((el) => {
      if (el !== item) el.classList.remove("active");
    });

    // Toggle current
    item.classList.toggle("active");
  });
});

/* =========================================================
   FOOTER INFO PANEL LOGIC
   ========================================================= */

const footerPanel = document.getElementById("footerPanel");
const panelTitle = document.getElementById("footerPanelTitle");
const panelContent = document.getElementById("footerPanelContent");
const panelCloseBtn = document.querySelector(".footer-panel-close");

const panelData = {
  privacy: {
    title: "Privacy Policy",
    content: `
      <p>
        CullAI is built with privacy as a core principle.
        Images are processed locally during analysis and
        are never permanently stored.
      </p>
      <p>
        No personal data is shared with third parties.
        Backend processing (when enabled) will follow
        strict deletion policies.
      </p>
    `
  },
  terms: {
    title: "Terms of Use",
    content: `
      <p>
        CullAI is currently provided as a prototype tool.
        Results are intended to assist decision-making
        and should be reviewed by the user.
      </p>
      <p>
        The service is provided “as-is” during this phase.
      </p>
    `
  },
  contact: {
    title: "Contact",
    content: `
      <p>
        Have feedback or ideas?
      </p>
      <p>
        📧 <strong>hello@cullai.app</strong><br>
        Built for photographers & visual creators.
      </p>
    `
  }
};

function openFooterPanel(type) {
  const data = panelData[type];
  if (!data) return;

  panelTitle.textContent = data.title;
  panelContent.innerHTML = data.content;

  footerPanel.classList.remove("hidden");

  requestAnimationFrame(() => {
    footerPanel.classList.add("active");
  });
}

function closeFooterPanel() {
  footerPanel.classList.remove("active");

  setTimeout(() => {
    footerPanel.classList.add("hidden");
  }, 300);
}

/* link bindings */
document.querySelectorAll("[data-panel]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    openFooterPanel(link.dataset.panel);
  });
});

panelCloseBtn.addEventListener("click", closeFooterPanel);

/* ESC key */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeFooterPanel();
});

/* =========================================================
   AI OVERLAY RESET
   ========================================================= */
function resetAIOverlay() {
  aiOverlay.classList.add("hidden");
  aiStatus.textContent = "";
}

/* =========================================================
   EXTENSION POINTS
   ========================================================= */
/*
  NEXT STEPS (no refactor required):
  ---------------------------------
  - Results grid (Sharp vs Blurry)
  - Upload → Results transition
  - Threshold slider
  - Backend fetch integration
  - Dashboard layout
*/

