import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBookmarks } from "../hooks/useBookmarks";
import { useProfile, PRESET_AVATARS } from "../contexts/ProfileContext";
import {
  IconShieldCheck,
  IconEdit,
  IconCheck,
  IconCamera,
  IconPhone,
  IconUpload,
  IconZoomIn,
  IconZoomOut,
  IconX,
} from "../components/Icons";

function toDataUrl(file, max = 400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = readerEvent.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { bookmarks } = useBookmarks();
  const { profile, updateProfile, uploadPhoto, isSyncing, PRESET_AVATARS } = useProfile();
  const avatarInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [savedSuccess, setSavedSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const openZoom = () => {
    setZoomScale(1);
    setIsZoomOpen(true);
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
    setZoomScale(1);
  };

  const toggleZoomScale = () => {
    setZoomScale((prev) => (prev > 1.2 ? 1 : 1.75));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isZoomOpen) {
        closeZoom();
      }
    };
    if (isZoomOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isZoomOpen]);

  const handleStartEdit = () => {
    setDraft({ ...profile });
    setIsEditing(true);
    setUploadError("");
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Ukuran foto maksimal 8 MB.");
      return;
    }

    try {
      setUploadError("");
      const dataUrl = await toDataUrl(file);
      
      if (isEditing) {
        setDraft((prev) => ({ ...prev, avatar: dataUrl }));
      } else {
        await uploadPhoto(dataUrl);
        setSavedSuccess("Foto profil berhasil diperbarui & disimpan ke database!");
        setTimeout(() => setSavedSuccess(""), 3000);
      }
    } catch {
      setUploadError("Gagal memproses gambar foto.");
    }
  };

  const handleSelectPreset = async (url) => {
    if (isEditing) {
      setDraft((prev) => ({ ...prev, avatar: url }));
    } else {
      await uploadPhoto(url);
      setSavedSuccess("Foto profil berhasil diperbarui!");
      setTimeout(() => setSavedSuccess(""), 3000);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!draft.nama.trim() || !draft.nim.trim()) return;

    await updateProfile(draft);
    setIsEditing(false);
    setSavedSuccess("Data profil berhasil disimpan ke database!");
    setTimeout(() => setSavedSuccess(""), 3000);
  };

  return (
    <div className="tb-page tb-profile-page">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarFile}
      />

      {/* 1. Header Card Identitas Profil */}
      <div className="tb-profile-header-card">
        <div className="tb-profile-avatar-edit-wrapper">
          <div
            className="tb-avatar-upload-trigger"
            onClick={openZoom}
            title="Klik untuk melihat foto profil (zoom)"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openZoom()}
          >
            <img
              src={isEditing ? (draft.avatar || profile.avatar) : profile.avatar}
              alt={profile.nama}
              className="tb-avatar-large-img"
            />
            <div className="tb-avatar-zoom-overlay" title="Klik untuk zoom foto">
              <IconZoomIn size={18} color="#FFFFFF" />
            </div>
          </div>
          <button
            type="button"
            className="tb-avatar-camera-btn"
            onClick={(e) => {
              e.stopPropagation();
              avatarInputRef.current?.click();
            }}
            title="Ganti Foto Profil"
            aria-label="Ganti Foto Profil"
          >
            <IconCamera size={14} color="#FFFFFF" />
          </button>
        </div>

        {uploadError && <span className="tb-field-error" style={{ marginBottom: 6 }}>{uploadError}</span>}

        {/* Quick Upload Action Button */}
        <div className="tb-avatar-quick-upload-row">
          <button
            type="button"
            className="tb-btn tb-btn-sm tb-btn-subtle"
            onClick={() => avatarInputRef.current?.click()}
          >
            <IconUpload size={13} color="currentColor" />
            <span>Unggah Foto Profil</span>
          </button>
        </div>

        {isEditing ? (
          /* Avatar Preset Selection in edit mode */
          <div className="tb-avatar-presets-box">
            <span className="tb-avatar-presets-title">Atau pilih avatar siap pakai:</span>
            <div className="tb-avatar-presets-row">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  className={`tb-preset-avatar-btn ${(isEditing ? draft.avatar : profile.avatar) === av.url ? "selected" : ""}`}
                  onClick={() => handleSelectPreset(av.url)}
                  title={av.label}
                >
                  <img src={av.url} alt={av.label} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <h1 className="tb-profile-name">{profile.nama}</h1>
            <p className="tb-profile-sub">NIM: {profile.nim}</p>

            <div className="tb-profile-tags-row">
              <span className="tb-tag-pill sso">
                <IconShieldCheck size={12} color="currentColor" />
                SSO Terverifikasi
              </span>
              <span className="tb-tag-pill dept">
                Kelompok {profile.kelompok}
              </span>
            </div>
          </>
        )}
      </div>

      {savedSuccess && (
        <div className="tb-toast-banner" role="status">
          ✓ {savedSuccess}
        </div>
      )}

      {/* 2. Profile Details & Edit Card */}
      <section className="tb-form-card">
        <div className="tb-card-header-bar">
          <h2 className="tb-card-header-title">Data Sivitas Akademika</h2>
          {!isEditing && (
            <button
              type="button"
              className="tb-btn tb-btn-sm tb-btn-subtle"
              onClick={handleStartEdit}
            >
              <IconEdit size={13} color="currentColor" />
              <span>Edit Profil</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form className="tb-edit-fields-stack" onSubmit={handleSave}>
            <div className="tb-form-field">
              <label htmlFor="p-nama" className="tb-field-label">Nama Lengkap *</label>
              <input
                id="p-nama"
                type="text"
                className="tb-input"
                placeholder="Nama lengkap mahasiswa"
                value={draft.nama}
                onChange={(e) => setDraft({ ...draft, nama: e.target.value })}
                required
              />
            </div>

            <div className="tb-form-field">
              <label htmlFor="p-nim" className="tb-field-label">NIM *</label>
              <input
                id="p-nim"
                type="text"
                className="tb-input"
                placeholder="Nomor Induk Mahasiswa"
                value={draft.nim}
                onChange={(e) => setDraft({ ...draft, nim: e.target.value })}
                required
              />
            </div>

            <div className="tb-form-field">
              <label htmlFor="p-kontak" className="tb-field-label">Nomor WhatsApp / Kontak</label>
              <input
                id="p-kontak"
                type="tel"
                className="tb-input"
                placeholder="+62 812-xxxx-xxxx"
                value={draft.kontak}
                onChange={(e) => setDraft({ ...draft, kontak: e.target.value })}
              />
            </div>

            <div className="tb-datetime-grid">
              <div className="tb-form-field">
                <label htmlFor="p-fakultas" className="tb-field-label">Fakultas</label>
                <input
                  id="p-fakultas"
                  type="text"
                  className="tb-input"
                  value={draft.fakultas}
                  onChange={(e) => setDraft({ ...draft, fakultas: e.target.value })}
                />
              </div>

              <div className="tb-form-field">
                <label htmlFor="p-kelompok" className="tb-field-label">Kelompok</label>
                <input
                  id="p-kelompok"
                  type="text"
                  className="tb-input"
                  value={draft.kelompok}
                  onChange={(e) => setDraft({ ...draft, kelompok: e.target.value })}
                />
              </div>
            </div>

            <div className="tb-form-field">
              <label htmlFor="p-departemen" className="tb-field-label">Departemen / Program Studi</label>
              <input
                id="p-departemen"
                type="text"
                className="tb-input"
                value={draft.departemen}
                onChange={(e) => setDraft({ ...draft, departemen: e.target.value })}
              />
            </div>

            <div className="tb-form-field">
              <label htmlFor="p-role" className="tb-field-label">Status Sivitas</label>
              <select
                id="p-role"
                className="tb-select"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              >
                <option value="Mahasiswa Aktif">Mahasiswa Aktif</option>
                <option value="Dosen">Dosen / Tenaga Pengajar</option>
                <option value="Tenaga Kependidikan">Tenaga Kependidikan / Staf</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>

            <div className="tb-edit-actions-row">
              <button
                type="submit"
                className="tb-btn tb-btn-primary"
                disabled={isSyncing}
              >
                <IconCheck size={16} color="#FFFFFF" />
                <span>{isSyncing ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
              <button
                type="button"
                className="tb-btn tb-btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Batal
              </button>
            </div>
          </form>
        ) : (
          <div className="tb-profile-data-list">
            <div className="tb-data-row">
              <span className="tb-data-label">Fakultas</span>
              <strong className="tb-data-value">{profile.fakultas || "Teknik"}</strong>
            </div>
            <div className="tb-data-row">
              <span className="tb-data-label">Departemen</span>
              <strong className="tb-data-value">{profile.departemen || "Teknik Komputer"}</strong>
            </div>
            <div className="tb-data-row">
              <span className="tb-data-label">Nomor Kontak (WA)</span>
              <strong className="tb-data-value">{profile.kontak || "-"}</strong>
            </div>
            <div className="tb-data-row">
              <span className="tb-data-label">Status Sivitas</span>
              <strong className="tb-data-value text-green">{profile.role || "Mahasiswa Aktif"}</strong>
            </div>
            <div className="tb-data-row">
              <span className="tb-data-label">Kelompok Praktikum</span>
              <strong className="tb-data-value">Kelompok {profile.kelompok || "-"}</strong>
            </div>
            <div className="tb-data-row">
              <span className="tb-data-label">Barang Tersimpan</span>
              <strong className="tb-data-value">{bookmarks.length} barang</strong>
            </div>
          </div>
        )}
      </section>

      {/* 3. Informasi & Navigasi */}
      <section className="tb-form-card">
        <h2 className="tb-card-header-title">Informasi & Bantuan</h2>

        <div className="tb-profile-menu-links">
          <Link to="/tentang" className="tb-menu-link-item">
            <span>Tentang Aplikasi TemuBarang</span>
            <span className="tb-link-arrow">→</span>
          </Link>
          <Link to="/laporan-saya" className="tb-menu-link-item">
            <span>Kelola Laporan Saya</span>
            <span className="tb-link-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* Lightbox Zoom Modal Foto Profil */}
      {isZoomOpen && (
        <div className="tb-photo-zoom-modal" onClick={closeZoom} role="dialog" aria-modal="true">
          <div className="tb-zoom-modal-backdrop" />
          <div className="tb-zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="tb-zoom-modal-header">
              <div className="tb-zoom-modal-title-wrap">
                <span className="tb-zoom-modal-title">Foto Profil</span>
                <span className="tb-zoom-modal-sub">{profile.nama} ({profile.nim})</span>
              </div>
              <button
                type="button"
                className="tb-zoom-close-btn"
                onClick={closeZoom}
                aria-label="Tutup foto zoom"
                title="Tutup (Esc)"
              >
                <IconX size={18} color="currentColor" />
              </button>
            </div>

            {/* Stage Area Zoom Foto */}
            <div
              className="tb-zoom-photo-stage"
              onClick={toggleZoomScale}
              title="Klik gambar untuk perbesar / normal"
            >
              <img
                src={isEditing ? (draft.avatar || profile.avatar) : profile.avatar}
                alt={profile.nama}
                className="tb-zoom-img"
                style={{
                  transform: `scale(${zoomScale})`,
                  cursor: zoomScale > 1.2 ? "zoom-out" : "zoom-in",
                }}
              />
            </div>

            {/* Toolbar Pengatur Zoom */}
            <div className="tb-zoom-toolbar">
              <button
                type="button"
                className="tb-zoom-tool-btn"
                onClick={() => setZoomScale((s) => Math.max(1, +(s - 0.35).toFixed(2)))}
                disabled={zoomScale <= 1}
                title="Perkecil"
                aria-label="Perkecil"
              >
                <IconZoomOut size={16} color="currentColor" />
              </button>
              <button
                type="button"
                className="tb-zoom-scale-badge"
                onClick={() => setZoomScale(1)}
                title="Kembalikan ukuran 100%"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                className="tb-zoom-tool-btn"
                onClick={() => setZoomScale((s) => Math.min(2.5, +(s + 0.35).toFixed(2)))}
                disabled={zoomScale >= 2.5}
                title="Perbesar"
                aria-label="Perbesar"
              >
                <IconZoomIn size={16} color="currentColor" />
              </button>
            </div>

            {/* Aksi Bawah */}
            <div className="tb-zoom-modal-actions">
              <button
                type="button"
                className="tb-btn tb-btn-subtle"
                onClick={() => {
                  avatarInputRef.current?.click();
                }}
              >
                <IconCamera size={14} color="currentColor" />
                <span>Ganti Foto</span>
              </button>
              <button
                type="button"
                className="tb-btn tb-btn-primary"
                onClick={closeZoom}
              >
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
