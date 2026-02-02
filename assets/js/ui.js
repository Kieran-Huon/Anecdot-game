import { LS, loadJSON, saveJSON } from "./storage.js";

export function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function initTheme(themeBtn) {
  const savedTheme = localStorage.getItem(LS.theme) || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  if (themeBtn) themeBtn.textContent = savedTheme === "dark" ? "🌙" : "☀️";

  themeBtn?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(LS.theme, next);
    themeBtn.textContent = next === "dark" ? "🌙" : "☀️";
  });
}

export function fillSelect(select, options, value) {
  select.innerHTML = "";
  options.forEach(o => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    select.appendChild(opt);
  });
  if (value != null) select.value = value;
}

export function getFavsSet() {
  return new Set(loadJSON(LS.favs, []));
}

export function toggleFav(favsSet, id) {
  if (favsSet.has(id)) favsSet.delete(id);
  else favsSet.add(id);
  saveJSON(LS.favs, [...favsSet]);
}

export function renderFacts({ grid, facts, favsSet, onChange }) {
  grid.innerHTML = "";

  if (!facts.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.innerHTML = `
      <div style="font-size:16px; margin-bottom:6px;">Aucun résultat 😅</div>
      <div>Essaie une autre recherche ou enlève les filtres.</div>
    `;
    grid.appendChild(empty);
    return;
  }

  facts.forEach(f => {
    const card = document.createElement("article");
    card.className = "card";
    const isFav = favsSet.has(f.id);

    card.innerHTML = `
      <div class="cardTop">
        <div class="cat">🏷️ <span>${escapeHTML(f.cat)}</span></div>
        <button class="star ${isFav ? "active" : ""}" aria-label="Favori" title="Favori">
          ${isFav ? "⭐" : "☆"}
        </button>
      </div>

      <p class="fact">${escapeHTML(f.text)}</p>

      <div class="cardFooter">
        <div class="meta">
          <span>🆔 ${escapeHTML(f.id)}</span>
          ${f.id.startsWith("c_") ? `<span>📝 ajouté</span>` : `<span>📚 base</span>`}
        </div>
        <button class="btn small" title="Copier ce fun fact">📋 Copier</button>
      </div>
    `;

    card.querySelector(".star").addEventListener("click", () => {
      toggleFav(favsSet, f.id);
      onChange?.();
    });

    const copyBtn = card.querySelector(".btn.small");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(f.text);
        copyBtn.textContent = "✅ Copié";
        setTimeout(() => (copyBtn.textContent = "📋 Copier"), 900);
      } catch {
        alert("Impossible de copier automatiquement. Sélectionne le texte manuellement 🙏");
      }
    });

    grid.appendChild(card);
  });
}

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
