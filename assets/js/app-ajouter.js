import { CATEGORIES } from "./data.js";
import { LS, loadJSON, saveJSON } from "./storage.js";
import { initTheme, fillSelect } from "./ui.js";

const themeBtn = document.getElementById("themeBtn");
const newTextEl = document.getElementById("newText");
const newCatEl = document.getElementById("newCat");
const charCount = document.getElementById("charCount");
const saveFactBtn = document.getElementById("saveFact");
const resetCustomBtn = document.getElementById("resetCustom");

initTheme(themeBtn);
fillSelect(newCatEl, CATEGORIES.filter(c => c !== "Toutes"), "Culture");

newTextEl.addEventListener("input", () => {
  charCount.textContent = `${newTextEl.value.length}/220`;
});

saveFactBtn.addEventListener("click", () => {
  const text = newTextEl.value.trim();
  const cat = newCatEl.value;

  if (!text || text.length < 8) {
    alert("Ajoute un texte un peu plus long 🙂");
    return;
  }

  const customFacts = loadJSON(LS.custom, []);
  const id = `c_${Date.now().toString(36)}`;
  customFacts.unshift({ id, cat, text });
  saveJSON(LS.custom, customFacts);

  newTextEl.value = "";
  charCount.textContent = "0/220";
  alert("Fun fact ajouté ✅ (visible dans la page “Tous”)");
});

resetCustomBtn.addEventListener("click", () => {
  if (!confirm("Supprimer tous tes fun facts ajoutés ?")) return;
  saveJSON(LS.custom, []);
  alert("Ajouts supprimés 🧹");
});
