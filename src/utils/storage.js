export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`writeJSON failed for key ${key}:`, err);
    try {
      // Clear legacy storage keys to free quota space
      const legacyKeys = [
        "temubarang:reports:v1",
        "temubarang:reports:v2",
        "temubarang:profile:v1",
        "temubarang:profile:v2",
        "temubarang:profile:v3",
      ];
      legacyKeys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false; // Storage benar-benar penuh
    }
  }
}
