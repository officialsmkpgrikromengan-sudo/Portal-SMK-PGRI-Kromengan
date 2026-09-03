import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Award, 
  Building, 
  Users, 
  Clock, 
  Save, 
  User, 
  LogOut, 
  Globe, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Sparkles,
  MessageSquare,
  Sun,
  Moon
} from 'lucide-react';
import { 
  TeacherItem, 
  ClassItem, 
  SubjectItem, 
  ScheduleItem, 
  StudentItem, 
  AttendanceRecord, 
  GradeRecord, 
  InternshipItem, 
  InternshipJournal, 
  InternshipMonitoring, 
  SchoolInfo,
  SystemSettings
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  saveAttendanceBulk, 
  saveGrade, 
  verifyInternshipJournal, 
  saveInternshipMonitoring 
} from '../../lib/firebase';

interface TeacherPortalProps {
  schoolInfo: SchoolInfo;
  teachersList: TeacherItem[];
  classesList: ClassItem[];
  subjectsList: SubjectItem[];
  schedulesList: ScheduleItem[];
  studentsList: StudentItem[];
  attendanceList: AttendanceRecord[];
  gradesList: GradeRecord[];
  internshipsList: InternshipItem[];
  internshipJournalsList: InternshipJournal[];
  internshipMonitoringList: InternshipMonitoring[];
  systemSettings?: SystemSettings;
  onBackToPublic: () => void;
  onRefreshAll: () => void;
}

