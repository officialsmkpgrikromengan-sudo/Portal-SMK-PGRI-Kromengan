import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  ArrowLeft, 
  ExternalLink,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Save,
  Download,
  Clock,
  GraduationCap,
  Award,
  Building,
  BookOpen,
  Users,
  Phone,
  Mail,
  Sliders,
  Globe,
  Upload,
  Sparkles,
  Check,
  Bell,
  AlertCircle,
  UserPlus,
  Briefcase,
  Copy,
  Trash2
} from 'lucide-react';
import { 
  SchoolInfo,
  NewsItem,
  EventItem,
  AchievementItem,
  GalleryItem,
  StudentItem,
  TeacherItem,
  ClassItem,
  MajorItem,
  SubjectItem,
  AcademicYearItem,
  ScheduleItem,
  AttendanceRecord,
  GradeRecord,
  SystemSettings,
  UserAccount,
  UserRole
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  seedInitialData, 
  getSystemSettings, 
  updateSystemSettings, 
  fileToDataUrl,
  getUsers,
  saveUser,
  deleteUser
} from '../../lib/firebase';
import { defaultSystemSettings } from '../../data/defaultData';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminSettingsProps {
  systemSettings?: SystemSettings;
  schoolInfo?: SchoolInfo;
  newsList?: NewsItem[];
  eventsList?: EventItem[];
  achievementsList?: AchievementItem[];
  galleryList?: GalleryItem[];
  studentsList?: StudentItem[];
  teachersList?: TeacherItem[];
  classesList?: ClassItem[];
  majorsList?: MajorItem[];
  subjectsList?: SubjectItem[];
  academicYearsList?: AcademicYearItem[];
  schedulesList?: ScheduleItem[];
  attendanceList?: AttendanceRecord[];
  gradesList?: GradeRecord[];
  onRefreshAll: () => void;
  onBack?: () => void;
  onBackToPublic?: () => void;
}

type SettingsTab = 'profile' | 'academic' | 'portal' | 'users' | 'database';

