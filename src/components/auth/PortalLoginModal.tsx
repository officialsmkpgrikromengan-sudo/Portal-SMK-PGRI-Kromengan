import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  X, 
  ArrowRight, 
  AlertCircle, 
  Info, 
  CheckCircle2,
  LogIn
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface PortalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'siswa' | 'guru' | 'bkk' | 'admin';
  onLoginSuccess: (role: UserRole) => void;
}

export const PortalLoginModal: React.FC<PortalLoginModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'siswa',
  onLoginSuccess
}) => {
  const { loginWithRole, loginWithGoogle } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'siswa' | 'guru' | 'bkk' | 'admin'>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialRole);
      setIdentifier('');
      setPassword('');
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      error('Harap masukkan NISN/NIP/Email dan Kata Sandi.');
      return;
    }

    try {
      setIsLoading(true);
      const loggedAccount = await loginWithRole(identifier, password, activeTab === 'admin' ? undefined : activeTab);
      success(`Selamat datang, ${loggedAccount.displayName}! Anda berhasil masuk ke ${
        loggedAccount.role === 'siswa' ? 'Portal Siswa' :
        loggedAccount.role === 'guru' ? 'Portal Guru' :
        loggedAccount.role === 'bkk' ? 'Portal BKK' : 'Dashboard Admin'
      }.`);
      onLoginSuccess(loggedAccount.role);
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      error(err.message || 'Gagal masuk. Periksa kembali NISN/NIP/Email dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const res = await loginWithGoogle();
      if (res) {
        success(`Selamat datang, ${res.displayName || res.email}!`);
        onLoginSuccess('admin');
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        info('Jendela Google Sign-in ditutup.');
      } else {
        error('Gagal login via Google.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Helper texts per role
  const getRoleConfig = () => {
    switch (activeTab) {
      case 'siswa':
        return {
          title: 'Portal Siswa',
          subtitle: 'Akses Jadwal Pelajaran, Presensi, Rapor Nilai & Jurnal PKL',
          idLabel: 'Nomor Induk Siswa Nasional (NISN) atau Email',
          idPlaceholder: 'Contoh NISN: 0071829341 atau fadhil.rahadian@siswa.smkpgri.sch.id',
          icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
          accentColor: 'blue',
          demoAccount: '0071829341 / siswa123456'
        };
      case 'guru':
        return {
          title: 'Portal Guru & Tendik',
          subtitle: 'Jadwal Mengajar, Input Presensi, Penilaian Rapor & Bimbingan PKL',
          idLabel: 'Nomor Induk Pegawai (NIP) atau Email',
          idPlaceholder: 'Contoh: 198503152010011002 atau budi.santoso@smkpgri.sch.id',
          icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
          accentColor: 'emerald',
          demoAccount: '198503152010011002 / guru123456'
        };
      case 'bkk':
        return {
          title: 'Portal Bursa Kerja Khusus (BKK)',
          subtitle: 'Kelola Lowongan Kerja, Seleksi Pelamar & Tracer Study Alumni',
          idLabel: 'Username Petugas BKK atau Email',
          idPlaceholder: 'Contoh: bkk atau koordinator.bkk@smkpgri.sch.id',
          icon: <Briefcase className="w-5 h-5 text-amber-600" />,
          accentColor: 'amber',
          demoAccount: 'bkk / bkk123456'
        };
      case 'admin':
        return {
          title: 'Otoritas Administrator CMS',
          subtitle: 'Manajemen Master Data, Konten Website, Role RBAC & Keamanan',
          idLabel: 'Email Administrator',
          idPlaceholder: 'official.smkpgri.kromengan@gmail.com',
          icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
          accentColor: 'indigo',
          demoAccount: 'admin / admin123456'
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div 
      id="portal-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              {config.icon}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{config.title}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {config.subtitle}
              </p>
            </div>
          </div>

          <button
            id="btn-close-login-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs (Siswa, Guru, BKK) */}
        <div className="p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1.5 shrink-0">
          <button
            id="tab-login-siswa"
            type="button"
            onClick={() => {
              setActiveTab('siswa');
              setIdentifier('');
              setPassword('');
            }}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'siswa'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Siswa</span>
          </button>

          <button
            id="tab-login-guru"
            type="button"
            onClick={() => {
              setActiveTab('guru');
              setIdentifier('');
              setPassword('');
            }}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'guru'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Guru & Tendik</span>
          </button>

          <button
            id="tab-login-bkk"
            type="button"
            onClick={() => {
              setActiveTab('bkk');
              setIdentifier('');
              setPassword('');
            }}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'bkk'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Petugas BKK</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier (NIS/NIP/Username/Email) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {config.idLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={config.idPlaceholder}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Direct Login Button (No Register Button as specified) */}
            <div className="pt-2">
              <button
                id="btn-submit-portal-login"
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  activeTab === 'siswa' ? 'bg-blue-600 hover:bg-blue-700' :
                  activeTab === 'guru' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  activeTab === 'bkk' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke {config.title}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Notice: No self-signup notice */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Informasi Akun:</strong> Akun dibuat dan dikelola secara resmi oleh Administrator Sekolah. Jika Anda belum memiliki NIS/NIP atau lupa kata sandi, silakan hubungi bagian Tata Usaha atau Admin Sekolah.
            </p>
          </div>
        </div>

        {/* Footer with Hidden/Discreet Admin Link & Google Sign In */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <button
            id="btn-switch-admin-login"
            type="button"
            onClick={() => setActiveTab(activeTab === 'admin' ? 'siswa' : 'admin')}
            className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{activeTab === 'admin' ? 'Kembali ke Portal Pengguna' : 'Akses Khusus Administrator CMS'}</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Masuk via Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
