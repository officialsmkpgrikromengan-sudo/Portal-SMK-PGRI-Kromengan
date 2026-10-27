import React, { useState } from 'react';
import { 
  Save, 
  School, 
  UserCheck, 
  MapPin, 
  Phone, 
  Share2, 
  Plus, 
  Trash2, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { SchoolInfo } from '../../types';
import { updateSchoolInfo } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { ImageUploadInput } from '../common/ImageUploadInput';

interface AdminSchoolInfoProps {
  schoolInfo: SchoolInfo;
  onRefresh: () => void;
}

export const AdminSchoolInfo: React.FC<AdminSchoolInfoProps> = ({
  schoolInfo,
  onRefresh
}) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState<SchoolInfo>(schoolInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'principal' | 'vision' | 'contact' | 'socials'>('general');

  // Mission helper
  const handleAddMission = () => {
    setFormData({
      ...formData,
      missions: [...formData.missions, '']
    });
  };

  const handleUpdateMission = (index: number, val: string) => {
    const updated = [...formData.missions];
    updated[index] = val;
    setFormData({ ...formData, missions: updated });
  };

  const handleRemoveMission = (index: number) => {
    const updated = formData.missions.filter((_, i) => i !== index);
    setFormData({ ...formData, missions: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateSchoolInfo(formData);
      success('Informasi profil sekolah berhasil diperbarui!');
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal memperbarui informasi sekolah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="admin-school-info-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pengaturan Profil & Informasi Sekolah</h2>
          <p className="text-xs text-slate-500">Perbarui identitas resmi, sambutan kepala sekolah, visi misi, kontak, dan link media sosial.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'general' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Profil Umum & Akreditasi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('principal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'principal' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Sambutan Kepala Sekolah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vision')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'vision' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sejarah, Visi & Misi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'contact' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Kontak & Lokasi Maps</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('socials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'socials' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Media Sosial</span>
        </button>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Logo Sekolah & Favicon Configuration Section */}
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Logo Resmi Sekolah & Favicon Browser</span>
                  </h4>
                  <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                    Logo yang Anda atur atau unggah di sini akan langsung diterapkan secara instan sebagai <strong>Favicon (ikon tab browser)</strong>, logo bilah navigasi (Navbar), header, dan footer website.
                  </p>
                </div>

                {/* Live Favicon Preview Pill */}
                <div className="hidden sm:flex flex-col items-center bg-white px-3.5 py-2 rounded-xl border border-blue-200 shadow-xs shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Preview Favicon Tab</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Favicon Preview" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-blue-900 text-white text-[9px] font-bold flex items-center justify-center">S</div>
                    )}
                    <span className="text-[11px] font-semibold text-slate-700 max-w-[110px] truncate">{formData.name}</span>
                  </div>
                </div>
              </div>

              <ImageUploadInput
                label="Unggah Berkas Logo / Favicon Baru (PNG, JPG, SVG, WebP)"
                value={formData.logoUrl || ''}
                onChange={(val) => setFormData({ ...formData, logoUrl: val })}
                placeholder="https://... atau unggah berkas logo sekolah"
              />
            </div>

            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Identitas & Akreditasi Lembaga</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Nama Resmi Sekolah</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Slogan / Tagline Sekolah</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Motto / Slogan Singkat (Navbar & Footer)</label>
              <input
                type="text"
                value={formData.motto || ''}
                placeholder="Contoh: UNGGUL • BERAKHLAK • KOMPETEN"
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-blue-900 bg-blue-50/50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400">
                Teks ini ditampilkan di bawah logo sekolah pada bilah navigasi (Navbar), header, dan footer website.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">NPSN</label>
                <input
                  type="text"
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Status Akreditasi</label>
                <input
                  type="text"
                  value={formData.accreditation}
                  onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Tahun Berdiri</label>
                <input
                  type="text"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Deskripsi Singkat Sekolah (Hero/Footer)</label>
              <textarea
                rows={3}
                value={formData.shortBio}
                onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB 2: PRINCIPAL */}
        {activeTab === 'principal' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Kepala Sekolah & Sambutan Resmi</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Jabatan Resmi</label>
                <input
                  type="text"
                  value={formData.principalTitle}
                  onChange={(e) => setFormData({ ...formData, principalTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <ImageUploadInput
              label="Foto Resmi Kepala Sekolah"
              value={formData.principalPhotoUrl}
              onChange={(url) => setFormData({ ...formData, principalPhotoUrl: url })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Teks Sambutan Kepala Sekolah</label>
              <textarea
                rows={8}
                value={formData.principalSpeech}
                onChange={(e) => setFormData({ ...formData, principalSpeech: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-normal leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 3: VISION & MISSIONS */}
        {activeTab === 'vision' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Sejarah & Rekam Jejak Singkat</h3>
              <textarea
                rows={4}
                value={formData.history}
                onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Visi Sekolah</h3>
              <textarea
                rows={3}
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-slate-900">Misi Sekolah</h3>
                <button
                  type="button"
                  onClick={handleAddMission}
                  className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Poin Misi</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.missions.map((mission, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-bold text-slate-400 shrink-0 text-center">{idx + 1}.</span>
                    <input
                      type="text"
                      value={mission}
                      onChange={(e) => handleUpdateMission(idx, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMission(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT & MAPS */}
        {activeTab === 'contact' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Alamat & Sekretariat</h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Alamat Jalan Lengkap</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Provinsi</label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Kode Pos</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Nomor Telepon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Email Resmi</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Jam Layanan Kantor</label>
                <input
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Google Maps Embed URL</label>
              <input
                type="url"
                value={formData.mapsEmbedUrl}
                onChange={(e) => setFormData({ ...formData, mapsEmbedUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* TAB 5: SOCIALS */}
        {activeTab === 'socials' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Tautan Media Sosial & Saluran Komunikasi</h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Instagram URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={formData.socials.instagram}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, instagram: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">YouTube Channel URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@..."
                  value={formData.socials.youtube}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, youtube: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Facebook Page URL</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={formData.socials.facebook}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, facebook: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">WhatsApp Link</label>
                <input
                  type="url"
                  placeholder="https://wa.me/62..."
                  value={formData.socials.whatsapp}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, whatsapp: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit bottom bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
