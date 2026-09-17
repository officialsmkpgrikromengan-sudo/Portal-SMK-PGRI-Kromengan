import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  Menu, 
  X, 
  Phone, 
  Mail, 
  ChevronRight, 
  User, 
  LogOut, 
  ShieldCheck,
  ChevronDown,
  LogIn
} from 'lucide-react';
import { NavigationPage, SchoolInfo, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenLoginModal: (initialRole?: 'siswa' | 'guru' | 'bkk' | 'admin') => void;
  onOpenUserPortal: () => void;
  schoolInfo: SchoolInfo;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenLoginModal,
  onOpenUserPortal,
  schoolInfo
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, currentUserAccount, role, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { id: NavigationPage; label: string }[] = [
    { id: 'home', label: 'Beranda' },
    { id: 'profile', label: 'Profil' },
    { id: 'programs', label: 'Program Keahlian' },
    { id: 'career', label: 'BKK & Karir' },
    { id: 'news', label: 'Berita' },
    { id: 'events', label: 'Event' },
    { id: 'achievements', label: 'Prestasi' },
    { id: 'gallery', label: 'Galeri' },
    { id: 'contact', label: 'Kontak' }
  ];

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleBadge = () => {
    if (role === 'siswa') {
      return {
        label: 'Siswa',
        name: currentUserAccount?.displayName || 'Siswa',
        bg: 'bg-blue-600',
        icon: <GraduationCap className="w-3.5 h-3.5" />
      };
    } else if (role === 'guru') {
      return {
        label: 'Guru & Tendik',
        name: currentUserAccount?.displayName || 'Guru',
        bg: 'bg-emerald-600',
        icon: <BookOpen className="w-3.5 h-3.5" />
      };
    } else if (role === 'bkk') {
      return {
        label: 'BKK',
        name: currentUserAccount?.displayName || 'BKK',
        bg: 'bg-amber-600',
        icon: <Briefcase className="w-3.5 h-3.5" />
      };
    } else if (role === 'admin' || role === 'kepala_sekolah' || role === 'tu') {
      return {
        label: 'Admin',
        name: currentUserAccount?.displayName || 'Admin',
        bg: 'bg-slate-900',
        icon: <ShieldCheck className="w-3.5 h-3.5" />
      };
    }
    return null;
  };

  const roleInfo = getRoleBadge();

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full transition-all duration-200">
      {/* 1. Sleek, Non-Intrusive Top Information Bar */}
      <div id="topbar" className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-8 hidden md:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
              <Phone className="w-3 h-3 text-blue-400" />
              <span>{schoolInfo.phone}</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
              <Mail className="w-3 h-3 text-blue-400" />
              <span>{schoolInfo.email}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>
              NPSN: <strong className="text-slate-200 font-semibold">{schoolInfo.npsn}</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span>
              Akreditasi: <strong className="text-emerald-400 font-semibold">{schoolInfo.accreditation}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar with Single Clean Portal Login Button */}
      <nav 
        id="navbar" 
        className={`w-full bg-white/95 backdrop-blur-md transition-all duration-200 border-b ${
          isScrolled ? 'shadow-xs border-slate-200/90 py-2.5' : 'border-slate-200/80 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & School Name */}
          <button
            id="brand-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group shrink-0 cursor-pointer"
          >
            {schoolInfo.logoUrl ? (
              <img
                src={schoolInfo.logoUrl}
                alt={schoolInfo.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain bg-white border border-slate-200/90 shadow-xs group-hover:scale-105 transition-transform shrink-0 p-0.5"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-lg shadow-xs group-hover:bg-blue-800 transition-colors shrink-0">
                <img src="/favicon.svg" alt="Emblem" className="w-6 h-6 object-contain" />
              </div>
            )}
            <div className="flex flex-col leading-tight">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-tight group-hover:text-blue-700 transition-colors">
                {schoolInfo.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase truncate max-w-[200px] sm:max-w-xs">
                {schoolInfo.motto || 'UNGGUL • BERAKHLAK • KOMPETEN'}
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-6 text-[13px] font-semibold text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`py-1 text-[13px] font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Mid-screen condensed nav links (lg to xl) */}
          <div className="hidden lg:flex xl:hidden items-center gap-4 text-xs font-semibold text-slate-600">
            {navLinks.slice(0, 6).map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-mid-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`py-1 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick('contact')}
              className={`py-1 transition-colors cursor-pointer ${
                currentPage === 'contact' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lainnya
            </button>
          </div>

          {/* Single Unified Portal Login Button / User Session Info */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {!user ? (
              <button
                id="btn-nav-login-portal"
                onClick={() => onOpenLoginModal('siswa')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Portal</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-user-portal"
                  onClick={onOpenUserPortal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  {roleInfo?.icon}
                  <span>Portal {roleInfo?.label}</span>
                </button>

                <button
                  id="btn-nav-logout"
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                  title="Keluar Akun"
                  aria-label="Keluar Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {!user && (
              <button
                onClick={() => onOpenLoginModal('siswa')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
              >
                <LogIn className="w-3 h-3" />
                <span>Portal</span>
              </button>
            )}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div 
            id="mobile-drawer"
            className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150"
          >
            {/* Single Unified Login Button in Mobile */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-3">
              {!user ? (
                <button
                  id="btn-mobile-login-portal"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLoginModal('siswa');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Portal (Siswa, Guru, BKK)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenUserPortal();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                  >
                    {roleInfo?.icon}
                    <span>Buka Portal {roleInfo?.label}</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 text-rose-600 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-0.5">
              {navLinks.map((link) => {
                const isActive = currentPage === link.id;
                return (
                  <button
                    key={link.id}
                    id={`mobile-nav-${link.id}`}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
