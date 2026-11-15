import { Link } from "react-router-dom";
import { TypeBadge, CategoryBadge, UrgencyBadge } from "./StatusBadge";
import {
  IconMapPin,
  IconClock,
  IconArrowRight,
  IconPhone,
  IconBookmark,
  IconBookmarkFilled,
  IconEdit,
  IconTrash,
  IconCheck,
} from "./Icons";
import { useBookmarks } from "../hooks/useBookmarks";

function formatRelativeTime(dateStr, timeStr) {
  if (!dateStr) return "Baru saja";
  const now = new Date();
  const date = new Date(dateStr + (timeStr ? `T${timeStr}:00` : "T00:00:00"));
  const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffHours < 1) return "Baru saja";
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return dateStr;
}

export default function ItemCard({ report, variant = "compact", onToggleStatus, onDelete }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(report.id);
  const isLost = report.reportType === "lost";
  const isResolved = report.status === "resolved";

  // 1. COMPACT VARIANT (Used in Beranda / Dashboard Recent Reports Feed)
  if (variant === "compact") {
    return (
      <article className="tb-compact-card">
        <div className="tb-compact-card-top">
          <div className="tb-compact-badges">
            <TypeBadge type={report.reportType} size="sm" />
            <CategoryBadge category={report.category} />
          </div>
          <span className="tb-compact-time">
            {formatRelativeTime(report.incidentDate || report.reportDate, report.incidentTime)}
          </span>
        </div>

        <Link to={`/barang/${report.id}`} className="tb-compact-card-body">
          <div className="tb-compact-thumb">
            {report.image ? (
              <img src={report.image} alt={report.itemName} loading="lazy" />
            ) : (
              <div className="tb-thumb-fallback">{report.itemName.charAt(0).toUpperCase()}</div>
            )}
          </div>

          <div className="tb-compact-info">
            <h3 className="tb-compact-title">{report.itemName}</h3>
            <p className="tb-compact-desc">{report.description}</p>
            <div className="tb-compact-location">
              <IconMapPin size={13} color={isLost ? "var(--lost-color)" : "var(--found-color)"} />
              <span>{report.location}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // 2. DETAILED VARIANT (Used in Jelajah Barang Feed Listing)
  if (variant === "detailed") {
    return (
      <article className="tb-detailed-card">
        {/* Photo Banner */}
        <div className="tb-detailed-banner">
          {report.image ? (
            <img src={report.image} alt={report.itemName} className="tb-banner-img" loading="lazy" />
          ) : (
            <div className="tb-banner-fallback">
              <span className="tb-banner-fallback-letter">{report.itemName.charAt(0).toUpperCase()}</span>
            </div>
          )}

          {/* Type Badge Overlay */}
          <div className="tb-banner-badge-top">
            <span className={`tb-banner-pill ${isLost ? "is-lost" : "is-found"}`}>
              <span className="tb-badge-dot" />
              <span>{isLost ? "Barang Hilang" : "Ditemukan"}</span>
            </span>
          </div>

          {/* Urgency Badge Overlay */}
          {report.urgent && (
            <div className="tb-banner-badge-urgent">
              <UrgencyBadge />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="tb-detailed-content">
          <div className="tb-detailed-header">
            <h2 className="tb-detailed-title">{report.itemName}</h2>
            <CategoryBadge category={report.category} />
          </div>

          <p className="tb-detailed-desc">{report.description}</p>

          <div className="tb-detailed-meta-block">
            <div className="tb-detailed-location">
              <IconMapPin size={14} color="var(--primary)" />
              <span>{report.location}</span>
            </div>

            <div className="tb-detailed-status-row">
              <div className="tb-detailed-date">
                <IconClock size={13} color="var(--text-muted)" />
                <span>
                  {report.incidentDate}{report.incidentTime ? ` • ${report.incidentTime} WIB` : ""}
                </span>
              </div>
              <span className={`tb-detailed-status-text ${isResolved ? "is-resolved" : "is-active"}`}>
                {isResolved ? "Sudah Ditemukan" : isLost ? "Belum Ditemukan" : "Tersedia"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tb-detailed-actions">
          <Link to={`/barang/${report.id}`} className="tb-btn tb-btn-primary tb-action-main">
            <span>Detail Barang</span>
            <IconArrowRight size={13} color="#FFFFFF" />
          </Link>

          {isLost && report.reporterContact && !report.hideContact ? (
            <a
              href={`https://wa.me/${report.reporterContact.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tb-btn tb-btn-contact"
              title="Hubungi pelapor via WhatsApp"
            >
              <IconPhone size={15} color="var(--primary)" />
              <span>Hubungi</span>
            </a>
          ) : (
            <button
              type="button"
              className={`tb-btn-icon tb-action-bookmark ${bookmarked ? "is-bookmarked" : ""}`}
              onClick={() => toggleBookmark(report.id)}
              aria-label={bookmarked ? "Hapus dari simpanan" : "Simpan barang"}
              title={bookmarked ? "Tersimpan" : "Simpan barang"}
            >
              {bookmarked ? (
                <IconBookmarkFilled size={16} color="var(--primary)" />
              ) : (
                <IconBookmark size={16} color="var(--text-muted)" />
              )}
            </button>
          )}
        </div>
      </article>
    );
  }

  // 3. MANAGE VARIANT (Used in Laporan Saya)
  return (
    <article className="tb-detailed-card tb-manage-card">
      <div className="tb-manage-top">
        <div className="tb-compact-badges">
          <TypeBadge type={report.reportType} size="sm" />
          <CategoryBadge category={report.category} />
        </div>
        <span className={`tb-detailed-status-text ${isResolved ? "is-resolved" : "is-active"}`}>
          {isResolved ? "Selesai" : "Sedang Dicari"}
        </span>
      </div>

      <div className="tb-manage-body">
        <div className="tb-manage-thumb">
          {report.image ? (
            <img src={report.image} alt={report.itemName} loading="lazy" />
          ) : (
            <div className="tb-thumb-fallback">{report.itemName.charAt(0).toUpperCase()}</div>
          )}
        </div>
        <div className="tb-manage-info">
          <Link to={`/barang/${report.id}`} className="tb-manage-title-link">
            <h3 className="tb-compact-title">{report.itemName}</h3>
          </Link>
          <div className="tb-compact-location">
            <IconMapPin size={13} color="var(--text-muted)" />
            <span>{report.location}</span>
          </div>
          <div className="tb-manage-date">
            <IconClock size={12} color="var(--text-muted)" />
            <span>Dilaporkan {report.reportDate}</span>
          </div>
        </div>
      </div>

      <div className="tb-manage-actions">
        {onToggleStatus && (
          <button
            type="button"
            className={`tb-btn tb-btn-sm ${isResolved ? "tb-btn-subtle" : "tb-btn-success"}`}
            onClick={() => onToggleStatus(report)}
          >
            <IconCheck size={14} color="currentColor" />
            <span>{isResolved ? "Buka Kembali" : "Tandai Selesai"}</span>
          </button>
        )}
        <Link to={`/edit/${report.id}`} className="tb-btn tb-btn-sm tb-btn-secondary">
          <IconEdit size={14} color="currentColor" />
          <span>Edit</span>
        </Link>
        {onDelete && (
          <button
            type="button"
            className="tb-btn tb-btn-sm tb-btn-danger"
            onClick={() => onDelete(report)}
          >
            <IconTrash size={14} color="currentColor" />
            <span>Hapus</span>
          </button>
        )}
      </div>
    </article>
  );
}
