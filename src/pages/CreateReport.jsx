import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CATEGORIES } from "../hooks/useReports";
import { useProfile } from "../contexts/ProfileContext";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconUpload,
  IconCamera,
  IconMapPin,
  IconPhone,
  IconCheck,
  IconTrash,
  IconChevronDown,
} from "../components/Icons";

const DEFAULT_FORM = {
  reportType: "found",
  itemName: "",
  category: "",
  description: "",
  location: "",
  incidentDate: new Date().toISOString().slice(0, 10),
  incidentTime: new Date().toTimeString().slice(0, 5),
  image: "",
  reporterName: "Alul Fahmi Akbar",
  reporterNim: "21120124140114",
  reporterContact: "812-9876-5432",
  hideContact: true,
  urgent: false,
};

function toDataUrl(file, max = 600) {
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
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };
      img.onerror = reject;
      img.src = readerEvent.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validate(f) {
  const errors = {};
  if (!f.reportType) errors.reportType = "Pilih jenis laporan.";
  if (!f.itemName.trim()) errors.itemName = "Nama barang wajib diisi.";
  if (!f.category) errors.category = "Pilih kategori barang.";
  if (!f.description.trim()) errors.description = "Deskripsi spesifik wajib diisi.";
  if (!f.location.trim()) errors.location = "Lokasi kampus wajib diisi.";
  if (!f.incidentDate) errors.incidentDate = "Tanggal kejadian wajib diisi.";
  if (!f.incidentTime) errors.incidentTime = "Jam perkiraan wajib diisi.";
  if (!f.reporterContact.trim()) errors.reporterContact = "Nomor kontak wajib diisi.";
  return errors;
}

