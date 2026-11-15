import { createContext, useContext, useEffect, useState } from "react";
import { readJSON, writeJSON } from "../utils/storage";
import { supabase } from "../utils/supabase";

export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='50' fill='%23071747'/%3E%3Ctext x='50' y='59' fill='%23ffffff' font-family='Arial,sans-serif' font-size='36' font-weight='700' text-anchor='middle'%3EAF%3C/text%3E%3C/svg%3E";

export const DEFAULT_PROFILE = {
  id: "00000000-0000-0000-0000-211201241414",
  nama: "Alul Fahmi Akbar",
  nim: "21120124140114",
  kelompok: "04",
  fakultas: "Fakultas Teknik",
  departemen: "Teknik Komputer",
  kontak: "+62 812-9876-5432",
  role: "Mahasiswa Aktif",
  avatar: DEFAULT_AVATAR,
};

const isValidUuid = (val) =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export const PRESET_AVATARS = [
  { id: "av-1", label: "Mahasiswa 1", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" },
  { id: "av-2", label: "Mahasiswi 1", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80" },
  { id: "av-3", label: "Mahasiswa 2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
  { id: "av-4", label: "Mahasiswa 3", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
];

const ProfileContext = createContext(null);
const STORAGE_KEY = "temubarang:profile:v5";
const AVATAR_CACHE_KEY = "temubarang:user_avatar_cache";

function getInitialProfile() {
  const saved = readJSON(STORAGE_KEY, null)
    || readJSON("temubarang:profile:v4", null)
    || readJSON("temubarang:profile:v3", null);

  const cachedAvatar = typeof window !== "undefined" ? localStorage.getItem(AVATAR_CACHE_KEY) : null;

  const base = saved && typeof saved === "object" ? { ...DEFAULT_PROFILE, ...saved } : { ...DEFAULT_PROFILE };

  // Use user's real cached photo immediately on initial load (0ms delay)
  if (cachedAvatar && cachedAvatar.length > 20 && !cachedAvatar.includes("photo-1534528741775-53994a69daeb")) {
    base.avatar = cachedAvatar;
  } else if (!base.avatar || base.avatar.includes("photo-1534528741775-53994a69daeb")) {
    base.avatar = DEFAULT_AVATAR;
  }

  if (!isValidUuid(base.id)) {
    base.id = DEFAULT_PROFILE.id;
  }

  return base;
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(getInitialProfile);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      if (!supabase) return;
      try {
        const nimToQuery = profile.nim || "21120124140114";
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("nim", nimToQuery)
          .maybeSingle();

        if (data && !error) {
          const isRemoteDummy = data.avatar_url && data.avatar_url.includes("photo-1534528741775-53994a69daeb");
          const localAvatar = localStorage.getItem(AVATAR_CACHE_KEY);

          let resolvedAvatar = profile.avatar;
          if (data.avatar_url && !isRemoteDummy) {
            resolvedAvatar = data.avatar_url;
            try {
              localStorage.setItem(AVATAR_CACHE_KEY, data.avatar_url);
            } catch {}
          } else if (localAvatar && localAvatar.length > 20 && !localAvatar.includes("photo-1534528741775-53994a69daeb")) {
            resolvedAvatar = localAvatar;
            // Update Supabase with the real local avatar if Supabase still has dummy
            if (isRemoteDummy) {
              supabase.from("profiles").update({ avatar_url: localAvatar }).eq("nim", nimToQuery);
            }
          } else {
            resolvedAvatar = DEFAULT_AVATAR;
          }

          const mapped = {
            id: data.id || profile.id,
            nama: data.full_name || profile.nama,
            nim: data.nim || profile.nim,
            kelompok: data.kelompok || profile.kelompok,
            fakultas: data.fakultas || profile.fakultas,
            departemen: data.departemen || profile.departemen,
            kontak: data.phone_number || profile.kontak,
            role: data.role || profile.role,
            avatar: resolvedAvatar,
          };
          setProfile(mapped);
          writeJSON(STORAGE_KEY, mapped);
        }
      } catch (err) {
        console.warn("Supabase profile load fallback to local:", err);
      }
    }
    loadFromSupabase();
  }, []);

  const updateProfile = async (updatedFields) => {
    setIsSyncing(true);
    const newProfile = { ...profile, ...updatedFields };
    if (!isValidUuid(newProfile.id)) {
      newProfile.id = DEFAULT_PROFILE.id;
    }

    // Immediately cache avatar synchronously
    if (newProfile.avatar && !newProfile.avatar.includes("photo-1534528741775-53994a69daeb")) {
      try {
        localStorage.setItem(AVATAR_CACHE_KEY, newProfile.avatar);
      } catch (e) {
        console.warn("Avatar local caching warning:", e);
      }
    }

    setProfile(newProfile);
    writeJSON(STORAGE_KEY, newProfile);

    // Save to Supabase profiles table
    if (supabase) {
      try {
        const nim = newProfile.nim || "21120124140114";
        const payload = {
          nim: nim,
          full_name: newProfile.nama,
          kelompok: newProfile.kelompok,
          fakultas: newProfile.fakultas,
          departemen: newProfile.departemen,
          phone_number: newProfile.kontak,
          role: newProfile.role,
          avatar_url: newProfile.avatar,
          updated_at: new Date().toISOString(),
        };

        // Check if row already exists with this nim
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("nim", nim)
          .maybeSingle();

        if (existing?.id) {
          const { error: updErr } = await supabase
            .from("profiles")
            .update(payload)
            .eq("id", existing.id);
          if (updErr) console.warn("Supabase update warning:", updErr.message);
        } else {
          const insertPayload = {
            ...payload,
            id: isValidUuid(newProfile.id) ? newProfile.id : DEFAULT_PROFILE.id,
          };
          const { error: insErr } = await supabase
            .from("profiles")
            .insert([insertPayload]);
          if (insErr) console.warn("Supabase insert warning:", insErr.message);
        }
      } catch (err) {
        console.warn("Supabase profile update fallback to local:", err);
      }
    }

    setIsSyncing(false);
    return newProfile;
  };

  const uploadPhoto = async (dataUrl) => {
    // Immediately write to local cache so user sees it with zero latency
    if (dataUrl) {
      try {
        localStorage.setItem(AVATAR_CACHE_KEY, dataUrl);
      } catch {}
    }
    return await updateProfile({ avatar: dataUrl });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, uploadPhoto, isSyncing, PRESET_AVATARS }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
