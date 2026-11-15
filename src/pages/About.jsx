import { Link } from "react-router-dom";
import { TemuBarangLogo, IconArrowLeft, IconShieldCheck, IconCheck } from "../components/Icons";

export default function About() {
  return (
    <div className="tb-page tb-about-page">
      <div className="tb-back-nav-bar">
        <Link to="/profil" className="tb-back-btn">
          <IconArrowLeft size={18} color="var(--text-main)" />
          <span>Kembali ke Profil</span>
        </Link>
      </div>

      <div className="tb-about-hero-card">
        <TemuBarangLogo size={48} />
        <h1 className="tb-about-title">TemuBarang Kampus</h1>
        <p className="tb-about-tagline">Temukan Kembali, Kembalikan dengan Mudah.</p>
        <span className="tb-official-badge">
          <IconShieldCheck size={13} color="var(--primary)" />
          Portal Resmi Kehilangan & Penemuan Kampus
        </span>
      </div>

      <section className="tb-form-card">
        <h2 className="tb-card-header-title">Tentang Platform</h2>
        <p className="tb-about-paragraph">
          TemuBarang dirancang untuk mempermudah seluruh sivitas akademika dalam melaporkan, mencari, dan memantau barang yang tertinggal atau ditemukan di lingkungan kampus secara terpusat, cepat, dan terpercaya.
        </p>

        <h3 className="tb-detail-section-title" style={{ marginTop: 16 }}>Fitur Utama</h3>
        <ul className="tb-about-features-list">
          <li>
            <IconCheck size={15} color="var(--found-color)" />
            <span>Pencarian dan filter real-time berdasarkan kategori dan gedung/lokasi kampus.</span>
          </li>
          <li>
            <IconCheck size={15} color="var(--found-color)" />
            <span>Zona upload foto bukti yang jelas dan terkompresi otomatis.</span>
          </li>
          <li>
            <IconCheck size={15} color="var(--found-color)" />
            <span>Perlindungan privasi nomor kontak terintegrasi dengan akun SSO.</span>
          </li>
          <li>
            <IconCheck size={15} color="var(--found-color)" />
            <span>Dukungan mode terang dan mode gelap serta Progressive Web App (PWA).</span>
          </li>
        </ul>

        <div className="tb-about-meta-box">
          <p>
            <strong>TemuBarang Mobile Web App</strong>
            <br />
            Versi 1.0.0 (Release 2026)
            <br />
            Pengembang: Alul Fahmi Akbar (NIM 21120124140114) — Kelompok 04
          </p>
        </div>
      </section>
    </div>
  );
}
