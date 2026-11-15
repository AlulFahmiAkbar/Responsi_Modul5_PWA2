import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "../utils/storage";
import { supabase } from "../utils/supabase";

const USER_REPORTS_KEY = "temubarang:user_reports:v4";
const ALL_REPORTS_KEY = "temubarang:all_reports:v4";

// Generate valid UUID to prevent Postgres "invalid input syntax for type uuid" error
const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const hex = "0123456789abcdef";
  let uuid = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += "-";
    } else if (i === 14) {
      uuid += "4";
    } else {
      uuid += hex[Math.floor(Math.random() * 16)];
    }
  }
  return uuid;
};

export const CATEGORIES = [
  "Dokumen",
  "Elektronik",
  "Tas & Dompet",
  "Kunci",
  "Aksesori",
  "Perlengkapan Kuliah",
  "Lainnya",
];

export const STATUS = {
  searching: "Sedang Dicari",
  resolved: "Sudah Ditemukan",
};

export const TYPES = {
  lost: "Barang Hilang",
  found: "Barang Ditemukan",
};

const today = (offsetDays = 0) => {
  const d = new Date(Date.now() - offsetDays * 864e5);
  return d.toISOString().slice(0, 10);
};

export const SEED_REPORTS = [
  {
    id: "rep-1",
    itemName: "KTM universitas terpasang lanyard biru navy",
    reportType: "lost",
    category: "Dokumen",
    description: "KTM universitas atas nama Alul Fahmi Akbar, terpasang lanyard warna biru navy bertuliskan Fakultas Teknik. Terakhir terlihat saat kuliah umum di meja tengah.",
    location: "Gedung Kuliah Bersama R.301",
    incidentDate: today(0),
    incidentTime: "08:30",
    reportDate: today(0),
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    reporterName: "Alul Fahmi Akbar",
    reporterContact: "+62 812-9876-5432",
    hideContact: true,
    status: "searching",
    urgent: false,
  },
  {
    id: "rep-2",
    itemName: "Kunci kontak motor ditemukan menggantung",
    reportType: "found",
    category: "Kunci",
    description: "Kunci kontak motor Honda Vario dengan gantungan pita hitam-biru dan remote alarm. Ditemukan masih menggantung di stop kontak motor parkiran barat.",
    location: "Parkiran Motor Timur",
    incidentDate: today(0),
    incidentTime: "09:15",
    reportDate: today(0),
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80",
    reporterName: "Budi Santoso (Satpam)",
    reporterContact: "+62 821-3344-5566",
    hideContact: false,
    status: "searching",
    urgent: false,
  },
  {
    id: "rep-3",
    itemName: "Dompet Kulit Eiger",
    reportType: "found",
    category: "Tas & Dompet",
    description: "Berisi kartu mahasiswa (Fak. Teknik), SIM C, dan beberapa nota. Disimpan di pos satpam gerbang utama.",
    location: "Pos Satpam Gerbang Utama",
    incidentDate: today(1),
    incidentTime: "10:15",
    reportDate: today(1),
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
    reporterName: "Regu Keamanan Pos 1",
    reporterContact: "+62 813-8899-7711",
    hideContact: false,
    status: "searching",
    urgent: false,
  },
  {
    id: "rep-4",
    itemName: "iPad Air Gen 5 Biru",
    reportType: "lost",
    category: "Elektronik",
    description: "Stiker logo astronaut di bagian belakang folio cover abu-abu. Tertinggal seusai kuliah Kalkulus jam ke-3.",
    location: "Ruang Kuliah B.302",
    incidentDate: today(1),
    incidentTime: "14:30",
    reportDate: today(1),
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
    reporterName: "Alul Fahmi Akbar",
    reporterContact: "+62 812-9876-5432",
    hideContact: false,
    status: "searching",
    urgent: true,
  },
  {
    id: "rep-5",
    itemName: "Botol Corkcicle Putih",
    reportType: "found",
    category: "Aksesori",
    description: "Ada sedikit baret di bagian tutup bawah botol. Ditemukan di tribun barat seusai latihan basket sore.",
    location: "Tribun GOR Kampus",
    incidentDate: today(2),
    incidentTime: "17:00",
    reportDate: today(2),
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    reporterName: "Dimas Anggara",
    reporterContact: "+62 857-1234-9000",
    hideContact: false,
    status: "searching",
    urgent: false,
  },
  {
    id: "rep-6",
    itemName: "Kacamata Minus Frame Hitam",
    reportType: "lost",
    category: "Aksesori",
    description: "Merk Owndays frame titanium hitam doff. Kemungkinan tertinggal di area rak wudhu lantai 1.",
    location: "Masjid Kampus Lt. 1",
    incidentDate: today(3),
    incidentTime: "12:45",
    reportDate: today(3),
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80",
    reporterName: "Siti Rahmawati",
    reporterContact: "+62 899-7722-1133",
    hideContact: true,
    status: "searching",
    urgent: false,
  },
  {
    id: "rep-7",
    itemName: "Jaket Hoodie Hitam Kampus",
    reportType: "lost",
    category: "Perlengkapan Kuliah",
    description: "Ukuran L, ada gantungan pin oranye kecil di saku depan sebelah kiri. Tertinggal di kursi tunggu perpustakaan lantai 1.",
    location: "Perpustakaan Lt. 1",
    incidentDate: today(4),
    incidentTime: "16:20",
    reportDate: today(4),
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    reporterName: "Alul Fahmi Akbar",
    reporterContact: "+62 812-9876-5432",
    hideContact: true,
    status: "resolved",
    urgent: false,
  },
];

