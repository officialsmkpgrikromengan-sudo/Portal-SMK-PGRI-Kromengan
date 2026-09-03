import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';

interface PortalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'siswa' | 'guru' | 'bkk' | 'admin';
  onLoginSuccess?: (role: UserRole) => void;
}

export const PortalLoginModal: React.FC<PortalLoginModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'siswa',
  onLoginSuccess
}) => {
  const { loginWithRole } = useAuth();
  const { success, error } = useToast();

  const [activeRole, setActiveRole] = useState<UserRole>(initialRole as UserRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialRole) {
        setActiveRole(initialRole as UserRole);
      }
      setIdentifier('');
      setPassword('');
      setShowPassword(false);
    }
  }, [initialRole, isOpen]);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setIdentifier('');
    setPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      error('Harap masukkan NISN/NIP/Username dan Kata Sandi.');
      return;
    }

    try {
      setIsLoading(true);
      const acc = await loginWithRole(identifier, password, activeRole);
      success(`Selamat datang, ${acc.displayName}! Masuk ke portal ${acc.role.toUpperCase()}.`);
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess(acc.role);
      }
    } catch (err: any) {
      console.error(err);
      error(err.message || 'Gagal masuk. Periksa kembali NISN/NIP/Username dan Kata Sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Role Color Accent */}
        <div className={`p-6 text-white transition-colors relative ${
          activeRole === 'siswa' ? 'bg-gradient-to-r from-blue-700 to-indigo-800' :
          activeRole === 'guru' ? 'bg-gradient-to-r from-emerald-700 to-teal-800' :
          activeRole === 'bkk' ? 'bg-gradient-to-r from-amber-600 to-orange-700' :
          'bg-gradient-to-r from-slate-800 to-slate-900'
        }`}>
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
              {activeRole === 'siswa' && <GraduationCap className="w-6 h-6 text-white" />}
              {activeRole === 'guru' && <BookOpen className="w-6 h-6 text-white" />}
              {activeRole === 'bkk' && <Briefcase className="w-6 h-6 text-white" />}
              {activeRole === 'admin' && <ShieldCheck className="w-6 h-6 text-white" />}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-white/80">
                Masuk Sistem Terpadu
              </span>
              <h2 className="text-xl font-black text-white">
                {activeRole === 'siswa' && 'Portal Siswa'}
                {activeRole === 'guru' && 'Portal Guru'}
                {activeRole === 'bkk' && 'Portal Bursa Kerja Khusus (BKK)'}
                {activeRole === 'admin' && 'Administrator Sekolah'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-white/80 mt-2 leading-relaxed">
            {activeRole === 'siswa' && 'Akses jadwal pelajaran, riwayat absensi, lembar nilai rapor, dan jurnal kegiatan PKL.'}
            {activeRole === 'guru' && 'Input absensi harian, kelola nilai siswa, dan validasi jurnal PKL bimbingan.'}
            {activeRole === 'bkk' && 'Kelola informasi lowongan karir, data pelamar alumni, dan verifikasi mitra industri.'}
            {activeRole === 'admin' && 'Akses pengelolaan master data dan konfigurasi sistem resmi sekolah.'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-2xl">
            <button
              id="login-tab-siswa"
              type="button"
              onClick={() => handleRoleChange('siswa')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'siswa'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Siswa</span>
            </button>

            <button
              id="login-tab-guru"
              type="button"
              onClick={() => handleRoleChange('guru')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'guru'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guru</span>
            </button>

            <button
              id="login-tab-bkk"
              type="button"
              onClick={() => handleRoleChange('bkk')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'bkk'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>BKK</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {activeRole === 'siswa' && 'Nomor Induk Siswa Nasional (NISN) atau Email'}
              {activeRole === 'guru' && 'Nomor Induk Pegawai (NIP) atau Email'}
              {activeRole === 'bkk' && 'Username atau Email Petugas BKK'}
              {activeRole === 'admin' && 'Email Administrator'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="portal-login-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  activeRole === 'siswa' ? 'Contoh NISN: 0071829341 atau fadhil.rahadian@siswa.smkpgri.sch.id' :
                  activeRole === 'guru' ? 'Contoh: 198503152010011002 atau budi.santoso@smkpgri.sch.id' :
                  activeRole === 'bkk' ? 'Contoh: bkk atau koordinator.bkk@smkpgri.sch.id' :
                  'official.smkpgri.kromengan@gmail.com'
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="portal-login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi akun Anda"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Notice for No Public Registration */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Info Akses:</strong> Akun diterbitkan resmi oleh Administrator Sekolah. Tidak ada formulir pendaftaran mandiri.
            </p>
          </div>

          {/* Submit Button */}
          <button
            id="btn-portal-submit-login"
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
              activeRole === 'siswa' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25' :
              activeRole === 'guru' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25' :
              activeRole === 'bkk' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25' :
              'bg-slate-900 hover:bg-black shadow-slate-900/25'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Memverifikasi Akses...' : `Masuk ke Portal ${activeRole.toUpperCase()}`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
