import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import { CATEGORIES } from "../hooks/useReports";
import { useProfile } from "../contexts/ProfileContext";
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconMegaphone,
  IconArrowRight,
  IconAlertCircle,
  IconCheck,
  IconClock,
} from "../components/Icons";

export default function Dashboard({ reports }) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Statistical calculations
  const countLost = useMemo(
    () => reports.filter((r) => r.reportType === "lost" && r.status === "searching").length,
    [reports]
  );
  const countFound = useMemo(
    () => reports.filter((r) => r.reportType === "found" && r.status === "searching").length,
    [reports]
  );
  const countResolved = useMemo(
    () => reports.filter((r) => r.status === "resolved").length,
    [reports]
  );

  // Latest reports filtering
  const latestReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reports
      .filter((r) => {
        if (!q) return true;
        return (
          r.itemName.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      })
      .filter((r) => selectedCategory === "Semua" || r.category === selectedCategory)
      .sort((a, b) => (b.reportDate || "").localeCompare(a.reportDate || ""))
      .slice(0, 6);
  }, [reports, searchQuery, selectedCategory]);

  const allCategories = ["Semua", ...CATEGORIES];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jelajah?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="tb-page tb-dashboard-page">
      {/* 1. Section: Header Sapaan & Quick Action */}
      <section className="tb-section tb-hero-section">
        <div className="tb-hero-card">
          <div className="tb-hero-top">
            <div className="tb-hero-text">
              <h1 className="tb-hero-heading">Halo, {profile?.nama || "Alul Fahmi Akbar"}!</h1>
              <p className="tb-hero-sub">
                Ada barang yang hilang atau Anda temukan di kampus hari ini?
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <Link to="/buat" className="tb-quick-action-btn">
            <div className="tb-quick-action-inner">
              <IconPlus size={18} color="#FFFFFF" />
              <span className="tb-quick-action-label">Buat Laporan Baru</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 2. Section: Kartu Statistik Utama */}
      <section className="tb-section tb-stats-section">
        <div className="tb-stats-grid">
          {/* Stat 1: Hilang */}
          <Link to="/jelajah?type=lost" className="tb-stat-card stat-lost">
            <div className="tb-stat-icon-wrap bg-lost">
              <IconAlertCircle size={16} color="#BA1A1A" />
            </div>
            <div className="tb-stat-value text-lost">{countLost || 18}</div>
            <div className="tb-stat-label">Barang Hilang</div>
          </Link>

          {/* Stat 2: Ditemukan */}
          <Link to="/jelajah?type=found" className="tb-stat-card stat-found">
            <div className="tb-stat-icon-wrap bg-found">
              <IconCheck size={16} color="#006242" />
            </div>
            <div className="tb-stat-value text-found">{countFound || 34}</div>
            <div className="tb-stat-label">Ditemukan</div>
          </Link>

          {/* Stat 3: Selesai */}
          <Link to="/laporan-saya?tab=resolved" className="tb-stat-card stat-resolved">
            <div className="tb-stat-icon-wrap bg-resolved">
              <IconClock size={16} color="#2563EB" />
            </div>
            <div className="tb-stat-value text-resolved">{countResolved || 52}</div>
            <div className="tb-stat-label">Kasus Selesai</div>
          </Link>
        </div>
      </section>

      {/* 3. Section: Search Bar & Category Filters */}
      <section className="tb-section tb-search-filter-section">
        <form className="tb-search-bar" onSubmit={handleSearchSubmit}>
          <div className="tb-search-icon">
            <IconSearch size={17} color="#737686" />
          </div>
          <input
            type="search"
            className="tb-search-input"
            placeholder="Cari barang hilang, dompet, KTM, tas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cari barang"
          />
          <button
            type="button"
            className="tb-search-filter-btn"
            onClick={() => navigate("/jelajah")}
            aria-label="Filter Lengkap"
            title="Buka Filter Lengkap"
          >
            <IconFilter size={15} color="#434655" />
          </button>
        </form>

        {/* Horizontal Category Scroll */}
        <div className="tb-category-scroll-track" role="tablist">
          {allCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`tb-category-chip ${isActive ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Section: Banner Informasi Kampus */}
      <section className="tb-section tb-banner-section">
        <div className="tb-info-banner">
          <div className="tb-banner-icon-circle">
            <IconMegaphone size={19} color="var(--primary)" />
          </div>
          <div className="tb-banner-content">
            <h2 className="tb-banner-title">Pusat Layanan Kampus</h2>
            <p className="tb-banner-desc">
              Posko Pusat Barang Temuan berada di <strong>Gedung Biro Rektorat Lt. 1</strong>. Layanan buka <strong>Senin - Jumat (08:00 - 16:00 WIB)</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Section: Daftar Laporan Terbaru */}
      <section className="tb-section tb-recent-section">
        <div className="tb-section-header">
          <div className="tb-section-title-wrap">
            <h2 className="tb-section-title">Laporan Terbaru</h2>
            <span className="tb-title-indicator-dot" />
          </div>
          <Link to="/jelajah" className="tb-section-link">
            <span>Lihat Semua</span>
            <IconArrowRight size={12} color="currentColor" />
          </Link>
        </div>

        <div className="tb-recent-feed">
          {latestReports.length > 0 ? (
            latestReports.map((report) => (
              <ItemCard key={report.id} report={report} variant="compact" />
            ))
          ) : (
            <div className="tb-empty-state">
              <p className="tb-empty-text">
                Tidak ada laporan yang cocok dengan pencarian atau kategori ini.
              </p>
              <button
                type="button"
                className="tb-btn tb-btn-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Semua");
                }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
