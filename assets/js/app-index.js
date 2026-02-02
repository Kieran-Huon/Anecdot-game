import { DEFAULT_FACTS, CATEGORIES } from "./data.js";
import { LS, loadJSON } from "./storage.js";
import { initTheme, getFavsSet, renderFacts, pickRandom } from "./ui.js";

/* -------------------------
  Elements
------------------------- */
const grid = document.getElementById("grid");
const searchEl = document.getElementById("search");
const showFavBtn = document.getElementById("showFavBtn");
const randomBtn = document.getElementById("randomBtn");
const themeBtn = document.getElementById("themeBtn");
const countPill = document.getElementById("countPill");

// Custom dropdown elements
const catDD = document.getElementById("catDD");
const categoryBtn = document.getElementById("categoryBtn");
const categoryLabel = document.getElementById("categoryLabel");
const categoryMenu = document.getElementById("categoryMenu");
const categoryHidden = document.getElementById("category"); // input hidden

/* -------------------------
  Init theme
------------------------- */
initTheme(themeBtn);

/* -------------------------
  State
------------------------- */
let onlyFavs = false;
let favsSet = getFavsSet();
let customFacts = loadJSON(LS.custom, []);
let facts = [...DEFAULT_FACTS, ...customFacts];

/* -------------------------
  Custom dropdown
------------------------- */
function openDD() {
  catDD?.classList.add("open");
}
function closeDD() {
  catDD?.classList.remove("open");
}
function toggleDD() {
  if (!catDD) return;
  catDD.classList.contains("open") ? closeDD() : openDD();
}

function buildCategoryDropdown() {
  if (!categoryMenu || !categoryHidden || !categoryLabel) return;

  categoryMenu.innerHTML = "";
  const options = CATEGORIES; // inclut "Toutes"

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ddItem";
    btn.textContent = opt;
    btn.setAttribute("role", "option");

    const selected = categoryHidden.value === opt;
    btn.setAttribute("aria-selected", selected ? "true" : "false");

    btn.addEventListener("click", () => {
      categoryHidden.value = opt;
      categoryLabel.textContent = opt;

      // update selected state in menu
      [...categoryMenu.querySelectorAll(".ddItem")].forEach(x =>
        x.setAttribute("aria-selected", "false")
      );
      btn.setAttribute("aria-selected", "true");

      closeDD();
      rerender();
    });

    categoryMenu.appendChild(btn);
  });
}

function initCategoryDropdown() {
  if (!categoryHidden || !categoryLabel) return;

  // valeur par défaut
  categoryHidden.value = categoryHidden.value || "Toutes";
  categoryLabel.textContent = categoryHidden.value;

  buildCategoryDropdown();

  // toggle menu
  categoryBtn?.addEventListener("click", toggleDD);

  // clic dehors => ferme
  window.addEventListener("click", (e) => {
    if (!catDD) return;
    if (!catDD.contains(e.target)) closeDD();
  });

  // ESC => ferme
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDD();
  });
}

initCategoryDropdown();

/* -------------------------
  Filtering
------------------------- */
function getFilteredFacts() {
  const q = (searchEl?.value || "").trim().toLowerCase();
  const cat = categoryHidden?.value || "Toutes";

  return facts.filter(f => {
    const matchesQ =
      !q ||
      f.text.toLowerCase().includes(q) ||
      f.cat.toLowerCase().includes(q);

    const matchesCat = cat === "Toutes" || f.cat === cat;
    const matchesFav = !onlyFavs || favsSet.has(f.id);

    return matchesQ && matchesCat && matchesFav;
  });
}

/* -------------------------
  Render
------------------------- */
function rerender() {
  favsSet = getFavsSet(); // refresh favs
  customFacts = loadJSON(LS.custom, []);
  facts = [...DEFAULT_FACTS, ...customFacts];

  const list = getFilteredFacts();

  if (countPill) {
    countPill.textContent = `${list.length} fact${list.length > 1 ? "s" : ""}`;
  }

  renderFacts({
    grid,
    facts: list,
    favsSet,
    onChange: rerender,
  });
}

/* -------------------------
  Events
------------------------- */
searchEl?.addEventListener("input", rerender);

showFavBtn?.addEventListener("click", () => {
  onlyFavs = !onlyFavs;

  showFavBtn.textContent = onlyFavs ? "⭐ Favoris (ON)" : "⭐ Favoris";
  showFavBtn.style.borderColor = onlyFavs ? "rgba(122,167,255,.55)" : "";
  showFavBtn.style.background = onlyFavs ? "rgba(122,167,255,.14)" : "";

  rerender();
});

randomBtn?.addEventListener("click", () => {
  const current = getFilteredFacts();
  if (!current.length) return;

  // reset filtres
  if (searchEl) searchEl.value = "";
  if (categoryHidden) categoryHidden.value = "Toutes";
  if (categoryLabel) categoryLabel.textContent = "Toutes";

  // reset selected state du dropdown
  if (categoryMenu) {
    [...categoryMenu.querySelectorAll(".ddItem")].forEach(x =>
      x.setAttribute("aria-selected", x.textContent === "Toutes" ? "true" : "false")
    );
  }

  onlyFavs = false;
  if (showFavBtn) {
    showFavBtn.textContent = "⭐ Favoris";
    showFavBtn.style.borderColor = "";
    showFavBtn.style.background = "";
  }

  closeDD();
  rerender();

  // Scroll vers un fact random dans la liste complète
  setTimeout(() => {
    const after = getFilteredFacts();
    if (!after.length) return;

    const pick = pickRandom(after);
    const card = document.querySelector(`[data-fact-id="${pick.id}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }],
        { duration: 520 }
      );
    }
  }, 80);
});

/* -------------------------
  First render
------------------------- */
rerender();
