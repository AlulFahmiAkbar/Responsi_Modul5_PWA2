import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "../utils/storage";

const KEY = "temubarang:reports:v2";

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

export function useReports() {
  const [reports, setReports] = useState(() => {
    const saved = readJSON(KEY, null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return SEED_REPORTS;
  });

  useEffect(() => {
    writeJSON(KEY, reports);
  }, [reports]);

  const create = (data) =>
    setReports((prev) => [
      {
        ...data,
        id: "rep-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        reportDate: today(0),
        status: "searching",
      },
      ...prev,
    ]);

  const update = (id, data) =>
    setReports((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );

  const remove = (id) =>
    setReports((prev) => prev.filter((item) => item.id !== id));

  return { reports, create, update, remove };
}