function mapToSupabase(r) {
  return {
    id: r.id,
    report_type: r.reportType || "found",
    item_name: r.itemName || "",
    category: r.category || "Lainnya",
    description: r.description || "",
    location: r.location || "",
    incident_date: r.incidentDate || today(0),
    incident_time: r.incidentTime || "00:00",
    report_date: r.reportDate || today(0),
    image: r.image || "",
    reporter_name: r.reporterName || "Civitas Kampus",
    reporter_nim: r.reporterNim || "",
    reporter_contact: r.reporterContact || "",
    hide_contact: Boolean(r.hideContact),
    status: r.status || "searching",
    urgent: Boolean(r.urgent),
  };
}

function mapFromSupabase(d) {
  return {
    id: d.id,
    reportType: d.report_type || d.reportType || "found",
    itemName: d.item_name || d.itemName || "",
    category: d.category || "Lainnya",
    description: d.description || "",
    location: d.location || "",
    incidentDate: d.incident_date || d.incidentDate || "",
    incidentTime: d.incident_time || d.incidentTime || "",
    reportDate: d.report_date || d.reportDate || "",
    image: d.image || "",
    reporterName: d.reporter_name || d.reporterName || "Civitas Kampus",
    reporterNim: d.reporter_nim || d.reporterNim || "",
    reporterContact: d.reporter_contact || d.reporterContact || "",
    hideContact: Boolean(d.hide_contact ?? d.hideContact),
    status: d.status || "searching",
    urgent: Boolean(d.urgent),
  };
}

function loadInitialReports() {
  // 1. Try loading from all-reports persistent cache
  const allSaved = readJSON(ALL_REPORTS_KEY, null);
  if (Array.isArray(allSaved) && allSaved.length > 0) {
    return allSaved;
  }

  // 2. Try loading from user reports cache
  const userSaved = readJSON(USER_REPORTS_KEY, null) || readJSON("temubarang:user_reports:v3", null);
  if (Array.isArray(userSaved) && userSaved.length > 0) {
    const userIds = new Set(userSaved.map((r) => r.id));
    const nonDuplicatedSeeds = SEED_REPORTS.filter((s) => !userIds.has(s.id));
    return [...userSaved, ...nonDuplicatedSeeds];
  }

  // 3. Check legacy reports key
  const legacy = readJSON("temubarang:reports:v2", null);
  if (Array.isArray(legacy) && legacy.length > 0) {
    const seedIds = new Set(SEED_REPORTS.map((s) => s.id));
    const custom = legacy.filter((r) => !seedIds.has(r.id));
    if (custom.length > 0) {
      writeJSON(USER_REPORTS_KEY, custom);
    }
    return legacy;
  }

  return SEED_REPORTS;
}

