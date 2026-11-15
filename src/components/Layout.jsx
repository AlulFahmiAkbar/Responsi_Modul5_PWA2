import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";
import {
  TemuBarangLogo,
  IconHome,
  IconCompass,
  IconPlus,
  IconClipboard,
  IconUser,
} from "./Icons";

export default function Layout() {
  const { profile } = useProfile();
  const location = useLocation();

  // If in Create Report or Edit Report, the header can show a custom header or back button if needed
  const isCreateOrEdit = location.pathname === "/buat" || location.pathname.startsWith("/edit");

  return (
    <div className="tb-device-viewport">
      <div className="tb-app-frame">
        {/* Top Sticky Header */}
        <header className="tb-header">
          <div className="tb-header-inner">
            <Link to="/" className="tb-brand" aria-label="TemuBarang Beranda">
              <TemuBarangLogo size={32} />
              <div className="tb-brand-text">
                <span className="tb-brand-title">TemuBarang</span>
                <span className="tb-brand-sub">KAMPUS</span>
              </div>
            </Link>

            <div className="tb-header-actions">
              {/* Profile Avatar */}
              <Link to="/profil" className="tb-avatar-btn" aria-label="Profil Mahasiswa">
                <img
                  src={profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                  alt={profile?.nama || "Profil"}
                  className="tb-avatar-img"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="tb-main">
          <Outlet />
        </main>

        {/* Bottom Floating Navigation */}
        <nav className="tb-bottomnav" aria-label="Navigasi Bawah">
          <div className="tb-bottomnav-inner">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `tb-nav-item ${isActive ? "active" : ""}`}
            >
              <div className="tb-nav-icon">
                <IconHome size={20} color="currentColor" />
              </div>
              <span className="tb-nav-label">Beranda</span>
            </NavLink>

            <NavLink
              to="/jelajah"
              className={({ isActive }) => `tb-nav-item ${isActive ? "active" : ""}`}
            >
              <div className="tb-nav-icon">
                <IconCompass size={20} color="currentColor" />
              </div>
              <span className="tb-nav-label">Jelajah</span>
            </NavLink>

            {/* Floating Center Action Button: Buat Laporan */}
            <div className="tb-nav-center-slot">
              <NavLink
                to="/buat"
                className={({ isActive }) =>
                  `tb-fab-btn ${isActive ? "active" : ""}`
                }
                aria-label="Buat Laporan Baru"
              >
                <div className="tb-fab-circle">
                  <IconPlus size={24} color="#FFFFFF" />
                </div>
                <span className="tb-fab-label">Lapor</span>
              </NavLink>
            </div>

            <NavLink
              to="/laporan-saya"
              className={({ isActive }) => `tb-nav-item ${isActive ? "active" : ""}`}
            >
              <div className="tb-nav-icon">
                <IconClipboard size={20} color="currentColor" />
              </div>
              <span className="tb-nav-label">Laporan</span>
            </NavLink>

            <NavLink
              to="/profil"
              className={({ isActive }) => `tb-nav-item ${isActive ? "active" : ""}`}
            >
              <div className="tb-nav-icon">
                <IconUser size={20} color="currentColor" />
              </div>
              <span className="tb-nav-label">Profil</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
}