export default function CreateReport({ create, initial, onSave }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { profile } = useProfile();

  const [formData, setFormData] = useState(() => {
    if (initial) return initial;
    return {
      ...DEFAULT_FORM,
      reporterName: profile?.nama || DEFAULT_FORM.reporterName,
      reporterNim: profile?.nim || DEFAULT_FORM.reporterNim,
      reporterContact: profile?.kontak ? profile.kontak.replace("+62 ", "") : DEFAULT_FORM.reporterContact,
    };
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Ukuran file melebihi batas 5 MB." }));
      return;
    }

    try {
      const dataUrl = await toDataUrl(file);
      updateField("image", dataUrl);
    } catch {
      setErrors((prev) => ({ ...prev, image: "Gagal memproses gambar. Coba file lain." }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = document.getElementById(firstKey);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    const cleaned = {
      ...formData,
      itemName: formData.itemName.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      reporterContact: formData.reporterContact.startsWith("+62")
        ? formData.reporterContact.trim()
        : `+62 ${formData.reporterContact.replace(/^0/, "").trim()}`,
    };

    try {
      if (onSave) {
        await onSave(cleaned);
      } else {
        await create(cleaned);
      }
      navigate("/");
    } catch (err) {
      console.error("Gagal menyimpan laporan:", err);
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(initial);

  return (
    <div className="tb-page tb-create-page">
      {/* Back button row */}
      <div className="tb-back-nav-bar">
        <button
          type="button"
          className="tb-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <IconArrowLeft size={18} color="var(--text-main)" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Form Header & Welcome Note */}
      <section className="tb-form-header">
        <div className="tb-official-badge">
          <IconShieldCheck size={13} color="var(--primary)" />
          <span>Layanan Kampus Resmi</span>
        </div>
        <h1 className="tb-form-title">
          {isEditing ? "Edit Laporan" : "Buat Laporan Baru"}
        </h1>
        <p className="tb-form-subtitle">
          Isi data dengan lengkap dan teliti untuk memudahkan identifikasi serta verifikasi barang oleh sivitas kampus.
        </p>
      </section>

      <form className="tb-form-container" onSubmit={handleSubmit} noValidate>
        {/* 1. Segmented Card Selector Jenis Laporan */}
        <section className="tb-form-block">
          <div className="tb-field-label-row">
            <label className="tb-field-label">Jenis Laporan *</label>
            <span className="tb-field-hint-text">Pilih salah satu</span>
          </div>

          <div className="tb-report-type-cards-grid">
            {/* Card 1: Hilang */}
            <div
              className={`tb-type-choice-card ${formData.reportType === "lost" ? "active is-lost" : ""}`}
              onClick={() => updateField("reportType", "lost")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && updateField("reportType", "lost")}
            >
              <div className="tb-choice-top">
                <div className="tb-choice-icon-wrap lost">
                  <IconMapPin size={18} color={formData.reportType === "lost" ? "#FFFFFF" : "var(--text-muted)"} />
                </div>
                <span className="tb-choice-tag lost">Hilang</span>
              </div>
              <div className="tb-choice-body">
                <h3 className="tb-choice-title">Barang Hilang</h3>
                <p className="tb-choice-desc">Saya kehilangan barang milik pribadi</p>
              </div>
            </div>

            {/* Card 2: Ditemukan */}
            <div
              className={`tb-type-choice-card ${formData.reportType === "found" ? "active is-found" : ""}`}
              onClick={() => updateField("reportType", "found")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && updateField("reportType", "found")}
            >
              <div className="tb-choice-top">
                <div className="tb-choice-icon-wrap found">
                  <IconCheck size={18} color={formData.reportType === "found" ? "#FFFFFF" : "var(--text-muted)"} />
                </div>
                <span className="tb-choice-tag found">Ditemukan</span>
              </div>
              <div className="tb-choice-body">
                <h3 className="tb-choice-title">Barang Ditemukan</h3>
                <p className="tb-choice-desc">Saya menemukan barang orang lain</p>
              </div>
            </div>
          </div>
          {errors.reportType && <p className="tb-field-error">{errors.reportType}</p>}
        </section>

        {/* 2. Zona Upload Foto */}
        <section className="tb-form-block">
          <div className="tb-field-label-row">
            <label className="tb-field-label">Foto Barang Bukti</label>
            <span className="tb-field-hint-text">Maks. 5 MB</span>
          </div>

          <div className="tb-upload-box">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageFile}
            />

            {formData.image ? (
              <div className="tb-upload-preview-area">
                <img src={formData.image} alt="Pratinjau barang" className="tb-upload-preview-img" />
                <div className="tb-preview-overlay-actions">
                  <button
                    type="button"
                    className="tb-btn tb-btn-sm tb-btn-subtle"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Ganti Foto
                  </button>
                  <button
                    type="button"
                    className="tb-btn tb-btn-sm tb-btn-danger"
                    onClick={() => updateField("image", "")}
                  >
                    <IconTrash size={14} color="#FFFFFF" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="tb-upload-placeholder">
                <div className="tb-upload-icon-circle">
                  <IconUpload size={24} color="var(--primary)" />
                </div>
                <h3 className="tb-upload-title">Unggah Foto Barang</h3>
                <p className="tb-upload-sub">
                  Format JPG, PNG, atau WEBP. Foto yang jelas mempermudah proses pencarian dan klaim.
                </p>
                <button
                  type="button"
                  className="tb-upload-action-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconCamera size={15} color="var(--primary)" />
                  <span>Pilih dari Galeri / Kamera</span>
                </button>
              </div>
            )}
          </div>
          <p className="tb-upload-tips">
            💡 Tips: Sertakan sudut pandang jelas tanpa pantulan cahaya berlebih.
          </p>
          {errors.image && <p className="tb-field-error">{errors.image}</p>}
        </section>

        {/* 3. Detail Barang Card */}
        <section className="tb-form-card">
          <div className="tb-card-header-bar">
            <IconCheck size={18} color="var(--primary)" />
            <h2 className="tb-card-header-title">Detail Barang</h2>
          </div>

          {/* Nama Barang */}
          <div className="tb-form-field">
            <label htmlFor="itemName" className="tb-field-label">Nama Barang *</label>
            <input
              id="itemName"
              type="text"
              className={`tb-input ${errors.itemName ? "is-invalid" : ""}`}
              placeholder="Contoh: Dompet Kulit Hitam Eiger"
              value={formData.itemName}
              onChange={(e) => updateField("itemName", e.target.value)}
            />
            <span className="tb-input-help">Tuliskan nama barang beserta merek atau jenisnya secara ringkas.</span>
            {errors.itemName && <p className="tb-field-error">{errors.itemName}</p>}
          </div>

          {/* Kategori Dropdown */}
          <div className="tb-form-field">
            <label htmlFor="category" className="tb-field-label">Kategori Barang *</label>
            <div className="tb-select-wrapper">
              <select
                id="category"
                className={`tb-select ${errors.category ? "is-invalid" : ""}`}
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                <option value="">Pilih Kategori Barang</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="tb-select-chevron">
                <IconChevronDown size={14} color="var(--text-muted)" />
              </div>
            </div>
            {errors.category && <p className="tb-field-error">{errors.category}</p>}
          </div>

          {/* Deskripsi Spesifik */}
          <div className="tb-form-field">
            <div className="tb-field-label-row">
              <label htmlFor="description" className="tb-field-label">Deskripsi Spesifik *</label>
              <span className="tb-field-hint-text">Rinci</span>
            </div>
            <textarea
              id="description"
              rows={3}
              className={`tb-textarea ${errors.description ? "is-invalid" : ""}`}
              placeholder="Ciri khusus, warna, stiker tempelan, isi di dalam, goresan, kondisi terakhir..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
            <span className="tb-input-help">Hindari menulis detail rahasia seperti nomor PIN atau kombinasi sandi kunci.</span>
            {errors.description && <p className="tb-field-error">{errors.description}</p>}
          </div>

          {/* Lokasi Kampus */}
          <div className="tb-form-field">
            <label htmlFor="location" className="tb-field-label">Lokasi Kampus *</label>
            <div className="tb-input-with-icon">
              <span className="tb-input-lead-icon">
                <IconMapPin size={16} color="var(--text-muted)" />
              </span>
              <input
                id="location"
                type="text"
                className={`tb-input with-lead-icon ${errors.location ? "is-invalid" : ""}`}
                placeholder="Contoh: Gedung B Lantai 2 R.204"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <span className="tb-input-help">Sebutkan nama gedung, lantai, atau ruangan spesifik.</span>
            {errors.location && <p className="tb-field-error">{errors.location}</p>}
          </div>

          {/* Date & Time Grid */}
          <div className="tb-datetime-grid">
            <div className="tb-form-field">
              <label htmlFor="incidentDate" className="tb-field-label">Tanggal Kejadian *</label>
              <input
                id="incidentDate"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                className={`tb-input ${errors.incidentDate ? "is-invalid" : ""}`}
                value={formData.incidentDate}
                onChange={(e) => updateField("incidentDate", e.target.value)}
              />
              {errors.incidentDate && <p className="tb-field-error">{errors.incidentDate}</p>}
            </div>

            <div className="tb-form-field">
              <label htmlFor="incidentTime" className="tb-field-label">Perkiraan Jam *</label>
              <input
                id="incidentTime"
                type="time"
                className={`tb-input ${errors.incidentTime ? "is-invalid" : ""}`}
                value={formData.incidentTime}
                onChange={(e) => updateField("incidentTime", e.target.value)}
              />
              {errors.incidentTime && <p className="tb-field-error">{errors.incidentTime}</p>}
            </div>
          </div>
        </section>

        {/* 4. Informasi Kontak & Privasi */}
        <section className="tb-form-card">
          <div className="tb-card-header-bar">
            <IconPhone size={18} color="var(--primary)" />
            <h2 className="tb-card-header-title">Informasi Kontak & Privasi</h2>
          </div>

          {/* Identitas Pelapor (SSO Auto-Filled) */}
          <div className="tb-form-field">
            <label className="tb-field-label">Identitas Pelapor</label>
            <div className="tb-sso-badge-field">
              <span>{formData.reporterName} - {formData.reporterNim}</span>
            </div>
            <span className="tb-input-help">Otomatis terhubung dengan Akun SSO Mahasiswa/Staff.</span>
          </div>

          {/* Nomor WhatsApp */}
          <div className="tb-form-field">
            <label htmlFor="reporterContact" className="tb-field-label">Nomor WhatsApp / Kontak Aktif *</label>
            <div className="tb-input-with-prefix">
              <span className="tb-input-prefix">+62</span>
              <input
                id="reporterContact"
                type="tel"
                className={`tb-input with-prefix ${errors.reporterContact ? "is-invalid" : ""}`}
                placeholder="812-9876-5432"
                value={formData.reporterContact.replace(/^\+62\s*/, "")}
                onChange={(e) => updateField("reporterContact", e.target.value)}
              />
            </div>
            {errors.reporterContact && <p className="tb-field-error">{errors.reporterContact}</p>}
          </div>

          {/* Toggle Privasi Kontak */}
          <div className="tb-privacy-toggle-card">
            <label className="tb-switch" htmlFor="privacyToggle">
              <input
                id="privacyToggle"
                type="checkbox"
                checked={formData.hideContact}
                onChange={(e) => updateField("hideContact", e.target.checked)}
              />
              <span className="tb-slider" />
            </label>
            <div className="tb-privacy-text-block">
              <h4 className="tb-privacy-heading">Sembunyikan nomor kontak dari publik</h4>
              <p className="tb-privacy-sub">
                Nomor Anda hanya dapat dilihat oleh tim keamanan kampus & staf admin untuk verifikasi klaim langsung.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Helper & Action Buttons */}
        <section className="tb-form-footer-actions">
          <div className="tb-verify-info-row">
            <IconShieldCheck size={16} color="var(--found-color)" />
            <span>Data laporan diverifikasi oleh sistem TemuBarang Kampus.</span>
          </div>

          <button
            type="submit"
            className="tb-btn tb-btn-primary tb-btn-submit"
            disabled={isSubmitting}
          >
            <IconCheck size={18} color="#FFFFFF" />
            <span>{isEditing ? "Simpan Perubahan" : "Kirim Laporan"}</span>
          </button>

          <button
            type="button"
            className="tb-btn tb-btn-cancel"
            onClick={() => navigate(-1)}
          >
            Batal & Kembali
          </button>
        </section>
      </form>
    </div>
  );
}