export const AdminSettings: React.FC<AdminSettingsProps> = ({ 
  systemSettings = defaultSystemSettings,
  schoolInfo,
  newsList = [],
  eventsList = [],
  achievementsList = [],
  galleryList = [],
  studentsList = [],
  teachersList = [],
  classesList = [],
  majorsList = [],
  subjectsList = [],
  academicYearsList = [],
  schedulesList = [],
  attendanceList = [],
  gradesList = [],
  onRefreshAll,
  onBack,
  onBackToPublic 
}) => {
  const { user, updateAdminProfile, updateAdminPassword, sendResetPassword } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Loading and Confirmation states
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);

  // User Accounts State for Settings
  const [settingsUsersList, setSettingsUsersList] = useState<UserAccount[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [copiedUserKey, setCopiedUserKey] = useState<string | null>(null);

  // Quick Add User State
  const [quickRole, setQuickRole] = useState<UserRole>('siswa');
  const [quickSelectedStudent, setQuickSelectedStudent] = useState('');
  const [quickSelectedTeacher, setQuickSelectedTeacher] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickUsername, setQuickUsername] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('siswa123456');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const fetchSettingsUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await getUsers();
      setSettingsUsersList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchSettingsUsers();
    }
  }, [activeTab]);

  // Form State: Profile & Account
  const [displayName, setDisplayName] = useState(user?.displayName || systemSettings.adminDisplayName || 'Administrator Utama');
  const [adminPhone, setAdminPhone] = useState((user as any)?.phone || systemSettings.adminPhone || '081234567890');
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || systemSettings.adminAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  // Form State: Password Change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Form State: Academic & Grading
  const [kkmStandard, setKkmStandard] = useState<number>(systemSettings.kkmStandard || 75);
  const [attendanceWeight, setAttendanceWeight] = useState<number>(systemSettings.attendanceWeight || 45);
  const [assignmentWeight, setAssignmentWeight] = useState<number>(systemSettings.assignmentWeight || 20);
  const [utsWeight, setUtsWeight] = useState<number>(systemSettings.utsWeight || 15);
  const [uasWeight, setUasWeight] = useState<number>(systemSettings.uasWeight || 20);
  const [schoolStartTime, setSchoolStartTime] = useState(systemSettings.schoolStartTime || '07:00');
  const [schoolEndTime, setSchoolEndTime] = useState(systemSettings.schoolEndTime || '15:30');

  // Form State: Portal & PPDB
  const [ppdbStatus, setPpdbStatus] = useState<'open' | 'closed' | 'coming_soon'>(systemSettings.ppdbStatus || 'open');
  const [ppdbYear, setPpdbYear] = useState(systemSettings.ppdbYear || '2026/2027');
  const [helpdeskPhone, setHelpdeskPhone] = useState(systemSettings.helpdeskPhone || '081234567890');
  const [helpdeskEmail, setHelpdeskEmail] = useState(systemSettings.helpdeskEmail || 'helpdesk@smkpgri-teladan.sch.id');
  const [maintenanceMode, setMaintenanceMode] = useState(systemSettings.maintenanceMode || false);
  const [enableSoundNotification, setEnableSoundNotification] = useState(systemSettings.enableSoundNotification !== false);

  // Calculate sum of grade weights
  const totalWeight = attendanceWeight + assignmentWeight + utsWeight + uasWeight;
  const isWeightValid = totalWeight === 100;

  // Preset Avatars
  const presetAvatars = [
    { label: 'Admin 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'Admin 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'Kepsek', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
    { label: 'Guru Pria', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { label: 'Guru Wanita', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  ];

  // Sync state if systemSettings props change
  useEffect(() => {
    if (systemSettings) {
      setKkmStandard(systemSettings.kkmStandard || 75);
      setAttendanceWeight(systemSettings.attendanceWeight || 45);
      setAssignmentWeight(systemSettings.assignmentWeight || 20);
      setUtsWeight(systemSettings.utsWeight || 15);
      setUasWeight(systemSettings.uasWeight || 20);
      setSchoolStartTime(systemSettings.schoolStartTime || '07:00');
      setSchoolEndTime(systemSettings.schoolEndTime || '15:30');
      setPpdbStatus(systemSettings.ppdbStatus || 'open');
      setPpdbYear(systemSettings.ppdbYear || '2026/2027');
      setHelpdeskPhone(systemSettings.helpdeskPhone || '081234567890');
      setHelpdeskEmail(systemSettings.helpdeskEmail || 'helpdesk@smkpgri-teladan.sch.id');
      setMaintenanceMode(systemSettings.maintenanceMode || false);
      setEnableSoundNotification(systemSettings.enableSoundNotification !== false);
    }
  }, [systemSettings]);

  // Handle Avatar Image File Upload
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        error('Ukuran foto profil maksimal 2 MB');
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        setAvatarUrl(dataUrl);
        success('Foto profil berhasil diunggah!');
      } catch (err) {
        error('Gagal memproses foto.');
      }
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      error('Nama tampilan admin tidak boleh kosong.');
      return;
    }

    try {
      setIsSaving(true);
      await updateAdminProfile(displayName.trim(), avatarUrl, adminPhone);
      await updateSystemSettings({
        adminDisplayName: displayName.trim(),
        adminPhone: adminPhone.trim(),
        adminAvatarUrl: avatarUrl
      });
      success('Profil administrator berhasil disimpan!');
      onRefreshAll();
    } catch (err: any) {
      console.error(err);
      error(err.message || 'Gagal menyimpan profil admin.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Password Change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      error('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await updateAdminPassword(newPassword);
      success('Kata sandi admin berhasil diperbarui!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      error(err.message || 'Gagal memperbarui kata sandi.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Send Password Reset Link to Email
  const handleSendResetEmail = async () => {
    const targetEmail = user?.email || 'official.smkpgri.kromengan@gmail.com';
    try {
      await sendResetPassword(targetEmail);
      success(`Tautan reset kata sandi telah dikirim ke email: ${targetEmail}`);
      setShowResetPasswordConfirm(false);
    } catch (err: any) {
      error('Gagal mengirim tautan reset password.');
    }
  };

  // Save Academic & Grading Settings
  const handleSaveAcademic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightValid) {
      error(`Total bobot penilaian harus tepat 100%! Saat ini: ${totalWeight}%`);
      return;
    }

    try {
      setIsSaving(true);
      await updateSystemSettings({
        kkmStandard,
        attendanceWeight,
        assignmentWeight,
        utsWeight,
        uasWeight,
        schoolStartTime,
        schoolEndTime
      });
      success('Pengaturan standar KKM dan bobot nilai berhasil disimpan ke Firestore!');
      onRefreshAll();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan pengaturan akademik.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset Weights to Recommendation
  const handleResetWeights = () => {
    setAttendanceWeight(45);
    setAssignmentWeight(20);
    setUtsWeight(15);
    setUasWeight(20);
    info('Bobot dikembalikan ke standar rekomendasi kurikulum (45% Kehadiran, 20% Tugas, 15% UTS, 20% UAS).');
  };

  // Save Portal & PPDB Settings
  const handleSavePortal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateSystemSettings({
        ppdbStatus,
        ppdbYear,
        helpdeskPhone,
        helpdeskEmail,
        maintenanceMode,
        enableSoundNotification
      });
      success('Pengaturan portal dan layanan PPDB berhasil disimpan!');
      onRefreshAll();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan pengaturan portal.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Account Handlers
  const handleSelectQuickStudent = (nis: string) => {
    setQuickSelectedStudent(nis);
    const st = studentsList.find(s => s.nis === nis);
    if (st) {
      setQuickName(st.name);
      setQuickUsername(st.nis || st.nisn);
      setQuickEmail(st.email || `${st.nis}@siswa.smkpgri.sch.id`);
      setQuickPassword('siswa123456');
    }
  };

  const handleSelectQuickTeacher = (nip: string) => {
    setQuickSelectedTeacher(nip);
    const tc = teachersList.find(t => t.nip === nip);
    if (tc) {
      setQuickName(tc.name);
      setQuickUsername(tc.nip || `guru${tc.id}`);
      setQuickEmail(tc.email || `${tc.nip}@guru.smkpgri.sch.id`);
      setQuickPassword('guru123456');
    }
  };

  const handleCreateQuickAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickUsername.trim() || !quickEmail.trim() || !quickPassword.trim()) {
      error('Seluruh kolom wajib diisi lengkap.');
      return;
    }

    try {
      setIsCreatingAccount(true);
      const newAcc: UserAccount = {
        id: `user-${Date.now()}`,
        displayName: quickName.trim(),
        username: quickUsername.trim().toLowerCase(),
        initialPassword: quickPassword.trim(),
        email: quickEmail.trim().toLowerCase(),
        role: quickRole,
        status: 'Aktif',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (quickRole === 'siswa') {
        const matched = studentsList.find(s => s.nis === quickSelectedStudent);
        if (matched) newAcc.studentId = matched.id;
      } else if (quickRole === 'guru') {
        const matched = teachersList.find(t => t.nip === quickSelectedTeacher);
        if (matched) newAcc.teacherId = matched.id;
      }

      await saveUser(newAcc);
      success(`Akun login ${quickRole.toUpperCase()} untuk "${newAcc.displayName}" berhasil dibuat!`);
      setQuickName('');
      setQuickUsername('');
      setQuickEmail('');
      setQuickSelectedStudent('');
      setQuickSelectedTeacher('');
      fetchSettingsUsers();
    } catch (err) {
      console.error(err);
      error('Gagal membuat akun.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleCopyUserKey = (acc: UserAccount) => {
    const text = `Akun Login ${acc.displayName}\nUsername: ${acc.username || acc.email}\nPassword: ${acc.initialPassword || 'admin123456'}\nPeran: ${acc.role.toUpperCase()}`;
    navigator.clipboard.writeText(text);
    setCopiedUserKey(acc.id);
    success(`Info login ${acc.displayName} disalin!`);
    setTimeout(() => setCopiedUserKey(null), 2500);
  };

  const handleDeleteUserAccount = async (acc: UserAccount) => {
    if (confirm(`Hapus akun login "${acc.displayName}"?`)) {
      try {
        await deleteUser(acc.id);
        success(`Akun "${acc.displayName}" berhasil dihapus.`);
        fetchSettingsUsers();
      } catch (err) {
        error('Gagal menghapus akun.');
      }
    }
  };

  // Export Full School Data (JSON Backup)
  const handleExportFullBackup = () => {
    try {
      const fullBackupData = {
        exportedAt: new Date().toISOString(),
        environment: 'Firebase Firestore',
        appTitle: schoolInfo?.name || 'SMK PGRI Teladan',
        systemSettings: {
          adminDisplayName: displayName,
          adminPhone,
          kkmStandard,
          attendanceWeight,
          assignmentWeight,
          utsWeight,
          uasWeight,
          schoolStartTime,
          schoolEndTime,
          ppdbStatus,
          ppdbYear,
          helpdeskPhone,
          helpdeskEmail,
          maintenanceMode
        },
        schoolInfo,
        masterData: {
          studentsCount: studentsList.length,
          students: studentsList,
          teachersCount: teachersList.length,
          teachers: teachersList,
          classesCount: classesList.length,
          classes: classesList,
          majorsCount: majorsList.length,
          majors: majorsList,
          subjectsCount: subjectsList.length,
          subjects: subjectsList
        },
        academicData: {
          academicYears: academicYearsList,
          schedulesCount: schedulesList.length,
          schedules: schedulesList,
          attendanceRecordsCount: attendanceList.length,
          attendance: attendanceList,
          gradeRecordsCount: gradesList.length,
          grades: gradesList
        },
        cmsContent: {
          newsCount: newsList.length,
          news: newsList,
          eventsCount: eventsList.length,
          events: eventsList,
          achievementsCount: achievementsList.length,
          achievements: achievementsList,
          galleryCount: galleryList.length,
          gallery: galleryList
        }
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackupData, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `backup_sekolah_smkpgri_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      success('File cadangan lengkap database sekolah (.JSON) berhasil diunduh!');
    } catch (err) {
      console.error(err);
      error('Gagal mengekspor data cadangan.');
    }
  };

  // Seed Initial Demo Data
  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      await seedInitialData(true);
      success('Database Firebase Firestore berhasil diisi ulang dengan data demo resmi sekolah!');
      setShowSeedConfirm(false);
      onRefreshAll();
    } catch (err) {
      console.error(err);
      error('Gagal mengisi ulang data demo.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div id="admin-settings-view" className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              id="btn-back-settings-dashboard"
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-2xs transition-all group"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Dashboard</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-quick-export-backup"
            type="button"
            onClick={handleExportFullBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors"
            title="Download seluruh data sekolah dalam format JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cadangkan Data (JSON)</span>
          </button>

          {onBackToPublic && (
            <button
              id="btn-back-settings-public"
              type="button"
              onClick={onBackToPublic}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Website Publik</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Pengaturan Admin & Konfigurasi Sistem</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Sistem Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pusat pengelolaan akun administrator, pembobotan nilai rapor, standar KKM, status PPDB, serta pemeliharaan database Firebase.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        <button
          id="tab-settings-profile"
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Profil & Keamanan Admin</span>
        </button>

        <button
          id="tab-settings-academic"
          type="button"
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'academic'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Akademik & Bobot Nilai</span>
        </button>

        <button
          id="tab-settings-portal"
          type="button"
          onClick={() => setActiveTab('portal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'portal'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Portal & Layanan PPDB</span>
        </button>

        <button
          id="tab-settings-users"
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Akun Siswa, Guru & BKK</span>
        </button>

        <button
          id="tab-settings-database"
          type="button"
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'database'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database & Cadangan Data</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFIL & KEAMANAN ADMIN                                            */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Admin User Card Preview */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h3 className="text-lg font-extrabold text-white">{displayName}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white tracking-wider uppercase">
                    Super Administrator
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email || 'admin@sekolah.sch.id'}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{adminPhone || 'Belum diisi'}</span>
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Terverifikasi Firebase Auth</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Profile Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Informasi Profil Admin</h3>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Tampilan Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                    placeholder="Contoh: Administrator Utama / Bpk. Sutrisno, S.Kom"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Nama ini tampil pada dashboard dan catatan audit aktivitas sistem.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Foto Profil / URL Avatar
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono text-slate-700"
                      placeholder="https://images.unsplash.com/..."
                    />
                    <label className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preset Avatars */}
                  <div className="mt-2">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Pilih dari Preset Cepat:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {presetAvatars.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(preset.url)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                            avatarUrl === preset.url
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold ring-1 ring-blue-500'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-4 h-4 rounded-full object-cover" />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Form Security & Password Change */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Keamanan & Ganti Kata Sandi</h3>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Pastikan kata sandi baru Anda kuat dengan kombinasi huruf besar, angka, dan simbol.
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !newPassword}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowResetPasswordConfirm(true)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Kirim Tautan Reset ke Email ({user?.email || 'admin'})</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AKADEMIK & BOBOT NILAI                                             */}
      {/* ========================================================================= */}
      {activeTab === 'academic' && (
        <form onSubmit={handleSaveAcademic} className="space-y-6">
          {/* KKM Standard Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Standar Kriteria Ketuntasan Minimal (KKM)</h3>
              </div>
              <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                KKM: {kkmStandard}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Standar KKM ini menjadi acuan otomatis sistem dalam menandai siswa tuntas atau membutuhkan bimbingan remidi pada rekap nilai raport dan lembar transkrip nilai.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nilai KKM Standar Sekolah
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={50}
                    max={100}
                    required
                    value={kkmStandard}
                    onChange={(e) => setKkmStandard(parseInt(e.target.value) || 75)}
                    className="w-28 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-base font-bold text-slate-900 text-center"
                  />
                  <input
                    type="range"
                    min={60}
                    max={90}
                    value={kkmStandard}
                    onChange={(e) => setKkmStandard(parseInt(e.target.value))}
                    className="flex-1 accent-amber-600"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Skema Predikat Mutu Sekolah:</span>
                <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-600">
                  <span>A : $\ge$ 85 (Sangat Baik)</span>
                  <span>B : $\ge$ 75 (Baik)</span>
                  <span>C : $\ge$ 60 (Cukup)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Calculation Formula & Weights */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Bobot Komponen Perhitungan Nilai Rapor</h3>
                  <span className="text-[11px] text-slate-400">Total akumulasi bobot harus tepat 100%</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetWeights}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Reset ke Rekomendasi
              </button>
            </div>

            {/* Total Weight Status Bar */}
            <div className={`p-4 rounded-xl border transition-all ${
              isWeightValid
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="flex items-center gap-1.5">
                  {isWeightValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>Status Total Bobot:</span>
                </span>
                <span className="text-sm font-extrabold">{totalWeight}% / 100%</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
                <div style={{ width: `${attendanceWeight}%` }} className="bg-emerald-500 h-full" title={`Kehadiran: ${attendanceWeight}%`} />
                <div style={{ width: `${assignmentWeight}%` }} className="bg-blue-500 h-full" title={`Tugas: ${assignmentWeight}%`} />
                <div style={{ width: `${utsWeight}%` }} className="bg-amber-500 h-full" title={`UTS: ${utsWeight}%`} />
                <div style={{ width: `${uasWeight}%` }} className="bg-purple-500 h-full" title={`UAS: ${uasWeight}%`} />
              </div>

              {!isWeightValid && (
                <p className="text-[11px] text-rose-700 font-semibold mt-2">
                  Peringatan: Selisih {Math.abs(100 - totalWeight)}% ({totalWeight > 100 ? 'Kelebihan' : 'Kekurangan'}). Silakan sesuaikan agar genap 100%.
                </p>
              )}
            </div>

            {/* Inputs for each weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Weight 1: Kehadiran */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Kehadiran (Presensi)</span>
                  <span className="text-xs font-black text-emerald-700">{attendanceWeight}%</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={attendanceWeight}
                  onChange={(e) => setAttendanceWeight(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-xs text-center"
                />
                <span className="text-[10px] text-emerald-700 block">Dihitung otomatis dari rekap absensi</span>
              </div>

              {/* Weight 2: Tugas */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Tugas & Ulangan</span>
                  <span className="text-xs font-black text-blue-700">{assignmentWeight}%</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={assignmentWeight}
                  onChange={(e) => setAssignmentWeight(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-xs text-center"
                />
                <span className="text-[10px] text-blue-700 block">Akumulasi PR & tugas harian</span>
              </div>

              {/* Weight 3: UTS */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Ujian Tengah (UTS)</span>
                  <span className="text-xs font-black text-amber-700">{utsWeight}%</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={utsWeight}
                  onChange={(e) => setUtsWeight(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-xs text-center"
                />
                <span className="text-[10px] text-amber-700 block">Ujian penilaian tengah semester</span>
              </div>

              {/* Weight 4: UAS */}
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">Ujian Akhir (UAS)</span>
                  <span className="text-xs font-black text-purple-700">{uasWeight}%</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={uasWeight}
                  onChange={(e) => setUasWeight(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold text-xs text-center"
                />
                <span className="text-[10px] text-purple-700 block">Ujian penilaian akhir semester</span>
              </div>
            </div>
          </div>

          {/* School Operational Hours */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Jam Operasional Belajar Mengajar</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jam Mulai Pelajaran (Masuk)
                </label>
                <input
                  type="time"
                  required
                  value={schoolStartTime}
                  onChange={(e) => setSchoolStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jam Selesai Pelajaran (Pulang)
                </label>
                <input
                  type="time"
                  required
                  value={schoolEndTime}
                  onChange={(e) => setSchoolEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !isWeightValid}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Akademik'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PORTAL & LAYANAN PPDB                                              */}
      {/* ========================================================================= */}
      {activeTab === 'portal' && (
        <form onSubmit={handleSavePortal} className="space-y-6">
          {/* PPDB Admission Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Status Penerimaan Peserta Didik Baru (PPDB)</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setPpdbStatus('open')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  ppdbStatus === 'open'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Pendaftaran Dibuka</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    ppdbStatus === 'open' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {ppdbStatus === 'open' && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Menerima pendaftaran calon siswa baru secara aktif pada website publik.
                </p>
              </div>

              <div
                onClick={() => setPpdbStatus('coming_soon')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  ppdbStatus === 'coming_soon'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Segera Dibuka</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    ppdbStatus === 'coming_soon' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  }`}>
                    {ppdbStatus === 'coming_soon' && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Menampilkan pengumuman jadwal gelombang pendaftaran yang akan datang.
                </p>
              </div>

              <div
                onClick={() => setPpdbStatus('closed')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  ppdbStatus === 'closed'
                    ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Pendaftaran Ditutup</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    ppdbStatus === 'closed' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                  }`}>
                    {ppdbStatus === 'closed' && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Kuota telah terpenuhi atau periode penerimaan tahun ajaran telah berakhir.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tahun Ajaran PPDB
              </label>
              <input
                type="text"
                value={ppdbYear}
                onChange={(e) => setPpdbYear(e.target.value)}
                placeholder="Contoh: 2026/2027"
                className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
              />
            </div>
          </div>

          {/* Helpdesk & Contact Services */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Layanan Bantuan & Helpdesk PPDB</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp / Hotline Bantuan
                </label>
                <input
                  type="text"
                  value={helpdeskPhone}
                  onChange={(e) => setHelpdeskPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Khusus Layanan & Pertanyaan
                </label>
                <input
                  type="email"
                  value={helpdeskEmail}
                  onChange={(e) => setHelpdeskEmail(e.target.value)}
                  placeholder="Contoh: helpdesk@smkpgri-teladan.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode & Notifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Preferensi Sistem & Pemeliharaan</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Mode Pemeliharaan (Maintenance Mode)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Jika diaktifkan, portal akan menampilkan pengumuman pemeliharaan bagi pengunjung umum.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    maintenanceMode ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    maintenanceMode ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Notifikasi Suara Interaktif</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Aktifkan konfirmasi nada halus saat berhasil menyimpan data absensi atau nilai rapor.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableSoundNotification(!enableSoundNotification)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    enableSoundNotification ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    enableSoundNotification ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Portal'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AKUN SISWA, GURU & BKK                                              */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Manajemen Akses Login Portal Sekolah</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Akun Login Siswa, Guru & Petugas BKK</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Siswa, Guru, dan Petugas BKK tidak dapat mendaftar secara publik. Admin membuatkan akun di menu ini dan membagikan kredensial login (Username & Password) kepada mereka.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={fetchSettingsUsers}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang</span>
              </button>
            </div>
          </div>

          {/* Form Buat Akun Cepat */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-sm">Buat Akun Login Baru</h4>
            </div>

            <form onSubmit={handleCreateQuickAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuickRole('siswa');
                    setQuickPassword('siswa123456');
                    if (studentsList[0]) handleSelectQuickStudent(studentsList[0].nis);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    quickRole === 'siswa'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">1. Akun Siswa</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Gunakan NIS sebagai ID Login</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuickRole('guru');
                    setQuickPassword('guru123456');
                    if (teachersList[0]) handleSelectQuickTeacher(teachersList[0].nip || '');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    quickRole === 'guru'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900">2. Akun Guru</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Gunakan NIP sebagai ID Login</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuickRole('bkk');
                    setQuickName('Koordinator Bursa Kerja Khusus (BKK)');
                    setQuickUsername('bkk');
                    setQuickEmail('bkk@smkpgri.sch.id');
                    setQuickPassword('bkk123456');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    quickRole === 'bkk'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900">3. Akun BKK</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Petugas Penyaluran Karir</p>
                </button>
              </div>

              {/* Selector Helper for Siswa */}
              {quickRole === 'siswa' && studentsList.length > 0 && (
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200">
                  <label className="block text-blue-900 font-bold mb-1">Pilih Siswa dari Data Master:</label>
                  <select
                    value={quickSelectedStudent}
                    onChange={(e) => handleSelectQuickStudent(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-blue-300 font-semibold text-xs"
                  >
                    <option value="">-- Pilih Siswa untuk Auto-Fill --</option>
                    {studentsList.map(s => (
                      <option key={s.id} value={s.nis}>
                        {s.name} (NIS: {s.nis} - Kelas {s.classId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selector Helper for Guru */}
              {quickRole === 'guru' && teachersList.length > 0 && (
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                  <label className="block text-emerald-900 font-bold mb-1">Pilih Guru dari Data Master:</label>
                  <select
                    value={quickSelectedTeacher}
                    onChange={(e) => handleSelectQuickTeacher(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-emerald-300 font-semibold text-xs"
                  >
                    <option value="">-- Pilih Guru untuk Auto-Fill --</option>
                    {teachersList.map(t => (
                      <option key={t.id} value={t.nip}>
                        {t.name} (NIP: {t.nip || 'Belum ada NIP'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Username / ID Login *</label>
                  <input
                    type="text"
                    required
                    value={quickUsername}
                    onChange={(e) => setQuickUsername(e.target.value)}
                    placeholder="NIS / NIP / Username"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    placeholder="nama@smkpgri.sch.id"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Password Awal *</label>
                  <input
                    type="text"
                    required
                    value={quickPassword}
                    onChange={(e) => setQuickPassword(e.target.value)}
                    placeholder="Password awal"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isCreatingAccount}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isCreatingAccount ? 'Membuat Akun...' : `Simpan & Buat Akun ${quickRole.toUpperCase()}`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Daftar Akun Aktif */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Daftar Akun Login Terdaftar ({settingsUsersList.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                Klik ikon salin untuk membagikan kredensial login kepada pengguna
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Nama Pengguna</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Username / Login ID</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Password Awal</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {settingsUsersList.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{acc.displayName}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.role === 'siswa' ? 'bg-blue-100 text-blue-800' :
                          acc.role === 'guru' ? 'bg-emerald-100 text-emerald-800' :
                          acc.role === 'bkk' ? 'bg-amber-100 text-amber-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {acc.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {acc.username || acc.email.split('@')[0]}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{acc.email}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {acc.initialPassword || '••••••••'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyUserKey(acc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                            title="Salin Kredensial Login"
                          >
                            {copiedUserKey === acc.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUserAccount(acc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {settingsUsersList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400">
                        Belum ada akun pengguna yang dimuat. Klik tombol 'Muat Ulang'.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DATABASE & CADANGAN DATA                                           */}
      {/* ========================================================================= */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Cloud Infrastructure Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Status Infrastruktur Backend (SQLite Database Tunggal)</h3>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Terhubung Aktif (Local Engine)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Database Engine</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">SQLite 3 (Database Tunggal)</span>
                <span className="text-[11px] text-slate-500">ACID Compliant Relational Store</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sistem Autentikasi</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">Role-Based Auth (Scrypt Hashed)</span>
                <span className="text-[11px] text-slate-500">Siswa, Guru, BKK, Admin & Google</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Berkas Database Fisik</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block truncate">data/school.sqlite</span>
                <span className="text-[11px] text-slate-500">Penyimpanan Terpadu & Terenkripsi</span>
              </div>
            </div>
          </div>

          {/* Database Collections Summary Stats */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Ringkasan Data Tersimpan di SQLite</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">26 Tabel Relasional Utama</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                <span className="text-xl font-black text-blue-900 block">{studentsList.length}</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase">Siswa</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
                <span className="text-xl font-black text-indigo-900 block">{teachersList.length}</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Guru</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <span className="text-xl font-black text-purple-900 block">{classesList.length}</span>
                <span className="text-[10px] font-bold text-purple-600 uppercase">Kelas</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                <span className="text-xl font-black text-emerald-900 block">{subjectsList.length}</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Mapel</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                <span className="text-xl font-black text-amber-900 block">{schedulesList.length}</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Jadwal</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
                <span className="text-xl font-black text-rose-900 block">{gradesList.length}</span>
                <span className="text-[10px] font-bold text-rose-600 uppercase">Nilai Rapor</span>
              </div>
            </div>
          </div>

          {/* Backup & Export Utility */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Download className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cadangkan Seluruh Data Sekolah (Backup JSON)</h3>
                <span className="text-[11px] text-slate-400">Ekspor lengkap untuk arsip mandiri</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda dapat mengunduh salinan komprehensif seluruh data sekolah (Data Siswa, Guru, Kelas, Program Keahlian, Jadwal Pelajaran, Rekap Absensi, Lembar Nilai, Berita, dan Agenda Event) ke dalam satu file berkas JSON terenkripsi standar.
            </p>

            <div>
              <button
                type="button"
                onClick={handleExportFullBackup}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan Lengkap Sekarang (.JSON)</span>
              </button>
            </div>
          </div>

          {/* Seed & Reset Demo Utility */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Inisialisasi & Isi Ulang Data Sampel Resmi</h3>
                <span className="text-[11px] text-slate-400">Pemulihan cepat data acuan</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Jika Anda ingin menyegarkan kembali database dengan data sampel sekolah resmi yang lengkap dan konsisten (data siswa kejuruan, guru produktif, jadwal anti-bentrok, dan nilai percontohan), klik tombol di bawah.
            </p>

            <div>
              <button
                id="btn-seed-initial-database"
                type="button"
                onClick={() => setShowSeedConfirm(true)}
                className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Isi Ulang Data Demo Resmi Sekolah</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Seed Initial Data */}
      <ConfirmDialog
        isOpen={showSeedConfirm}
        title="Isi Ulang Data Demo Resmi"
        message="Tindakan ini akan mengunggah dan memperbarui seluruh koleksi data resmi (Siswa, Guru, Jadwal, Nilai, Berita, dan Agenda) di database SQLite Anda. Lanjutkan?"
        confirmLabel="Ya, Mulai Inisialisasi Data"
        cancelLabel="Batal"
        variant="warning"
        isLoading={isSeeding}
        onConfirm={handleSeedData}
        onCancel={() => setShowSeedConfirm(false)}
      />

      {/* Confirmation Modal: Reset Password Email */}
      <ConfirmDialog
        isOpen={showResetPasswordConfirm}
        title="Kirim Tautan Reset Kata Sandi"
        message={`Sistem akan mengirimkan instruksi perubahan kata sandi ke alamat email: ${user?.email || 'admin@sekolah.sch.id'}. Lanjutkan pengiriman?`}
        confirmLabel="Ya, Kirim Email"
        cancelLabel="Batal"
        variant="info"
        onConfirm={handleSendResetEmail}
        onCancel={() => setShowResetPasswordConfirm(false)}
      />
    </div>
  );
};

export default AdminSettings;
