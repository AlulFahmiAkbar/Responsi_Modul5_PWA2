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
        "temubarang:profile:v4",
      ];
      legacyKeys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      // Fallback: If still full because array has heavy base64 images,
      // preserve all report metadata and only strip data: images from older entries
      if (Array.isArray(value)) {
        try {
          const lightweight = value.map((item, idx) => {
            if (idx > 2 && item.image && item.image.startsWith("data:")) {
              return { ...item, image: "" };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(lightweight));
          return true;
        } catch {}
      }
      return false;
    }
  }
}
