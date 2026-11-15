import { useState, useEffect } from "react";
import { readJSON, writeJSON } from "../utils/storage";

const KEY = "temubarang:bookmarks:v1";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => readJSON(KEY, []));

  useEffect(() => {
    writeJSON(KEY, bookmarks);
  }, [bookmarks]);

  const toggleBookmark = (id) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isBookmarked = (id) => bookmarks.includes(id);

  return { bookmarks, toggleBookmark, isBookmarked };
}
