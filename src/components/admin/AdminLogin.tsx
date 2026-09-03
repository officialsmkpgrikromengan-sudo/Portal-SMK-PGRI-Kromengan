import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck,
  UserPlus,
  LogIn,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface AdminLoginProps {
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublic }) => {
  const { login, registerAdmin, loginWithGoogle, loginDemoAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authNote, setAuthNote] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthNote(null);
      const user = await loginWithGoogle();
      if (user) {
        success(`Selamat datang, ${user.displayName || user.email}! Berhasil masuk ke Dashboard.`);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        info('Jendela login Google ditutup sebelum proses selesai.');
      } else if (err.code === 'auth/popup-blocked') {
        error('Jendela popup diblokir oleh browser. Izinkan popup untuk login dengan Google.');
      } else {
        error('Gagal login dengan Google: ' + (err.message || 'Terjadi kesalahan'));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      error('Harap masukkan email dan kata sandi.');
      return;
    }

    try {
      setIsLoading(true);
      setAuthNote(null);
      if (isRegisterMode) {
        await registerAdmin(email, password);
        success('Akun Admin baru berhasil didaftarkan dan Anda langsung masuk!');
      } else {
        await login(email, password);
        success('Selamat datang kembali di Dashboard Admin!');
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      let msg = 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'Metode Email/Password belum diaktifkan di Firebase Console. Silakan gunakan tombol "Masuk dengan Akun Google" di atas.';
        setAuthNote('Metode login Email/Password memerlukan aktivasi di Firebase Authentication Console. Gunakan Google Sign-In untuk akses langsung tanpa konfigurasi tambahan.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Email atau kata sandi tidak sesuai. Jika ini pertama kali, silakan buat akun admin baru atau gunakan Google Login.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar. Silakan masuk.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Kata sandi minimal 6 karakter.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Format alamat email tidak valid.';
      }
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoCredentials = () => {
    setEmail('official.smkpgri.kromengan@gmail.com');
    setPassword('admin123456');
    info('Kredensial admin terisi otomatis. Anda juga dapat menggunakan tombol Masuk Cepat (1-Klik) atau Google Sign-In.');
  };

  return (
    <div id="admin-login-screen" className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          id="btn-login-back-to-website"
          onClick={onBackToPublic}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Publik</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand logo */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portal Admin CMS
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Sistem Manajemen Konten & Master Data Sekolah (Firebase Auth)
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* PRIMARY: Google One-Click Login */}
          <div>
            <button
              id="btn-google-sign-in"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 group border border-slate-200"
            >
              {isGoogleLoading ? (
                <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Masuk dengan Akun Google</span>
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Autentikasi resmi & instan menggunakan akun Google Firebase
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              atau via Email / Sandi
            </span>
            <div className="border-t border-slate-800 w-full"></div>
          </div>

          {authNote && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{authNote}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setAuthNote(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isRegisterMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setAuthNote(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isRegisterMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  placeholder="official.smkpgri.kromengan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-admin-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              )}
              <span>{isRegisterMode ? 'Daftarkan Akun Email' : 'Masuk via Email'}</span>
            </button>
          </form>

          {/* Quick demo helper */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              id="btn-quick-admin-login"
              type="button"
              onClick={() => {
                loginDemoAdmin();
                success('Berhasil masuk sebagai Administrator SMK PGRI.');
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Masuk Cepat Admin (1-Klik)</span>
            </button>
            <button
              type="button"
              onClick={handleDemoCredentials}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Isi Data Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