export function useReports() {
  const [reports, setReports] = useState(loadInitialReports);
  const [isSyncing, setIsSyncing] = useState(false);

  // Keep all reports in persistent localStorage cache on every state change
  useEffect(() => {
    if (Array.isArray(reports) && reports.length > 0) {
      writeJSON(ALL_REPORTS_KEY, reports);
    }
  }, [reports]);

  // Sync from Supabase on mount
  useEffect(() => {
    async function fetchSupabaseReports() {
      if (!supabase) return;
      try {
        setIsSyncing(true);
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .order("report_date", { ascending: false });

        if (data && !error && data.length > 0) {
          const fromDb = data.map(mapFromSupabase);

          // Merge with local user reports so local reports are never lost
          const existingUserReports = readJSON(USER_REPORTS_KEY, []);
          const dbIds = new Set(fromDb.map((r) => r.id));
          const localOnly = existingUserReports.filter((r) => !dbIds.has(r.id));
          const mergedUserReports = [...localOnly, ...fromDb];

          writeJSON(USER_REPORTS_KEY, mergedUserReports);

          // Combine with seed reports
          const allUserIds = new Set(mergedUserReports.map((r) => r.id));
          const seeds = SEED_REPORTS.filter((s) => !allUserIds.has(s.id));
          const combined = [...mergedUserReports, ...seeds];
          setReports(combined);
          writeJSON(ALL_REPORTS_KEY, combined);
        }
      } catch (err) {
        console.warn("Supabase reports sync fallback to local:", err);
      } finally {
        setIsSyncing(false);
      }
    }
    fetchSupabaseReports();
  }, []);

  const create = async (data) => {
    const newId = generateId();
    const newReport = {
      ...data,
      id: newId,
      reportDate: today(0),
      status: "searching",
    };

    // 1. Instantly update React state & write to persistent cache synchronously
    setReports((prev) => {
      const updated = [newReport, ...prev.filter((r) => r.id !== newId)];
      writeJSON(ALL_REPORTS_KEY, updated);
      return updated;
    });

    // 2. Persist to dedicated user reports storage
    try {
      const existing = readJSON(USER_REPORTS_KEY, []);
      const updatedUserReports = [newReport, ...existing.filter((r) => r.id !== newId)];
      writeJSON(USER_REPORTS_KEY, updatedUserReports);
    } catch (e) {
      console.warn("Error saving user report to localStorage:", e);
    }

    // 3. Persist to Supabase reports table
    if (supabase) {
      try {
        const payload = mapToSupabase(newReport);
        const { error } = await supabase.from("reports").insert([payload]);
        if (error) {
          console.warn("Supabase report insert warning:", error.message);
        }
      } catch (err) {
        console.warn("Supabase report insert error:", err);
      }
    }

    return newReport;
  };

  const update = async (id, data) => {
    setReports((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      writeJSON(ALL_REPORTS_KEY, updated);
      return updated;
    });

    const existing = readJSON(USER_REPORTS_KEY, []);
    const updated = existing.map((r) => (r.id === id ? { ...r, ...data } : r));
    writeJSON(USER_REPORTS_KEY, updated);

    if (supabase) {
      try {
        const payload = mapToSupabase({ id, ...data });
        delete payload.id;
        await supabase.from("reports").update(payload).eq("id", id);
      } catch (err) {
        console.warn("Supabase report update error:", err);
      }
    }
  };

  const remove = async (id) => {
    setReports((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      writeJSON(ALL_REPORTS_KEY, updated);
      return updated;
    });

    const existing = readJSON(USER_REPORTS_KEY, []);
    writeJSON(USER_REPORTS_KEY, existing.filter((r) => r.id !== id));

    if (supabase) {
      try {
        await supabase.from("reports").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase report delete error:", err);
      }
    }
  };

  return { reports, create, update, remove, isSyncing };
}
