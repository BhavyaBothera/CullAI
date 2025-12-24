/* =========================================================
   CULLAI — RESULTS PAGE LOGIC
   =========================================================
   Responsibilities:
   - Load AI results from localStorage
   - Render Sharp / Blurry photo cards
   - 3D hover interactions
   - Navigation handling
   - Fallback mock data (dev mode)
========================================================= */


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const sharpContainer  = document.getElementById("sharpResults");
const blurryContainer = document.getElementById("blurryResults");
const backBtn         = document.getElementById("backBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const downloadSharpBtn = document.getElementById("downloadSharpBtn");
const downloadBlurryBtn = document.getElementById("downloadBlurryBtn");
const thresholdUsedEl = document.getElementById("thresholdUsed");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImage");
const lightboxName = document.getElementById("lightboxName");
const lightboxScore = document.getElementById("lightboxScore");
const liveThresholdSlider = document.getElementById("liveThresholdSlider");
const liveThresholdValue  = document.getElementById("liveThresholdValue");
const downloadSelectedBtn = document.getElementById("downloadSelectedBtn");
const selectedImages = new Set();
const statTotal = document.getElementById("statTotal");
const statSharp = document.getElementById("statSharp");
const statBlurry = document.getElementById("statBlurry");
const statSelected = document.getElementById("statSelected");

const selectionChip = document.getElementById("selectionChip");
const selectionCount = document.getElementById("selectionCount");
const compareBtn = document.getElementById("compareBtn");
const compareOverlay = document.getElementById("compareOverlay");
const closeCompareBtn = document.getElementById("closeCompareBtn");

const compareImg1 = document.getElementById("compareImg1");
const compareImg2 = document.getElementById("compareImg2");
const compareMeta1 = document.getElementById("compareMeta1");
const compareMeta2 = document.getElementById("compareMeta2");
const ratingFilter = document.getElementById("ratingFilter");
const labelFilter = document.getElementById("labelFilter");
const summaryCounts = document.getElementById("summaryCounts");
const summaryAverage = document.getElementById("summaryAverage");
const modeBadge = document.getElementById("modeBadge");


/* =========================================================
   UTILITIES
   ========================================================= */

/**
 * Safely parse JSON from localStorage
 */
function getStoredData(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

/**
 * Create an image card DOM element
 */
function createPhotoCard(src, name, score) {
  const card = document.createElement("div");
  card.className = "photo-card";

  const img = document.createElement("img");
  img.src = src;
  img.alt = name;

  const overlay = document.createElement("div");
  overlay.className = "photo-overlay";

  const label = document.createElement("span");
  label.className = "photo-name";
  label.textContent = name;

  overlay.appendChild(label);
  card.appendChild(img);
  card.appendChild(overlay);

  // 🔥 LIGHTBOX OPEN
  card.addEventListener("click", (e) => {
  // SHIFT / CTRL not required – simple toggle
  e.stopPropagation();

  if (selectedImages.has(src)) {
    selectedImages.delete(src);
    card.classList.remove("selected");
  } else {
    selectedImages.add(src);
    card.classList.add("selected");
  }
});

const starBar = document.createElement("div");
starBar.className = "star-bar";

for (let i = 1; i <= 5; i++) {
  const star = document.createElement("span");
  star.className = "star";
  star.textContent = "★";

  if (i <= score?.rating) star.classList.add("active");

  star.addEventListener("click", (e) => {
    e.stopPropagation();
    image.rating = i;
    renderResults(window.__CULLAI_RESULTS__);
  });

  starBar.appendChild(star);
}

card.appendChild(starBar);


  return card;
}

function downloadImages(images, folderName = "CullAI") {
  if (!images || !images.length) return;

  images.forEach((img, index) => {
    const link = document.createElement("a");
    link.href = img.src;
    link.download = img.name || `${folderName}_${index + 1}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

/* =========================================================
   MOCK DATA (DEV / FALLBACK)
   =========================================================
   This allows the results page to work
   even before backend integration.
========================================================= */

function getMockResults() {
  const sampleImages = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1470770903676-69b98201ea1c",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    "https://images.unsplash.com/photo-1445820200644-69f87d946277"
  ];

  return {
    sharp: sampleImages.slice(0, 3).map((src, i) => ({
      src,
      name: `Sharp_${i + 1}.jpg`
    })),
    blurry: sampleImages.slice(3).map((src, i) => ({
      src,
      name: `Blurry_${i + 1}.jpg`
    }))
  };
}


/* =========================================================
   LOAD RESULTS
   ========================================================= */

function loadResults() {
  /**
   * Expected storage format:
   * localStorage.setItem("cullaiResults", JSON.stringify({
   *   sharp: [{ src, name }],
   *   blurry: [{ src, name }]
   * }))
   */

  let results = getStoredData("cullaiResults");

  [...results.sharp, ...results.blurry].forEach(img => {
  img.rating = img.rating || 0;
  img.label = img.label || null;
});

  // Fallback to mock data if nothing exists
  if (!results || !results.sharp || !results.blurry) {
    console.warn("No stored results found. Using mock data.");
    results = getMockResults();
  }

  window.__CULLAI_ORIGINAL__ = results;
window.__CULLAI_RESULTS__ = results;
  renderResults(results);
  rebuildFlatList();
 
  if (modeBadge) {
  const isMock = !localStorage.getItem("cullaiResults");
  modeBadge.textContent = isMock ? "Mock Data" : "Live Upload";
  modeBadge.classList.toggle("mock", isMock);
  modeBadge.classList.toggle("live", !isMock);
}

}

const threshold = localStorage.getItem("cullaiThreshold");

if (threshold && thresholdUsedEl) {
  thresholdUsedEl.textContent = threshold;
}



/* =========================================================
   RENDER RESULTS
   ========================================================= */

function renderResults({ sharp, blurry }) {
  sharpContainer.innerHTML = "";
  blurryContainer.innerHTML = "";

  if (!sharp.length) {
    sharpContainer.innerHTML =
      `<p class="empty-state">No sharp images detected.</p>`;
  }

  if (!blurry.length) {
    blurryContainer.innerHTML =
      `<p class="empty-state">No blurry images detected.</p>`;
  }

  sharp.forEach((img) => {
    sharpContainer.appendChild(
      createPhotoCard(img.src, img.name)
    );
  });

  blurry.forEach((img) => {
    blurryContainer.appendChild(
      createPhotoCard(img.src, img.name, img.score)
    );
  });

  const card = createPhotoCard(img.src, img.name, img.score);

if (selectedImages.has(img.src)) {
  card.classList.add("selected");
}

container.appendChild(card);
updateStats();
updateSummary();
}


/* =========================================================
   3D HOVER TILT (PHOTO CARDS)
   ========================================================= */

function enable3DTilt() {
  const cards = document.querySelectorAll(".photo-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;

      card.style.transform = `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-8px)
      `;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `
        rotateX(0deg)
        rotateY(0deg)
        translateY(0px)
      `;
    });
  });
}


/* =========================================================
   NAVIGATION
   ========================================================= */

if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadResults();

  // Delay tilt binding slightly to ensure DOM is ready
  setTimeout(enable3DTilt, 100);
});

/* =========================================================
   DOWNLOAD HANDLERS
   ========================================================= */
if (downloadAllBtn) {
  downloadAllBtn.addEventListener("click", () => {
    const { sharp, blurry } = window.__CULLAI_RESULTS__ || {};
    downloadImages([...(sharp || []), ...(blurry || [])], "CullAI_All");
  });
}

if (downloadSharpBtn) {
  downloadSharpBtn.addEventListener("click", () => {
    downloadImages(
      window.__CULLAI_RESULTS__?.sharp,
      "CullAI_Sharp"
    );
  });
}

if (downloadBlurryBtn) {
  downloadBlurryBtn.addEventListener("click", () => {
    downloadImages(
      window.__CULLAI_RESULTS__?.blurry,
      "CullAI_Blurry"
    );
  });
}

/* =========================================================
    LIGHTBOX HANDLERS       
    ========================================================= */
    function openLightbox(src, name, score) {
  lightboxImg.src = src;
  lightboxName.textContent = name;
  lightboxScore.textContent =
    score !== undefined ? `Sharpness Score: ${score}` : "";

  lightbox.classList.remove("hidden");
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  lightboxImg.src = "";
}

/* Close on backdrop click */
lightbox.addEventListener("click", (e) => {
  if (e.target.classList.contains("lightbox-backdrop")) {
    closeLightbox();
  }
});

/* Close on ESC */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.classList.contains("hidden")) {
    closeLightbox();
  }
});

function applyLiveThreshold(threshold) {
  const original = window.__CULLAI_ORIGINAL__;
  if (!original) return;

  const updated = {
    sharp: [],
    blurry: []
  };

  [...original.sharp, ...original.blurry].forEach((img) => {
    if (img.score >= threshold) {
      updated.sharp.push(img);
    } else {
      updated.blurry.push(img);
    }
  });

  window.__CULLAI_RESULTS__ = updated;
  renderResults(updated);

  // Re-bind 3D tilt & lightbox
  setTimeout(enable3DTilt, 50);
}

if (liveThresholdSlider) {
  const savedThreshold =
    Number(localStorage.getItem("cullaiThreshold")) || 50;

  liveThresholdSlider.value = savedThreshold;
  liveThresholdValue.textContent = savedThreshold;

  liveThresholdSlider.addEventListener("input", (e) => {
    const value = Number(e.target.value);
    liveThresholdValue.textContent = value;

    liveThresholdSlider.style.background = `
      linear-gradient(
        to right,
        var(--accent) ${value}%,
        rgba(255,255,255,.15) ${value}%
      )
    `;

    applyLiveThreshold(value);
  });
}

/* =========================================================
    DOWNLOAD SELECTED HANDLER           
    ========================================================= */
    if (downloadSelectedBtn) {
  downloadSelectedBtn.addEventListener("click", () => {
    if (!selectedImages.size) {
      UI.showToast("No images selected", "error");
      return;
    }

    const allImages = [
      ...(window.__CULLAI_RESULTS__?.sharp || []),
      ...(window.__CULLAI_RESULTS__?.blurry || [])
    ];

    const toDownload = allImages.filter(img =>
      selectedImages.has(img.src)
    );

    downloadImages(toDownload, "CullAI_Selected");
  });
}

/* =========================================================
   STATS UPDATE
   ========================================================= */
function updateStats() {
  const results = window.__CULLAI_RESULTS__;
  if (!results) return;

  const total =
    results.sharp.length + results.blurry.length;

  statTotal.textContent = total;
  statSharp.textContent = results.sharp.length;
  statBlurry.textContent = results.blurry.length;
  statSelected.textContent = selectedImages.size;

  if (selectedImages.size > 0) {
    selectionChip.classList.remove("hidden");
    selectionCount.textContent = selectedImages.size;
  } else {
    selectionChip.classList.add("hidden");
  }
}

/* =========================================================
   keyboard NAVIGATION
   ========================================================= */
   let flatImageList = [];
let activeIndex = -1;

function rebuildFlatList() {
  const results = window.__CULLAI_RESULTS__;
  flatImageList = [
    ...results.sharp,
    ...results.blurry
  ];
}

document.addEventListener("keydown", (e) => {
  if (lightbox && !lightbox.classList.contains("hidden")) {
    if (e.key === "Escape") closeLightbox();
    return;
  }

  if (!flatImageList.length) return;

  switch (e.key) {
    case "ArrowRight":
      activeIndex = (activeIndex + 1) % flatImageList.length;
      openLightbox(
        flatImageList[activeIndex].src,
        flatImageList[activeIndex].name,
        flatImageList[activeIndex].score
      );
      break;

    case "ArrowLeft":
      activeIndex =
        (activeIndex - 1 + flatImageList.length) %
        flatImageList.length;
      openLightbox(
        flatImageList[activeIndex].src,
        flatImageList[activeIndex].name,
        flatImageList[activeIndex].score
      );
      break;

    case " ":
      e.preventDefault();
      const current = flatImageList[activeIndex];
      if (!current) return;

      if (selectedImages.has(current.src)) {
        selectedImages.delete(current.src);
      } else {
        selectedImages.add(current.src);
      }

      renderResults(window.__CULLAI_RESULTS__);
      break;

    case "s":
    case "S":
      moveImage(current, "sharp");
      break;

    case "b":
    case "B":
      moveImage(current, "blurry");
      break;

    case "1": case "2": case "3": case "4": case "5":
  current.rating = Number(e.key);
  renderResults(window.__CULLAI_RESULTS__);
  break;

case "g": case "G":
  current.label = "green"; break;
case "y": case "Y":
  current.label = "yellow"; break;
case "r": case "R":
  current.label = "red"; break;

  }
});

function moveImage(image, target) {
  const original = window.__CULLAI_ORIGINAL__;
  if (!image || !original) return;

  original.sharp = original.sharp.filter(i => i.src !== image.src);
  original.blurry = original.blurry.filter(i => i.src !== image.src);

  original[target].push(image);

  applyLiveThreshold(
    Number(liveThresholdSlider.value)
  );
}

/* =========================================================
   Compare Logic
   ========================================================= */
   if (compareBtn) {
  compareBtn.addEventListener("click", () => {
    if (selectedImages.size !== 2) {
      UI.showToast("Select exactly 2 images to compare", "info");
      return;
    }

    const allImages = [
      ...window.__CULLAI_RESULTS__.sharp,
      ...window.__CULLAI_RESULTS__.blurry
    ];

    const selected = allImages.filter(img =>
      selectedImages.has(img.src)
    );

    openCompare(selected[0], selected[1]);
  });
}

function openCompare(img1, img2) {
  compareImg1.src = img1.src;
  compareImg2.src = img2.src;

  compareMeta1.textContent =
    `${img1.name} · Score ${img1.score}`;
  compareMeta2.textContent =
    `${img2.name} · Score ${img2.score}`;

  compareOverlay.classList.remove("hidden");
}

function closeCompare() {
  compareOverlay.classList.add("hidden");
}

closeCompareBtn.addEventListener("click", closeCompare);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" &&
      !compareOverlay.classList.contains("hidden")) {
    closeCompare();
  }
});

/* ========================================================
    Rating & Label Filters
   ========================================================= */
   card.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  const order = [null, "green", "yellow", "red"];
  const next =
    order[(order.indexOf(image.label) + 1) % order.length];

  image.label = next;
  renderResults(window.__CULLAI_RESULTS__);
});

if (image.label) {
  const dot = document.createElement("div");
  dot.className = `label-dot label-${image.label}`;
  card.appendChild(dot);
}

function applyFilters() {
  const minRating = Number(ratingFilter.value);
  const label = labelFilter.value;

  const original = window.__CULLAI_ORIGINAL__;
  const filtered = { sharp: [], blurry: [] };

  [...original.sharp, ...original.blurry].forEach(img => {
    if (img.rating < minRating) return;
    if (label !== "all" && img.label !== label) return;

    if (img.score >= liveThresholdSlider.value)
      filtered.sharp.push(img);
    else
      filtered.blurry.push(img);
  });

  window.__CULLAI_RESULTS__ = filtered;
  renderResults(filtered);
}

ratingFilter.addEventListener("change", applyFilters);
labelFilter.addEventListener("change", applyFilters);

/* =========================================================
   Update Summary Stats
   ========================================================= */
function updateSummary() {
  const r = window.__CULLAI_RESULTS__;
  if (!r) return;

  const all = [...r.sharp, ...r.blurry];
  const total = all.length;

  const avg =
    total > 0
      ? Math.round(
          all.reduce((sum, img) => sum + img.score, 0) / total
        )
      : 0;

  summaryCounts.textContent =
    `${total} images • ${r.sharp.length} sharp • ${r.blurry.length} blurry`;

  summaryAverage.textContent =
    total ? `Avg sharpness: ${avg}` : "Avg sharpness: —";
}


/* =========================================================
   EXTENSION POINTS
   ========================================================= */
/*
  NEXT UPGRADES (NO REFACTOR NEEDED):
  ---------------------------------
  - Download buttons per column
  - Keyboard navigation
  - Sorting / filtering
  - Real backend result binding
*/