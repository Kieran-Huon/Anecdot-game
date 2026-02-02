import { DEFAULT_FACTS } from "./data.js";
import { LS, loadJSON } from "./storage.js";
import { initTheme, getFavsSet, renderFacts } from "./ui.js";

const grid = document.getElementById("grid");
const themeBtn = document.getElementById("themeBtn");
const countPill = document.getElementById("countPill");

initTheme(themeBtn);

function rerender() {
  const favsSet = getFavsSet();
  const customFacts = loadJSON(LS.custom, []);
  const facts = [...DEFAULT_FACTS, ...customFacts].filter(f => favsSet.has(f.id));

  countPill.textContent = `${facts.length} favoris`;

  renderFacts({
    grid,
    facts,
    favsSet,
    onChange: rerender
  });
}

rerender();
