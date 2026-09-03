import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Instagram, 
  Youtube, 
  Facebook, 
  Share2, 
  CheckCircle2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { SchoolInfo } from '../../types';
import { sendMessage } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';

interface ContactViewProps {
  schoolInfo: SchoolInfo;
}

export const ContactView: React.FC<ContactViewProps> = ({ schoolInfo }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      error('Mohon lengkapi nama, email, dan pesan Anda.');
      return;
    }

    try {
      setIsSubmitting(true);
      await sendMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        subject: formData.subject || 'Pesan dari Pengunjung Website',
        message: formData.message
      });

      success('Pesan Anda berhasil dikirim ke pihak sekolah. Terima kasih!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      error('Terjadi kendala saat mengirim pesan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact-view" className="space-y-10 sm:space-y-12 py-6 sm:py-8 pb-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl text-center space-y-3">
          <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-blue-200 bg-blue-800 px-3 py-1 rounded-full border border-blue-700">
            Hubungi & Lokasi
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Kontak & Sekretariat Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Kami siap melayani informasi pendaftaran peserta didik baru, kemitraan industri, pengaduan layanan, dan kunjungan kampus.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Address */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Alamat Kampus</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {schoolInfo.address}, {schoolInfo.city}, {schoolInfo.province} {schoolInfo.postalCode}
            </p>
          </div>

          {/* Card 2: Phone */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Telepon & WhatsApp</h3>
            <p className="text-xs text-slate-600">
              Telp: {schoolInfo.phone}
            </p>
            {schoolInfo.socials.whatsapp && (
              <a
                href={schoolInfo.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                <span>Chat WhatsApp Admin</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Card 3: Email */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Email Resmi</h3>
            <p className="text-xs text-slate-600">
              {schoolInfo.email}
            </p>
            <p className="text-[11px] text-slate-400">Respon dalam 1x24 jam kerja</p>
          </div>

          {/* Card 4: Hours */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Jam Layanan</h3>
            <p className="text-xs text-slate-600">
              {schoolInfo.workingHours}
            </p>
            <p className="text-[11px] text-slate-400">Sabtu & Minggu: Libur</p>
          </div>
        </div>

        {/* 2 Columns: Message Form & Interactive Google Maps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Message Form (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>Formulir Pesan Online</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Kirim Pesan / Pertanyaan ke Sekolah
              </h2>
              <p className="text-xs text-slate-500">
                Isi formulir di bawah ini, tim administrasi kami akan merespons melalui email atau WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    placeholder="0812xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Subjek Keperluan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Info Pendaftaran PPDB"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Isi Pesan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan pertanyaan atau pesan Anda secara jelas di sini..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Mengirim Pesan...' : 'Kirimkan Pesan Sekarang'}</span>
              </button>
            </form>
          </div>

          {/* Right: Google Maps & Social Media Links (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Google Maps Container */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-bold text-slate-900">Lokasi Google Maps</span>
                </div>
                <span className="text-[11px] text-slate-500">Navigasi Langsung</span>
              </div>

              <div className="rounded-2xl overflow-hidden aspect-16/10 border border-slate-200 shadow-inner bg-slate-100">
                <iframe
                  src={schoolInfo.mapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Sekolah Google Maps"
                ></iframe>
              </div>
            </div>

            {/* Social Media Links Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Media Sosial & Saluran Komunikasi Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Ikuti akun resmi kami untuk mendapatkan update kegiatan harian dan konten kreatif siswa.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {schoolInfo.socials.instagram && (
                  <a
                    href={schoolInfo.socials.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 text-slate-700 hover:text-pink-600 flex flex-col items-center gap-1.5 transition-all text-center"
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Instagram</span>
                  </a>
                )}

                {schoolInfo.socials.youtube && (
                  <a
                    href={schoolInfo.socials.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-600 flex flex-col items-center gap-1.5 transition-all text-center"
                  >
                    <Youtube className="w-5 h-5" />
                    <span className="text-[11px] font-bold">YouTube</span>
                  </a>
                )}

                {schoolInfo.socials.facebook && (
                  <a
                    href={schoolInfo.socials.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-600 flex flex-col items-center gap-1.5 transition-all text-center"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Facebook</span>
                  </a>
                )}

                {schoolInfo.socials.whatsapp && (
                  <a
                    href={schoolInfo.socials.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-600 flex flex-col items-center gap-1.5 transition-all text-center"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-[11px] font-bold">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
