import React from 'react';
import { 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink,
  Instagram,
  Youtube,
  Facebook,
  Share2,
  ShieldCheck,
  Award
} from 'lucide-react';
import { SchoolInfo, NavigationPage } from '../../types';

interface FooterProps {
  schoolInfo: SchoolInfo;
  onNavigate: (page: NavigationPage) => void;
  onOpenAdmin: () => void;
  onOpenLoginModal?: (role?: 'siswa' | 'guru' | 'bkk' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  schoolInfo, 
  onNavigate, 
  onOpenAdmin,
  onOpenLoginModal 
}) => {
  return (
    <footer id="main-footer" className="bg-slate-900 text-white border-t border-slate-800">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Col 1: Identity & Speech quote (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-900 border border-blue-700 text-white flex items-center justify-center font-black text-xl shrink-0">
                S
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight leading-tight">
                  {schoolInfo.name}
                </h3>
                <span className="text-[10px] text-blue-300 uppercase tracking-widest font-medium">
                  {schoolInfo.motto || 'UNGGUL • BERAKHLAK • KOMPETEN'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {schoolInfo.shortBio || schoolInfo.tagline}
            </p>

            <div className="pt-2 flex items-center gap-2">
              {schoolInfo.socials.instagram && (
                <a
                  id="footer-social-ig"
                  href={schoolInfo.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center text-xs font-bold transition-all"
                  aria-label="Instagram"
                >
                  IG
                </a>
              )}
              {schoolInfo.socials.youtube && (
                <a
                  id="footer-social-yt"
                  href={schoolInfo.socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center text-xs font-bold transition-all"
                  aria-label="YouTube"
                >
                  YT
                </a>
              )}
              {schoolInfo.socials.facebook && (
                <a
                  id="footer-social-fb"
                  href={schoolInfo.socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center text-xs font-bold transition-all"
                  aria-label="Facebook"
                >
                  FB
                </a>
              )}
              {schoolInfo.socials.whatsapp && (
                <a
                  id="footer-social-wa"
                  href={schoolInfo.socials.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center text-xs font-bold transition-all"
                  aria-label="WhatsApp"
                >
                  WA
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('profile')}
                  className="hover:text-white transition-colors"
                >
                  Profil & Visi Misi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('programs')}
                  className="hover:text-white transition-colors"
                >
                  Program Keahlian
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('career')}
                  className="hover:text-white transition-colors text-blue-400 font-semibold"
                >
                  BKK, PKL & Karir
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="hover:text-white transition-colors"
                >
                  Berita & Pengumuman
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-white transition-colors"
                >
                  Event & Agenda
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('achievements')}
                  className="hover:text-white transition-colors"
                >
                  Prestasi Siswa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors"
                >
                  Galeri Foto
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Programs (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Program Jurusan
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {schoolInfo.programs?.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onNavigate('programs')}
                    className="hover:text-white text-left transition-colors font-medium"
                  >
                    {p.code} - {p.name.split('(')[0]}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Location (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sekretariat & Kontak
            </h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {schoolInfo.address}, {schoolInfo.city}, {schoolInfo.province}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{schoolInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{schoolInfo.email}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-footer-contact"
                onClick={() => onNavigate('contact')}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all text-center border border-slate-700"
              >
                Formulir Kontak & Lokasi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="uppercase tracking-widest text-[10px]">
            © {new Date().getFullYear()} {schoolInfo.name} • NPSN {schoolInfo.npsn}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onOpenLoginModal && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenLoginModal('siswa')}
                  className="text-slate-400 hover:text-white font-medium transition-colors"
                >
                  Akses Masuk Portal
                </button>
                <span className="text-slate-700">•</span>
              </>
            )}
            <button
              onClick={onOpenAdmin}
              className="text-slate-500 hover:text-slate-400 font-medium transition-colors text-[10px]"
            >
              CMS Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
