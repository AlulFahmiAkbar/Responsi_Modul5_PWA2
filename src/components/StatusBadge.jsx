export function TypeBadge({ type, size = "md" }) {
  const isLost = type === "lost";
  return (
    <span className={`tb-badge tb-type-badge ${isLost ? "is-lost" : "is-found"} size-${size}`}>
      <span className="tb-badge-dot" />
      <span>{isLost ? "Hilang" : "Ditemukan"}</span>
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="tb-category-tag">
      {category}
    </span>
  );
}

export function UrgencyBadge() {
  return (
    <span className="tb-urgency-badge">
      <span className="tb-urgency-icon">!</span>
      <span>Penting / Imbalan</span>
    </span>
  );
}

export default function StatusBadge({ status }) {
  const isResolved = status === "resolved";
  return (
    <span className={`tb-status-label ${isResolved ? "status-resolved" : "status-searching"}`}>
      {isResolved ? "Tersedia / Selesai" : "Belum Ditemukan"}
    </span>
  );
}
