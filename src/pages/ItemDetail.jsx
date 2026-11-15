import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { TypeBadge, CategoryBadge, UrgencyBadge } from "../components/StatusBadge";
import {
  IconArrowLeft,
  IconMapPin,
  IconClock,
  IconPhone,
  IconShieldCheck,
  IconBookmark,
  IconBookmarkFilled,
  IconEdit,
  IconShare,
} from "../components/Icons";
import { useBookmarks } from "../hooks/useBookmarks";

export default function ItemDetail({ reports }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [copied, setCopied] = useState(false);

  const report = reports.find((x) => x.id === id);

  if (!report) {
    return (
      <div className="tb-page tb-not-found-page">
        <div className="tb-empty-state">
          <h2 className="tb-empty-title">Laporan Tidak Ditemukan</h2>
          <p className="tb-empty-text">
            Barang yang Anda cari mungkin sudah dihapus atau tautan tidak valid.
          </p>
          <Link to="/jelajah" className="tb-btn tb-btn-primary">
            Kembali ke Jelajah
          </Link>
        </div>
      </div>
    );
  }

  const bookmarked = isBookmarked(report.id);
  const isLost = report.reportType === "lost";
  const isResolved = report.status === "resolved";

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `TemuBarang: ${report.itemName}`,
          text: `${report.reportType === "lost" ? "Dicari:" : "Ditemukan:"} ${report.itemName} di ${report.location}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignore user abort
    }
  };

  const rawPhone = report.reporterContact ? report.reporterContact.replace(/[^0-9]/g, "") : "";
  const waUrl = rawPhone ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(`Halo ${report.reporterName}, saya menghubungi terkait laporan TemuBarang: "${report.itemName}".`)}` : "";

  return (
    <div className="tb-page tb-detail-page">
      {/* Top Navigation Bar */}
      <div className="tb-detail-top-nav">
        <button
          type="button"
          className="tb-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <IconArrowLeft size={18} color="var(--text-main)" />
          <span>Kembali</span>
        </button>

        <div className="tb-detail-nav-actions">
          <button
            type="button"
            className={`tb-icon-btn ${bookmarked ? "is-bookmarked" : ""}`}
            onClick={() => toggleBookmark(report.id)}
            aria-label={bookmarked ? "Hapus dari simpanan" : "Simpan barang"}
          >
            {bookmarked ? (
              <IconBookmarkFilled size={18} color="var(--primary)" />
            ) : (
              <IconBookmark size={18} color="var(--text-muted)" />
            )}
          </button>
          <button
            type="button"
            className="tb-icon-btn"
            onClick={handleShare}
            aria-label="Bagikan laporan"
            title="Bagikan"
          >
            <IconShare size={18} color="var(--text-main)" />
          </button>
        </div>
      </div>

      {copied && (
        <div className="tb-toast-banner" role="status">
          ✓ Tautan berhasil disalin ke papan klip!
        </div>
      )}

      {/* Hero Media Banner */}
      <div className="tb-detail-hero-banner">
        {report.image ? (
          <img src={report.image} alt={report.itemName} className="tb-detail-hero-img" />
        ) : (
          <div className="tb-detail-hero-fallback">
            <span className="tb-hero-letter">{report.itemName.charAt(0).toUpperCase()}</span>
          </div>
        )}

        <div className="tb-detail-hero-badges">
          <TypeBadge type={report.reportType} size="md" />
          {report.urgent && <UrgencyBadge />}
        </div>
      </div>

      {/* Main Info Card */}
      <section className="tb-detail-card">
        <div className="tb-detail-title-block">
          <div className="tb-detail-category-row">
            <CategoryBadge category={report.category} />
            <span className={`tb-status-badge ${isResolved ? "status-resolved" : "status-searching"}`}>
              {isResolved ? "Sudah Selesai" : isLost ? "Sedang Dicari" : "Tersedia di Kampus"}
            </span>
          </div>

          <h1 className="tb-detail-item-title">{report.itemName}</h1>

          <div className="tb-detail-meta-list">
            <div className="tb-detail-meta-item">
              <IconMapPin size={15} color="var(--primary)" />
              <span>{report.location}</span>
            </div>
            <div className="tb-detail-meta-item">
              <IconClock size={14} color="var(--text-muted)" />
              <span>
                Kejadian: {report.incidentDate}
                {report.incidentTime ? ` pukul ${report.incidentTime} WIB` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="tb-detail-section">
          <h2 className="tb-detail-section-title">Deskripsi Lengkap</h2>
          <p className="tb-detail-description-text">{report.description}</p>
        </div>

        {/* Reporter & Contact Info */}
        <div className="tb-detail-section">
          <h2 className="tb-detail-section-title">Informasi Pelapor & Verifikasi</h2>
          <div className="tb-reporter-card">
            <div className="tb-reporter-avatar-circle">
              {report.reporterName ? report.reporterName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="tb-reporter-details">
              <strong className="tb-reporter-name">{report.reporterName || "Mahasiswa Kampus"}</strong>
              <span className="tb-reporter-verified">
                <IconShieldCheck size={13} color="var(--found-color)" />
                Terverifikasi SSO Kampus
              </span>
            </div>
          </div>

          {report.hideContact ? (
            <div className="tb-privacy-notice-box">
              <p className="tb-privacy-notice-text">
                🔒 Nomor kontak disembunyikan oleh pelapor demi privasi. Hubungi <strong>Pos Keamanan Kampus</strong> untuk klaim atau verifikasi kepemilikan langsung.
              </p>
            </div>
          ) : report.reporterContact ? (
            <div className="tb-contact-action-area">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tb-btn tb-btn-whatsapp"
              >
                <IconPhone size={16} color="#FFFFFF" />
                <span>Hubungi via WhatsApp ({report.reporterContact})</span>
              </a>
            </div>
          ) : null}
        </div>

        {/* Action Bottom Buttons */}
        <div className="tb-detail-footer-buttons">
          <Link to={`/edit/${report.id}`} className="tb-btn tb-btn-secondary">
            <IconEdit size={15} color="currentColor" />
            <span>Edit Laporan</span>
          </Link>
          <Link to="/jelajah" className="tb-btn tb-btn-subtle">
            Kembali ke Jelajah
          </Link>
        </div>
      </section>
    </div>
  );
}
