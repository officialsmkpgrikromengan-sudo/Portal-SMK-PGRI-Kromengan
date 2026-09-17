import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  School, 
  Newspaper, 
  CalendarDays, 
  Trophy, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Users,
  UserCheck,
  Building,
  BookOpen,
  ArrowLeft,
  Calendar,
  Clock,
  ClipboardCheck,
  Award
} from 'lucide-react';
import { AdminSection, SchoolInfo } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminLayoutProps {
  currentSection: AdminSection;
  onNavigateSection: (section: AdminSection) => void;
  onBackToWebsite: () => void;
  schoolInfo: SchoolInfo;
  unreadMessagesCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onNavigateSection,
  onBackToWebsite,
  schoolInfo,
  unreadMessagesCount = 0,
  children
}) => {
  const { user, logout } = useAuth();
  const { success, error } = useToast();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const mainMenuItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'management', label: 'Pusat Manajemen & KPI', icon: <Building className="w-4 h-4" /> },
    { id: 'reports', label: 'Sistem Laporan & Cetak', icon: <ClipboardCheck className="w-4 h-4" /> }
  ];

  const academicMenuItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'academic_years', label: 'Tahun Ajaran', icon: <Calendar className="w-4 h-4" /> },
    { id: 'schedules', label: 'Jadwal Pelajaran', icon: <Clock className="w-4 h-4" /> },
    { id: 'attendance', label: 'Absensi Siswa', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'grades', label: 'Nilai Siswa', icon: <Award className="w-4 h-4" /> }
  ];

  const pklMenuItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'pkl', label: 'Modul PKL (Internship)', icon: <BookOpen className="w-4 h-4" /> }
  ];

  const bkkMenuItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'bkk', label: 'Bursa Kerja Khusus (BKK)', icon: <Building className="w-4 h-4" /> }
  ];

  const alumniMenuItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'alumni', label: 'Alumni & Tracer Study', icon: <GraduationCap className="w-4 h-4" /> }
  ];

  const masterMenuItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'students', label: 'Data Siswa', icon: <Users className="w-4 h-4" /> },
    { id: 'teachers', label: 'Data Guru', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'classes', label: 'Data Kelas', icon: <Building className="w-4 h-4" /> },
    { id: 'majors', label: 'Program Keahlian', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'subjects', label: 'Mata Pelajaran', icon: <BookOpen className="w-4 h-4" /> }
  ];

  const contentMenuItems: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'school_info', label: 'Informasi Sekolah', icon: <School className="w-4 h-4" /> },
    { id: 'news', label: 'Kelola Berita', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'events', label: 'Kelola Event', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'achievements', label: 'Kelola Prestasi', icon: <Trophy className="w-4 h-4" /> },
    { id: 'gallery', label: 'Kelola Galeri', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'messages', label: 'Pesan Masuk', icon: <MessageSquare className="w-4 h-4" />, badge: unreadMessagesCount }
  ];

  const systemMenuItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'users', label: 'Pengguna & Hak Akses', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'audit_logs', label: 'Log Audit Keamanan', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'backup_doc', label: 'Cadangan & Dokumen', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'settings', label: 'Pengaturan Admin', icon: <Settings className="w-4 h-4" /> }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      success('Anda telah keluar dari akun Admin.');
      onBackToWebsite();
    } catch (err) {
      error('Gagal keluar.');
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard': return 'Dashboard Administrator';
      case 'management': return 'Pusat Manajemen & Analitik Sekolah';
      case 'reports': return 'Sistem Laporan & Rekapitulasi Resmi';
      case 'users': return 'Manajemen Akun Pengguna & Hak Akses (RBAC)';
      case 'audit_logs': return 'Log Aktivitas & Audit Keamanan';
      case 'backup_doc': return 'Cadangan Basis Data & Dokumentasi Sistem';
      case 'academic_years': return 'Pengelolaan Tahun Ajaran & Semester';
      case 'schedules': return 'Jadwal Pelajaran Sekolah';
      case 'attendance': return 'Absensi & Presensi Siswa';
      case 'grades': return 'Manajemen Nilai & Rapor Siswa';
      case 'pkl':
      case 'pkl_dashboard':
      case 'pkl_companies':
      case 'pkl_placements':
      case 'pkl_students':
      case 'pkl_teachers':
      case 'pkl_journals':
      case 'pkl_monitoring':
      case 'pkl_grades':
        return 'Modul Praktik Kerja Lapangan (PKL)';
      case 'bkk':
      case 'bkk_dashboard':
      case 'bkk_jobs':
      case 'bkk_recruitment':
      case 'bkk_companies':
      case 'bkk_recap':
        return 'Bursa Kerja Khusus (BKK)';
      case 'alumni':
      case 'alumni_list':
      case 'alumni_tracer':
      case 'alumni_stats':
        return 'Modul Alumni & Tracer Study';
      case 'students': return 'Data Master Siswa';
      case 'teachers': return 'Data Master Guru';
      case 'classes': return 'Data Master Rombongan Belajar (Kelas)';
      case 'majors': return 'Data Master Program Keahlian';
      case 'subjects': return 'Data Master Mata Pelajaran';
      case 'school_info': return 'Pengaturan Profil & Informasi Sekolah';
      case 'news': return 'Manajemen Berita & Pengumuman';
      case 'events': return 'Manajemen Agenda & Event Sekolah';
      case 'achievements': return 'Manajemen Prestasi Sekolah & Siswa';
      case 'gallery': return 'Manajemen Galeri Dokumentasi Kegiatan';
      case 'messages': return 'Kotak Masuk Pesan Pengunjung';
      case 'settings': return 'Pengaturan Admin & Sistem';
      default: return 'Admin CMS';
    }
  };

  const renderNavGroup = (title: string, items: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[]) => (
    <div className="space-y-1">
      {title && (
        <div className="px-3.5 pt-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      {items.map((item) => {
        const isActive = currentSection === item.id || currentSection.startsWith(`${item.id}_`);
        return (
          <button
            key={item.id}
            id={`admin-nav-${item.id}`}
            onClick={() => {
              onNavigateSection(item.id);
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div id="admin-layout" className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800 h-screen sticky top-0">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          {schoolInfo.logoUrl ? (
            <img
              src={schoolInfo.logoUrl}
              alt="Logo"
              className="w-9 h-9 rounded-xl object-contain bg-white border border-slate-700 p-0.5 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white tracking-tight truncate">
              {schoolInfo.name}
            </h2>
            <span className="text-[9px] text-blue-300/90 font-semibold tracking-wider uppercase truncate block">
              {schoolInfo.motto || 'UNGGUL • BERAKHLAK • KOMPETEN'}
            </span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {renderNavGroup('', mainMenuItems)}
          {renderNavGroup('Vokasi & Kemitraan', [...pklMenuItems, ...bkkMenuItems, ...alumniMenuItems])}
          {renderNavGroup('Akademik & Pembelajaran', academicMenuItems)}
          {renderNavGroup('Data Master Sekolah', masterMenuItems)}
          {renderNavGroup('Konten Website', contentMenuItems)}
          {renderNavGroup('Sistem & Pengaturan', systemMenuItems)}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            id="admin-btn-back-website"
            onClick={onBackToWebsite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Website Publik</span>
          </button>

          <button
            id="admin-btn-logout"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              id="btn-admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Buka menu navigasi admin"
            >
              <Menu className="w-5 h-5" />
            </button>

            {currentSection !== 'dashboard' && (
              <button
                id="btn-header-back-dashboard"
                onClick={() => onNavigateSection('dashboard')}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Kembali ke Dashboard"
                aria-label="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            )}

            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                {getSectionTitle()}
              </h1>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Terhubung ke SQLite Database Tunggal • Status Aktif
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="truncate max-w-[180px]">{user?.email || 'admin@sekolah.sch.id'}</span>
            </div>

            <button
              onClick={onBackToWebsite}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Website</span>
            </button>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/70 backdrop-blur-xs">
          <div className="w-72 bg-slate-900 text-white flex flex-col h-full shadow-2xl animate-in slide-in-from-left">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-white truncate">Admin Portal</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
              {renderNavGroup('', mainMenuItems)}
              {renderNavGroup('Vokasi & Kemitraan', [...pklMenuItems, ...bkkMenuItems, ...alumniMenuItems])}
              {renderNavGroup('Akademik & Pembelajaran', academicMenuItems)}
              {renderNavGroup('Data Master Sekolah', masterMenuItems)}
              {renderNavGroup('Konten Website', contentMenuItems)}
              {renderNavGroup('Sistem & Pengaturan', systemMenuItems)}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  onBackToWebsite();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Website Publik</span>
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-rose-400 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari sesi Admin CMS ini?"
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        variant="warning"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

