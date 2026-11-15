import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import { CATEGORIES } from "../hooks/useReports";
import {
  IconSearch,
  IconFilter,
  IconSort,
  IconCompass,
  IconPhone,
  IconChevronDown,
} from "../components/Icons";

export default function Explore({ reports }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialization with URL sync
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [activeTypeTab, setActiveTypeTab] = useState(() => searchParams.get("type") || "all");
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") || "Semua"
  );
  const [selectedLocation, setSelectedLocation] = useState(
    () => searchParams.get("location") || "Semua"
  );
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Sync state if URL searchParams change
  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam !== null && qParam !== query) setQuery(qParam);

    const typeParam = searchParams.get("type");
    if (typeParam && ["lost", "found", "all"].includes(typeParam)) {
      setActiveTypeTab(typeParam);
    }
  }, [searchParams]);

  // Extract unique locations from reports
  const locations = useMemo(() => {
    const locSet = new Set(reports.map((r) => r.location).filter(Boolean));
    return ["Semua", ...Array.from(locSet)];
  }, [reports]);

  // Filtered reports
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => {
        if (!q) return true;
        return (
          r.itemName.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
        );
      })
      .filter((r) => {
        if (activeTypeTab === "all") return true;
        return r.reportType === activeTypeTab;
      })
      .filter((r) => {
        if (selectedCategory === "Semua") return true;
        return r.category === selectedCategory;
      })
      .filter((r) => {
        if (selectedLocation === "Semua") return true;
        return r.location.toLowerCase().includes(selectedLocation.toLowerCase());
      })
      .sort((a, b) => {
        const dateA = a.reportDate || a.incidentDate || "";
        const dateB = b.reportDate || b.incidentDate || "";
        return sortOrder === "desc" ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
      });
  }, [reports, query, activeTypeTab, selectedCategory, selectedLocation, sortOrder]);

  const activeReportsCount = useMemo(
    () => reports.filter((r) => r.status === "searching").length,
    [reports]
  );

  return (
    <div className="tb-page tb-explore-page">
      {/* 1. Top Greeting & Header Section */}
      <section className="tb-section tb-explore-header-section">
        <div className="tb-header-badge-row">
          <div className="tb-header-pill pill-blue">
            <IconCompass size={13} color="currentColor" />
            <span>Jelajah Kampus</span>
          </div>
          <div className="tb-header-pill pill-green">
            <span className="tb-badge-dot green" />
            <span>{activeReportsCount} Laporan Aktif</span>
          </div>
        </div>

        <h1 className="tb-page-title">Jelajah Barang</h1>
        <p className="tb-page-subtitle">
          Temukan barang hilang atau cek barang yang baru saja dilaporkan ditemukan di lingkungan kampus.
        </p>
      </section>

      {/* 2. Search & Filter Controls */}
      <section className="tb-section tb-controls-section">
        {/* Real-time Search Input */}
        <div className="tb-search-bar">
          <div className="tb-search-icon">
            <IconSearch size={16} color="var(--text-muted)" />
          </div>
          <input
            type="search"
            className="tb-search-input"
            placeholder="Cari dompet, iPad, KTM, botol..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari barang di jelajah"
          />
          <button
            type="button"
            className={`tb-filter-toggle-btn ${showAdvancedFilter ? "active" : ""}`}
            onClick={() => setShowAdvancedFilter((prev) => !prev)}
            aria-label="Buka Opsi Filter Lanjutan"
            title="Filter Tambahan"
          >
            <IconFilter size={15} color="currentColor" />
          </button>
        </div>

        {/* Sorting Bar */}
        <div className="tb-sort-bar">
          <div className="tb-sort-meta">
            <IconSort size={14} color="var(--text-muted)" />
            <span>Urutkan</span>
          </div>
          <div className="tb-sort-select-wrapper">
            <select
              className="tb-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Pilih Urutan"
            >
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
            <div className="tb-sort-arrow">
              <IconChevronDown size={11} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* Segmented Primary Tab Filter */}
        <div className="tb-segmented-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTypeTab === "all"}
            className={`tb-tab-btn ${activeTypeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTypeTab("all")}
          >
            Semua
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTypeTab === "lost"}
            className={`tb-tab-btn ${activeTypeTab === "lost" ? "active" : ""}`}
            onClick={() => setActiveTypeTab("lost")}
          >
            Barang Hilang
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTypeTab === "found"}
            className={`tb-tab-btn ${activeTypeTab === "found" ? "active" : ""}`}
            onClick={() => setActiveTypeTab("found")}
          >
            Ditemukan
          </button>
        </div>

        {/* Quick Filter Chips Scrollable Track: Categories */}
        <div className="tb-chips-track-block">
          <div className="tb-chips-scroll" role="tablist" aria-label="Filter Kategori">
            {["Semua", ...CATEGORIES].map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`tb-chip-btn ${isSelected ? "is-selected-dark" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === "Semua" ? "Semua Kategori" : cat}
                </button>
              );
            })}
          </div>

          {/* Quick Filter Chips Scrollable Track: Locations */}
          <div className="tb-chips-scroll sub" role="tablist" aria-label="Filter Lokasi">
            {locations.slice(0, 8).map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  className={`tb-chip-btn chip-loc ${isSelected ? "is-selected-subtle" : ""}`}
                  onClick={() => setSelectedLocation(loc)}
                >
                  {loc === "Semua" ? "Semua Lokasi" : loc}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Item Feed Listing (1-Column Mobile Stack) */}
      <section className="tb-section tb-feed-stack-section">
        <div className="tb-feed-count-row">
          <span className="tb-feed-count-text">
            Menampilkan <strong>{filteredList.length}</strong> laporan
          </span>
          {(query || activeTypeTab !== "all" || selectedCategory !== "Semua" || selectedLocation !== "Semua") && (
            <button
              type="button"
              className="tb-reset-link"
              onClick={() => {
                setQuery("");
                setActiveTypeTab("all");
                setSelectedCategory("Semua");
                setSelectedLocation("Semua");
                setSearchParams({});
              }}
            >
              Hapus Semua Filter
            </button>
          )}
        </div>

        <div className="tb-feed-stack">
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <ItemCard key={item.id} report={item} variant="detailed" />
            ))
          ) : (
            <div className="tb-empty-state">
              <p className="tb-empty-text">
                Tidak ada laporan yang sesuai dengan kriteria filter saat ini.
              </p>
              <button
                type="button"
                className="tb-btn tb-btn-secondary"
                onClick={() => {
                  setQuery("");
                  setActiveTypeTab("all");
                  setSelectedCategory("Semua");
                  setSelectedLocation("Semua");
                }}
              >
                Tampilkan Semua Barang
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Campus Support / Mini Banner */}
      <section className="tb-section tb-support-banner-section">
        <div className="tb-support-banner">
          <div className="tb-support-icon">
            <IconPhone size={17} color="#FFFFFF" />
          </div>
          <div className="tb-support-content">
            <h3 className="tb-support-title">Kehilangan barang berharga?</h3>
            <p className="tb-support-desc">
              Hubungi Pusat Keamanan Kampus via Hotline Pos Utama <strong>(024) 746-0053</strong> atau segera kunjungi Pos Satpam terdekat.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
