import { Link, useNavigate, useParams } from "react-router-dom";
import CreateReport from "./CreateReport";

export default function EditReport({ reports, update }) {
  const { id } = useParams();
  const nav = useNavigate();
  const r = reports.find((x) => x.id === id);
  if (!r) return <div className="empty">Laporan tidak ditemukan. <Link to="/laporan-saya" style={{ color: "var(--primary)" }}>Kembali</Link></div>;
  return <CreateReport initial={r} onSave={(data) => { update(id, data); nav("/laporan-saya"); }} />;
}
