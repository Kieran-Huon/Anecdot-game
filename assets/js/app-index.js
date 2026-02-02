import { DEFAULT_FACTS, CATEGORIES } from "./data.js";
import { LS, loadJSON } from "./storage.js";
import { initTheme, fillSelect, getFavsSet, renderFacts, pickRandom } from "./ui.js";

const grid = document.getElementById("grid");
const searchEl = document.getElementById("search");
const catEl = document.getElementById("category");
const showFavBtn = document.getElementById("showFavBtn");
const randomBtn = document.getElementById("randomBtn");
const themeBtn = document.getElementById("themeBtn");
const countPill = document.getElementById("countPill");

initTheme(themeBtn);

let onlyFavs = false;
let favsSet = getFavsSet();
let customFacts = loadJSON(LS.custom, []);
let facts = [...DEFAULT_FACTS, ...customFacts];

fillSelect(catEl, CATEGORIES, "Toutes");

function getFilteredFacts() {
  const q = searchEl.value.trim().toLowerCase();
  const cat = catEl.value;

  return facts.filter(f => {
    const matchesQ = !q || (f.text.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q));
    const matchesCat = (cat === "Toutes") || f.cat === cat;
    const matchesFav = !onlyFavs || favsSet.has(f.id);
    return matchesQ && matchesCat && matchesFav;
  });
}

function rerender() {
  favsSet = getFavsSet(); // refresh
  customFacts = loadJSON(LS.custom, []);
  facts = [...DEFAULT_FACTS, ...customFacts];

  const list = getFilteredFacts();
  countPill.textContent = `${list.length} fact${list.length > 1 ? "s" : ""}`;

  renderFacts({
    grid,
    facts: list,
    favsSet,
    onChange: rerender
  });
}

searchEl.addEventListener("input", rerender);
catEl.addEventListener("change", rerender);

showFavBtn.addEventListener("click", () => {
  onlyFavs = !onlyFavs;
  showFavBtn.textContent = onlyFavs ? "⭐ Favoris (ON)" : "⭐ Favoris";
  showFavBtn.style.borderColor = onlyFavs ? "rgba(122,167,255,.55)" : "";
  showFavBtn.style.background = onlyFavs ? "rgba(122,167,255,.14)" : "";
  rerender();
});

randomBtn.addEventListener("click", () => {
  const list = getFilteredFacts();
  if (!list.length) return;

  // reset filtres
  searchEl.value = "";
  catEl.value = "Toutes";
  onlyFavs = false;
  showFavBtn.textContent = "⭐ Favoris";
  showFavBtn.style.borderColor = "";
  showFavBtn.style.background = "";

  rerender();

  setTimeout(() => {
    const after = getFilteredFacts();
    const pick = pickRandom(after);
    const card = [...document.querySelectorAll(".card")].find(el => el.textContent.includes(`🆔 ${pick.id}`));
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.animate([{ transform: "scale(1)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }], { duration: 520 });
    }
  }, 80);
});

rerender();
