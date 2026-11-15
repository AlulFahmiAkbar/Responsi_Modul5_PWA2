import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import {
  IconPlus,
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconClipboard,
} from "../components/Icons";

export default function MyReports({ reports, update, remove }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filter reports reported by user
  const myReports = useMemo(() => {
    return reports.filter(
      (r) =>
        r.reporterName === "Alul Fahmi Akbar" ||
        !r.reporterName ||
        r.reporterName.includes("Alul")
    );
  }, [reports]);

  // Statistics
  const totalCount = myReports.length;
  const resolvedCount = useMemo(
    () => myReports.filter((r) => r.status === "resolved").length,
    [myReports]
  );
  const activeCount = useMemo(
    () => myReports.filter((r) => r.status === "searching").length,
    [myReports]
  );

  // Filtered list by active tab
  const displayedList = useMemo(() => {
    return myReports.filter((r) => {
      if (activeTab === "all") return true;
      if (activeTab === "lost") return r.reportType === "lost" && r.status === "searching";
      if (activeTab === "found") return r.reportType === "found" && r.status === "searching";
      if (activeTab === "resolved") return r.status === "resolved";
      return true;
    });
  }, [myReports, activeTab]);

  const handleToggleStatus = (report) => {
    const nextStatus = report.status === "searching" ? "resolved" : "searching";
    update(report.id, { status: nextStatus });
  };

  const handleDelete = (report) => {
    setConfirmDelete(report);
  };

  const confirmRemove = () => {
    if (confirmDelete) {
      remove(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="tb-page tb-myreports-page">
      {/* 1. Top Summary & Metric Overview */}
      <section className="tb-section tb-myreports-header">
        <div className="tb-myreports-title-row">
          <div className="tb-myreports-text">
            <h1 className="tb-page-title">Laporan Saya</h1>
            <p className="tb-page-subtitle">
              Pantau dan kelola riwayat semua laporan barang hilang maupun temuan Anda di kampus.
            </p>
          </div>
          <div className="tb-myreports-avatar-badge">
            <IconClipboard size={20} color="var(--primary)" />
          </div>
        </div>

        {/* Quick Stats Bento Strip */}
        <div className="tb-bento-strip">
          <div className="tb-bento-item">
            <span className="tb-bento-num text-blue">{totalCount}</span>
            <span className="tb-bento-label">Total Laporan</span>
          </div>
          <div className="tb-bento-item">
            <span className="tb-bento-num text-green">{resolvedCount}</span>
            <span className="tb-bento-label">Selesai</span>
          </div>
          <div className="tb-bento-item">
            <span className="tb-bento-num text-red">{activeCount}</span>
            <span className="tb-bento-label">Sedang Dicari</span>
          </div>
        </div>
      </section>

      {/* 2. Segmented Filter Tabs */}
      <section className="tb-section tb-myreports-tabs-section">
        <div className="tb-segmented-tabs" role="tablist">
          <button
            type="button"
            className={`tb-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Semua ({totalCount})
          </button>
          <button
            type="button"
            className={`tb-tab-btn ${activeTab === "lost" ? "active" : ""}`}
            onClick={() => setActiveTab("lost")}
          >
            Hilang
          </button>
          <button
            type="button"
            className={`tb-tab-btn ${activeTab === "found" ? "active" : ""}`}
            onClick={() => setActiveTab("found")}
          >
            Ditemukan
          </button>
          <button
            type="button"
            className={`tb-tab-btn ${activeTab === "resolved" ? "active" : ""}`}
            onClick={() => setActiveTab("resolved")}
          >
            Selesai ({resolvedCount})
          </button>
        </div>
      </section>

      {/* 3. Report List */}
      <section className="tb-section tb-myreports-feed">
        {displayedList.length > 0 ? (
          displayedList.map((item) => (
            <ItemCard
              key={item.id}
              report={item}
              variant="manage"
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="tb-empty-state">
            <div className="tb-empty-icon-circle">
              <IconClipboard size={32} color="var(--primary)" />
            </div>
            <h3 className="tb-empty-title">Belum ada laporan di kategori ini</h3>
            <p className="tb-empty-text">
              Laporkan barang yang Anda temukan atau cari barang Anda yang hilang di lingkungan kampus.
            </p>
            <Link to="/buat" className="tb-btn tb-btn-primary">
              <IconPlus size={16} color="currentColor" />
              <span>Buat Laporan Pertama</span>
            </Link>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="tb-modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="tb-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-modal-icon warning">
              <IconAlertCircle size={28} color="var(--lost-color)" />
            </div>
            <h3 className="tb-modal-title">Hapus Laporan?</h3>
            <p className="tb-modal-message">
              Apakah Anda yakin ingin menghapus laporan <strong>"{confirmDelete.itemName}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="tb-modal-actions">
              <button
                type="button"
                className="tb-btn tb-btn-danger"
                onClick={confirmRemove}
              >
                Hapus Sekarang
              </button>
              <button
                type="button"
                className="tb-btn tb-btn-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