type TeacherTab = 'dashboard' | 'schedules' | 'attendance' | 'grades' | 'pkl';

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  schoolInfo,
  teachersList = [],
  classesList = [],
  subjectsList = [],
  schedulesList = [],
  studentsList = [],
  attendanceList = [],
  gradesList = [],
  internshipsList = [],
  internshipJournalsList = [],
  internshipMonitoringList = [],
  systemSettings,
  onBackToPublic,
  onRefreshAll
}) => {
  const { user, currentUserAccount, logout } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');

  // Dark mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('portal_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('portal_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('portal_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Match current teacher
  const currentTeacher = teachersList.find(t => 
    (currentUserAccount?.teacherId && t.id === currentUserAccount.teacherId) ||
    (currentUserAccount?.username && t.nip === currentUserAccount.username) ||
    (currentUserAccount?.email && t.email && t.email.toLowerCase() === currentUserAccount.email.toLowerCase()) ||
    t.id === 'tch-2' // fallback to Budi Santoso
  ) || teachersList[0];

  const teacherName = currentTeacher?.fullName || (currentTeacher as any)?.name || 'Dewan Guru';

  // Teacher specific schedules
  const teacherSchedules = schedulesList.filter(s => s.teacherId === currentTeacher?.id);
  
  // Unique classes taught by teacher
  const taughtClassIds = Array.from(new Set(teacherSchedules.map(s => s.classId)));
  const taughtClasses = classesList.filter(c => taughtClassIds.includes(c.id));

  // Teacher internship advisees
  const guidedInternships = internshipsList.filter(i => 
    i.schoolMentorId === currentTeacher?.id || 
    (i.schoolMentorName && teacherName && i.schoolMentorName.toLowerCase().includes(teacherName.toLowerCase().split(' ')[0]))
  );
  const guidedInternshipIds = guidedInternships.map(i => i.id);
  const guidedJournals = internshipJournalsList.filter(j => 
    guidedInternshipIds.includes(j.internshipId) ||
    guidedInternships.some(i => i.studentId === j.studentId)
  );

  // =========================================================
  // STATE: ATTENDANCE INPUT
  // =========================================================
  const [attSelectedClassId, setAttSelectedClassId] = useState<string>(taughtClasses[0]?.id || classesList[0]?.id || '');
  const [attSelectedSubjectId, setAttSelectedSubjectId] = useState<string>(
    (currentTeacher?.subjectIds && currentTeacher.subjectIds[0]) || 
    (currentTeacher as any)?.subjectId || 
    subjectsList[0]?.id || ''
  );
  const [attDate, setAttDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attStudentStatuses, setAttStudentStatuses] = useState<Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Filter students for attendance input
  const classStudents = studentsList.filter(s => s.classId === attSelectedClassId);

  const handleSetAllAttendance = (status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa') => {
    const updated: Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'> = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setAttStudentStatuses(updated);
  };

  const handleSaveAttendance = async () => {
    if (classStudents.length === 0) {
      error('Tidak ada siswa di kelas yang dipilih.');
      return;
    }

    try {
      setIsSavingAttendance(true);
      const recordToSave: AttendanceRecord = {
        id: `att-${attSelectedClassId}-${attDate}-${Date.now()}`,
        academicYearId: 'ay-2026-ganjil',
        teacherId: currentTeacher?.id || 'tch-demo',
        classId: attSelectedClassId,
        subjectId: attSelectedSubjectId,
        date: attDate,
        items: classStudents.map(student => ({
          studentId: student.id,
          status: attStudentStatuses[student.id] || 'Hadir'
        })),
        topicOrMaterial: 'Pertemuan KBM Reguler',
        createdAt: new Date().toISOString()
      };

      await saveAttendanceBulk([recordToSave]);
      success(`Presensi ${classStudents.length} siswa kelas ${classesList.find(c => c.id === attSelectedClassId)?.name} berhasil disimpan!`);
      onRefreshAll();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan data presensi.');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // =========================================================
  // STATE: GRADE INPUT
  // =========================================================
  const [gradeSelectedClassId, setGradeSelectedClassId] = useState<string>(taughtClasses[0]?.id || classesList[0]?.id || '');
  const [gradeSelectedSubjectId, setGradeSelectedSubjectId] = useState<string>(
    (currentTeacher?.subjectIds && currentTeacher.subjectIds[0]) || 
    (currentTeacher as any)?.subjectId || 
    subjectsList[0]?.id || ''
  );
  const [isSavingGrades, setIsSavingGrades] = useState(false);

  // Local grade records state for editing
  const gradeStudents = studentsList.filter(s => s.classId === gradeSelectedClassId);

  // State: Journal Review Modal
  const [selectedJournalToReview, setSelectedJournalToReview] = useState<InternshipJournal | null>(null);
  const [teacherJournalNotes, setTeacherJournalNotes] = useState('');
  const [isUpdatingJournal, setIsUpdatingJournal] = useState(false);

  const handleVerifyJournal = async (journalId: string, status: 'Approved' | 'Rejected') => {
    try {
      setIsUpdatingJournal(true);
      await verifyInternshipJournal(journalId, status, teacherJournalNotes.trim() || undefined);
      success(`Jurnal PKL berhasil ${status === 'Approved' ? 'disetujui' : 'ditolak dengan catatan'}!`);
      setSelectedJournalToReview(null);
      setTeacherJournalNotes('');
      onRefreshAll();
    } catch (err) {
      console.error(err);
      error('Gagal memperbarui status jurnal PKL.');
    } finally {
      setIsUpdatingJournal(false);
    }
  };

  return (
    <div id="teacher-portal" className={`min-h-screen flex flex-col transition-colors duration-200 ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Teacher Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand / Role */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Portal Guru & Tendik</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Tenaga Pendidik
                  </span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {schoolInfo.name}
                </p>
              </div>
            </div>

            {/* Right User Controls */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                id="btn-teacher-theme-toggle"
                onClick={toggleTheme}
                type="button"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
                title={isDark ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
                aria-label="Toggle Dark Mode"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline">Terang</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-blue-300" />
                    <span className="hidden md:inline">Gelap</span>
                  </>
                )}
              </button>

              <button
                id="btn-teacher-back-web"
                onClick={onBackToPublic}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website Publik</span>
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="w-9 h-9 rounded-full bg-emerald-700 border-2 border-emerald-500 flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-xs">
                  {currentTeacher?.photoUrl ? (
                    <img src={currentTeacher.photoUrl} alt={teacherName} className="w-full h-full object-cover" />
                  ) : (
                    teacherName.charAt(0)
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[160px]">
                    {teacherName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    NIP: {currentTeacher?.nip || '-'}
                  </div>
                </div>

                <button
                  id="btn-teacher-logout"
                  onClick={logout}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all border border-rose-500/20 ml-1 cursor-pointer"
                  title="Keluar dari Portal Guru"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Dashboard Guru</span>
            </button>

            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Jadwal Mengajar</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Presensi Siswa</span>
            </button>

            <button
              onClick={() => setActiveTab('grades')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'grades'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Input Nilai Rapor</span>
            </button>

            <button
              onClick={() => setActiveTab('pkl')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pkl'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Bimbingan PKL</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* =========================================================
            TAB 1: DASHBOARD GURU
        ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Hero Teacher Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0 shadow-lg">
                    {currentTeacher?.photoUrl ? (
                      <img src={currentTeacher.photoUrl} alt={teacherName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-emerald-300">
                        {teacherName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[11px] font-bold border border-emerald-400/30">
                      <span>NIP: {currentTeacher?.nip || '-'}</span>
                      <span>•</span>
                      <span>{currentTeacher?.status || 'Guru Tetap'}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {teacherName}
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-200">
                      {subjectsList.find(s => s.id === (currentTeacher as any)?.subjectId || (currentTeacher?.subjectIds && currentTeacher.subjectIds[0]))?.name || 'Pengampu Kejuruan'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 shrink-0">
                  <div className="text-center px-2">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Jam Mengajar</div>
                    <div className="text-lg sm:text-xl font-extrabold text-white">{teacherSchedules.length * 2} JP</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Mingguan</div>
                  </div>
                  <div className="text-center px-2 border-x border-white/10">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Rombel</div>
                    <div className="text-lg sm:text-xl font-extrabold text-white">{taughtClasses.length} Kelas</div>
                    <div className="text-[10px] text-emerald-300 font-medium">Aktif</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Bimbingan PKL</div>
                    <div className="text-lg sm:text-xl font-extrabold text-white">{guidedInternships.length} Siswa</div>
                    <div className="text-[10px] text-amber-300 font-medium">{guidedJournals.filter(j => j.status === 'Pending').length} Review</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Dashboard Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Input Presensi Cepat */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Input Presensi Harian
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Lakukan pengisian absensi kehadiran siswa di kelas yang Anda ampu hari ini secara realtime.
                </p>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Buka Form Presensi</span>
                </button>
              </div>

              {/* Card 2: Input Nilai Siswa */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Penilaian Rapor (K13/Merdeka)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Rekapitulasi nilai tugas harian, UTS, UAS, dan perhitungan nilai akhir rapor otomatis dengan bobot 45/20/15/20.
                </p>
                <button
                  onClick={() => setActiveTab('grades')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Input Nilai Kelas</span>
                </button>
              </div>

              {/* Card 3: Verifikasi Jurnal PKL */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Verifikasi Jurnal PKL
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Terdapat <strong className="text-slate-900 dark:text-slate-100 font-bold">{guidedJournals.filter(j => j.status === 'Pending').length} jurnal</strong> siswa bimbingan PKL yang menunggu persetujuan Anda.
                </p>
                <button
                  onClick={() => setActiveTab('pkl')}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Periksa Jurnal PKL</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: JADWAL MENGAJAR
        ========================================================= */}
        {activeTab === 'schedules' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Jadwal Mengajar: {teacherName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tahun Ajaran 2025/2026 - Semester Ganjil
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60">
                    <th className="py-3 px-4">Hari</th>
                    <th className="py-3 px-4">Jam Pelajaran</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Ruangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {teacherSchedules.map((sch) => {
                    const cls = classesList.find(c => c.id === sch.classId);
                    const subj = subjectsList.find(s => s.id === sch.subjectId);
                    return (
                      <tr key={sch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{sch.day}</td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{sch.startTime} - {sch.endTime}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{cls?.name || '-'}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{subj?.name || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {sch.room || 'Lab Kejuruan'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {teacherSchedules.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-400">
                        Belum ada jadwal mengajar yang terdaftar untuk akun ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: INPUT PRESENSI SISWA
        ========================================================= */}
        {activeTab === 'attendance' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Form Presensi & Absensi Kelas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pilih kelas dan tentukan status kehadiran siswa, lalu simpan ke database sekolah.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Set Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleSetAllAttendance('Hadir')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                >
                  Semua Hadir
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance || classStudents.length === 0}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingAttendance ? 'Menyimpan...' : 'Simpan Presensi'}</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Kelas</label>
                <select
                  value={attSelectedClassId}
                  onChange={(e) => setAttSelectedClassId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {classesList.map(c => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Mata Pelajaran</label>
                <select
                  value={attSelectedSubjectId}
                  onChange={(e) => setAttSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {subjectsList.map(s => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Attendance Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">NISN / NIS</th>
                    <th className="py-3 px-4">Nama Lengkap Siswa</th>
                    <th className="py-3 px-4 text-center">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {classStudents.map((std, idx) => {
                    const currentStatus = attStudentStatuses[std.id] || 'Hadir';
                    const stdName = std.fullName || (std as any).name || 'Siswa';
                    return (
                      <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold font-mono text-slate-700 dark:text-slate-300">{std.nisn || std.nis}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{stdName}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as const).map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setAttStudentStatuses(prev => ({ ...prev, [std.id]: st }))}
                                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  currentStatus === st
                                    ? st === 'Hadir' ? 'bg-emerald-600 text-white shadow-xs' :
                                      st === 'Sakit' ? 'bg-amber-600 text-white shadow-xs' :
                                      st === 'Izin' ? 'bg-blue-600 text-white shadow-xs' :
                                      'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {classStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 dark:text-slate-400">
                        Tidak ada siswa di kelas yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: INPUT NILAI RAPOR
        ========================================================= */}
        {activeTab === 'grades' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Form Penilaian & Rapor Siswa
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rumus Nilai Akhir: (Presensi 45%) + (Tugas 20%) + (UTS 15%) + (UAS 20%) • Standar KKM: {systemSettings?.kkmStandard || 75}
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Pilih Kelas</label>
                <select
                  value={gradeSelectedClassId}
                  onChange={(e) => setGradeSelectedClassId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {classesList.map(c => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Mata Pelajaran</label>
                <select
                  value={gradeSelectedSubjectId}
                  onChange={(e) => setGradeSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {subjectsList.map(s => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grade Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60">
                    <th className="py-3 px-3">Nama Siswa</th>
                    <th className="py-3 px-2 text-center w-24">Presensi (45%)</th>
                    <th className="py-3 px-2 text-center w-24">Tugas (20%)</th>
                    <th className="py-3 px-2 text-center w-24">UTS (15%)</th>
                    <th className="py-3 px-2 text-center w-24">UAS (20%)</th>
                    <th className="py-3 px-2 text-center">Nilai Akhir</th>
                    <th className="py-3 px-2 text-center">Predikat</th>
                    <th className="py-3 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {gradeStudents.map((std) => {
                    const existingGrade = gradesList.find(g => 
                       g.studentId === std.id && 
                      g.subjectId === gradeSelectedSubjectId
                    );

                    return (
                      <GradeRowEditor
                        key={std.id}
                        student={std}
                        classId={gradeSelectedClassId}
                        subjectId={gradeSelectedSubjectId}
                        existingGrade={existingGrade}
                        onRefresh={onRefreshAll}
                      />
                    );
                  })}
                  {gradeStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400 dark:text-slate-400">
                        Tidak ada data siswa di kelas yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: BIMBINGAN PKL
        ========================================================= */}
        {activeTab === 'pkl' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Siswa Bimbingan Praktik Kerja Lapangan ({guidedInternships.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guidedInternships.map(intern => {
                  return (
                    <div key={intern.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{intern.studentName}</div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{intern.companyName}</div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/50 text-[10px] font-bold">
                          {intern.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        Pembimbing Industri: <strong className="text-slate-800 dark:text-slate-100">{intern.industryMentorName || 'Pembimbing DUDI'}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Jurnal Pending Review */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Verifikasi Jurnal Harian Siswa ({guidedJournals.length})
              </h3>

              <div className="space-y-3">
                {guidedJournals.map(j => (
                  <div key={j.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{j.studentName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">• {j.date} ({j.startTime} - {j.endTime})</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        j.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/50' :
                        j.status === 'Rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-800/50' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-800/50'
                      }`}>
                        {j.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      {j.activityDescription}
                    </p>

                    {j.status === 'Pending' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleVerifyJournal(j.id, 'Approved')}
                          disabled={isUpdatingJournal}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui Jurnal</span>
                        </button>
                        <button
                          onClick={() => setSelectedJournalToReview(j)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-[11px] cursor-pointer"
                        >
                          Beri Catatan / Revisi
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Review Modal with Note */}
      {selectedJournalToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Catatan Bimbingan Jurnal: {selectedJournalToReview.studentName}
            </h3>
            <textarea
              rows={4}
              value={teacherJournalNotes}
              onChange={(e) => setTeacherJournalNotes(e.target.value)}
              placeholder="Tuliskan catatan evaluasi atau instruksi revisi untuk siswa..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedJournalToReview(null)}
                className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleVerifyJournal(selectedJournalToReview.id, 'Rejected')}
                disabled={isUpdatingJournal}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                Kirim Revisi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent for interactive single-row grade editor
interface GradeRowEditorProps {
  student: StudentItem;
  classId: string;
  subjectId: string;
  existingGrade?: GradeRecord;
  onRefresh: () => void;
}

const GradeRowEditor: React.FC<GradeRowEditorProps> = ({
  student,
  classId,
  subjectId,
  existingGrade,
  onRefresh
}) => {
  const { success, error } = useToast();
  const [att, setAtt] = useState<number>(existingGrade?.attendanceScore ?? 90);
  const [tgs, setTgs] = useState<number>(existingGrade?.assignmentScore ?? 85);
  const [uts, setUts] = useState<number>(existingGrade?.utsScore ?? 80);
  const [uas, setUas] = useState<number>(existingGrade?.uasScore ?? 85);
  const [isSaving, setIsSaving] = useState(false);

  const final = Math.round((att * 0.45) + (tgs * 0.20) + (uts * 0.15) + (uas * 0.20));
  const predicate = final >= 88 ? 'A' : final >= 78 ? 'B' : final >= 65 ? 'C' : 'D';
  const studentName = student.fullName || (student as any).name || 'Siswa';

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const gradeRecord: any = {
        id: existingGrade?.id || `grd-${classId}-${student.id}-${subjectId}`,
        studentId: student.id,
        classId,
        subjectId,
        teacherId: (student as any).teacherId || 'tch-demo',
        semester: 'Ganjil',
        academicYearId: 'ay-2026-ganjil',
        attendanceScore: att,
        assignmentScore: tgs,
        utsScore: uts,
        uasScore: uas,
        finalScore: final,
        letterGrade: predicate as any,
        predicate: predicate === 'A' ? 'Sangat Baik' : predicate === 'B' ? 'Baik' : predicate === 'C' ? 'Cukup' : 'Kurang',
        notes: `Nilai akhir: ${final} (${predicate})`,
        createdAt: existingGrade?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveGrade(gradeRecord);
      success(`Nilai untuk ${studentName} berhasil disimpan!`);
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan nilai.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
        <div>{studentName}</div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-normal">NISN: {student.nisn || student.nis}</div>
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          min="0"
          max="100"
          value={att}
          onChange={(e) => setAtt(Number(e.target.value))}
          className="w-full p-1.5 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          min="0"
          max="100"
          value={tgs}
          onChange={(e) => setTgs(Number(e.target.value))}
          className="w-full p-1.5 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          min="0"
          max="100"
          value={uts}
          onChange={(e) => setUts(Number(e.target.value))}
          className="w-full p-1.5 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          min="0"
          max="100"
          value={uas}
          onChange={(e) => setUas(Number(e.target.value))}
          className="w-full p-1.5 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="py-3 px-2 text-center font-black text-blue-600 dark:text-blue-400 text-sm">
        {final}
      </td>
      <td className="py-3 px-2 text-center font-bold">
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          {predicate}
        </span>
      </td>
      <td className="py-3 px-2 text-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? '...' : 'Simpan'}
        </button>
      </td>
    </tr>
  );
};
