export const LS = {
  theme: "funfacts_theme",
  favs: "funfacts_favs",
  custom: "funfacts_custom",
};

export function loadJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
