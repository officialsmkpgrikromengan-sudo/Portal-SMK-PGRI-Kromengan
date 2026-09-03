import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Award, 
  Briefcase, 
  FileText, 
  User, 
  LogOut, 
  Globe, 
  Plus, 
  Camera, 
  Download, 
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Sparkles,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { 
  StudentItem, 
  ScheduleItem, 
  AttendanceRecord, 
  GradeRecord, 
  InternshipItem, 
  InternshipJournal, 
  InternshipGrade, 
  JobItem, 
  SchoolInfo,
  ClassItem,
  MajorItem,
  SubjectItem,
  TeacherItem,
  SystemSettings
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { saveInternshipJournal, submitJobApplication, fileToDataUrl } from '../../lib/firebase';

interface StudentPortalProps {
  schoolInfo: SchoolInfo;
  studentsList: StudentItem[];
  classesList: ClassItem[];
  majorsList: MajorItem[];
  subjectsList: SubjectItem[];
  teachersList: TeacherItem[];
  schedulesList: ScheduleItem[];
  attendanceList: AttendanceRecord[];
  gradesList: GradeRecord[];
  internshipsList: InternshipItem[];
  internshipJournalsList: InternshipJournal[];
  internshipGradesList: InternshipGrade[];
  jobsList: JobItem[];
  systemSettings?: SystemSettings;
  onBackToPublic: () => void;
  onRefreshAll: () => void;
}

type StudentTab = 'dashboard' | 'schedules' | 'attendance' | 'grades' | 'pkl' | 'jobs';

export const StudentPortal: React.FC<StudentPortalProps> = ({
  schoolInfo,
  studentsList = [],
  classesList = [],
  majorsList = [],
  subjectsList = [],
  teachersList = [],
  schedulesList = [],
  attendanceList = [],
  gradesList = [],
  internshipsList = [],
  internshipJournalsList = [],
  internshipGradesList = [],
  jobsList = [],
  systemSettings,
  onBackToPublic,
  onRefreshAll
}) => {
  const { user, currentUserAccount, logout } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');

  // Match current student record by studentId, NISN, NIS, or email
  const currentStudent = studentsList.find(s => 
    (currentUserAccount?.studentId && s.id === currentUserAccount.studentId) ||
    (currentUserAccount?.username && (s.nisn === currentUserAccount.username || s.nis === currentUserAccount.username)) ||
    (currentUserAccount?.email && s.email && s.email.toLowerCase() === currentUserAccount.email.toLowerCase()) ||
    s.id === 'std-1' // fallback for demo
  ) || studentsList[0];

  // Relational data
  const studentClass = classesList.find(c => c.id === currentStudent?.classId);
  const studentMajor = majorsList.find(m => m.id === currentStudent?.majorId);
  const classWali = teachersList.find(t => t.id === studentClass?.homeroomTeacherId);

  // Student specific datasets
  const studentSchedules = schedulesList.filter(s => s.classId === currentStudent?.classId);
  const studentAttendance = attendanceList.filter(a => a.studentId === currentStudent?.id);
  const studentGrades = gradesList.filter(g => g.studentId === currentStudent?.id);
  const studentInternship = internshipsList.find(i => i.studentId === currentStudent?.id);
  const studentJournals = internshipJournalsList.filter(j => j.studentId === currentStudent?.id);
  const studentInternGrade = internshipGradesList.find(ig => ig.internshipId === studentInternship?.id);

  // Quick stats calculation
  const totalAttendance = studentAttendance.length;
  const hadirCount = studentAttendance.filter(a => a.status === 'Hadir').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((hadirCount / totalAttendance) * 100) : 95;

  const totalGrades = studentGrades.length;
  const avgFinalGrade = totalGrades > 0
    ? (studentGrades.reduce((sum, g) => sum + (g.finalScore ?? (g as any).finalGrade ?? 0), 0) / totalGrades).toFixed(1)
    : '86.5';

  // State: New Journal Form
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalActivities, setJournalActivities] = useState('');
  const [journalStartTime, setJournalStartTime] = useState('08:00');
  const [journalEndTime, setJournalEndTime] = useState('16:00');
  const [journalPhoto, setJournalPhoto] = useState<string | null>(null);
  const [isSubmittingJournal, setIsSubmittingJournal] = useState(false);

  // State: Apply Job Form
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [applicantNote, setApplicantNote] = useState('');
  const [applicantCvUrl, setApplicantCvUrl] = useState('');
  const [isSubmittingJobApp, setIsSubmittingJobApp] = useState(false);

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInternship) {
      error('Anda belum terdaftar dalam penempatan PKL aktif.');
      return;
    }
    if (!journalActivities.trim()) {
      error('Deskripsi kegiatan harian wajib diisi.');
      return;
    }

    try {
      setIsSubmittingJournal(true);
      const newJournal: any = {
        id: `jr-${Date.now()}`,
        internshipId: studentInternship.id,
        studentId: currentStudent.id,
        date: journalDate,
        activity: journalActivities.trim().slice(0, 50) || 'Kegiatan PKL',
        description: journalActivities.trim(),
        attachment: journalPhoto || undefined,
        status: 'Menunggu Verifikasi',
        createdAt: new Date().toISOString()
      };

      await saveInternshipJournal(newJournal);
      success('Jurnal harian PKL berhasil dikirim untuk diverifikasi guru pembimbing!');
      setShowAddJournalModal(false);
      setJournalActivities('');
      setJournalPhoto(null);
      onRefreshAll();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan jurnal PKL.');
    } finally {
      setIsSubmittingJournal(false);
    }
  };

  const handleApplyJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      setIsSubmittingJobApp(true);
      await submitJobApplication({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyName: selectedJob.companyName,
        applicantName: currentStudent.name,
        applicantEmail: currentStudent.email || `${currentStudent.nis}@siswa.smkpgri.sch.id`,
        applicantPhone: currentStudent.phone || '081234567890',
        coverLetter: applicantNote.trim(),
        cvUrl: applicantCvUrl.trim() || undefined,
        status: 'Terdaftar'
      });

      success(`Lamaran untuk posisi "${selectedJob.title}" di ${selectedJob.companyName} berhasil dikirim!`);
      setSelectedJob(null);
      setApplicantNote('');
      setApplicantCvUrl('');
      onRefreshAll();
    } catch (err) {
      console.error(err);
      error('Gagal mengirim lamaran.');
    } finally {
      setIsSubmittingJobApp(false);
    }
  };

  return (
    <div id="student-portal" className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Top Student Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand / Role */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Portal Siswa</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Siswa Aktif
                  </span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {schoolInfo.name}
                </p>
              </div>
            </div>

            {/* Right User Controls */}
            <div className="flex items-center gap-3">
              <button
                id="btn-student-back-web"
                onClick={onBackToPublic}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website Publik</span>
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="w-9 h-9 rounded-full bg-blue-700 border-2 border-blue-500 flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-xs">
                  {currentStudent.photoUrl ? (
                    <img src={currentStudent.photoUrl} alt={currentStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    currentStudent.name.charAt(0)
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[160px]">
                    {currentStudent.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    NIS: {currentStudent.nis} • {studentClass?.name || 'Kelas XII'}
                  </div>
                </div>

                <button
                  id="btn-student-logout"
                  onClick={logout}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all border border-rose-500/20 ml-1"
                  title="Keluar dari Portal Siswa"
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Ringkasan</span>
            </button>

            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'schedules'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Jadwal Pelajaran</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Presensi Saya</span>
            </button>

            <button
              onClick={() => setActiveTab('grades')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'grades'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Rapor & Nilai</span>
            </button>

            <button
              onClick={() => setActiveTab('pkl')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'pkl'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>PKL Saya</span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'jobs'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Bursa Kerja BKK</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Student Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* =========================================================
            TAB 1: DASHBOARD RINGKASAN
        ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Student ID Hero Card */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0 shadow-lg">
                    {currentStudent.photoUrl ? (
                      <img src={currentStudent.photoUrl} alt={currentStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-blue-300">
                        {currentStudent.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-bold border border-blue-400/30">
                      <span>NISN: {currentStudent.nisn || '-'}</span>
                      <span>•</span>
                      <span>NIS: {currentStudent.nis}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {currentStudent.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-200 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{studentClass?.name || 'Kelas XII RPL 1'}</span>
                      <span>•</span>
                      <span>{studentMajor?.name || 'Rekayasa Perangkat Lunak'}</span>
                    </p>
                    {classWali && (
                      <p className="text-xs text-slate-300">
                        Wali Kelas: <strong className="text-white">{classWali.name}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 shrink-0">
                  <div className="text-center px-2">
                    <div className="text-[10px] uppercase tracking-wider text-blue-300 font-bold">Rata Nilai</div>
                    <div className="text-lg sm:text-xl font-extrabold text-white">{avgFinalGrade}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Sangat Baik</div>
                  </div>
                  <div className="text-center px-2 border-x border-white/10">
                    <div className="text-[10px] uppercase tracking-wider text-blue-300 font-bold">Kehadiran</div>
                    <div className="text-lg sm:text-xl font-extrabold text-white">{attendanceRate}%</div>
                    <div className="text-[10px] text-blue-300 font-medium">{hadirCount} Sesi</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-[10px] uppercase tracking-wider text-blue-300 font-bold">Status PKL</div>
                    <div className="text-lg sm:text-xl font-extrabold text-amber-300">
                      {studentInternship ? 'Ditempatkan' : 'Persiapan'}
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      {studentJournals.length} Jurnal
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Jadwal Hari Ini */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Jadwal Kelas Saya
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('schedules')}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-2.5">
                  {studentSchedules.slice(0, 3).map((sch) => {
                    const subj = subjectsList.find(s => s.id === sch.subjectId);
                    const tch = teachersList.find(t => t.id === sch.teacherId);
                    return (
                      <div key={sch.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {subj?.name || 'Mata Pelajaran'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {tch?.name || 'Guru'} • {sch.room || 'R. Teori'}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                          {sch.day}, {sch.startTime}
                        </span>
                      </div>
                    );
                  })}
                  {studentSchedules.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada jadwal untuk kelas ini.</p>
                  )}
                </div>
              </div>

              {/* Card 2: PKL Status & Jurnal */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Jurnal Praktik PKL
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('pkl')}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Buka PKL
                  </button>
                </div>

                {studentInternship ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
                      <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        {studentInternship.companyName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Pembimbing: {studentInternship.industryMentorName || 'Pembimbing DUDI'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('pkl');
                        setShowAddJournalModal(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tulis Jurnal Kegiatan Harian</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-slate-500">Anda belum dialokasikan ke mitra DUDI PKL.</p>
                    <span className="text-[11px] font-bold text-blue-600">Hubungi Koordinator Pokja PKL</span>
                  </div>
                )}
              </div>

              {/* Card 3: Info Karir & Lowongan BKK */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Peluang Karir BKK
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('jobs')}
                    className="text-xs text-amber-600 font-bold hover:underline"
                  >
                    Lihat Semua ({jobsList.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {jobsList.slice(0, 2).map((job) => (
                    <div key={job.id} className="p-3 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{job.title}</span>
                        <span className="text-[10px] text-amber-600 font-bold">{job.type}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {job.companyName} • {job.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: JADWAL PELAJARAN
        ========================================================= */}
        {activeTab === 'schedules' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Jadwal Pelajaran Kelas {studentClass?.name || 'XII RPL 1'}
                </h3>
                <p className="text-xs text-slate-500">
                  Tahun Ajaran 2026/2027 • Semester Ganjil
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                    <th className="py-3 px-4">Hari</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4">Ruangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {studentSchedules.map((sch) => {
                    const subj = subjectsList.find(s => s.id === sch.subjectId);
                    const tch = teachersList.find(t => t.id === sch.teacherId);
                    return (
                      <tr key={sch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{sch.day}</td>
                        <td className="py-3 px-4 font-medium">{sch.startTime} - {sch.endTime}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{subj?.name || '-'}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{tch?.name || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                            {sch.room || 'R. Teori'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {studentSchedules.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        Belum ada jadwal yang diplot untuk kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: PRESENSI SAYA
        ========================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-bold uppercase">Tingkat Kehadiran</div>
                <div className="text-2xl font-black text-blue-600 mt-1">{attendanceRate}%</div>
                <div className="text-[10px] text-slate-500">Persentase Absensi</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-bold uppercase">Hadir</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{hadirCount}</div>
                <div className="text-[10px] text-slate-500">Pertemuan Hadir</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-bold uppercase">Sakit / Izin</div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {studentAttendance.filter(a => a.status === 'Sakit' || a.status === 'Izin').length}
                </div>
                <div className="text-[10px] text-slate-500">Izin Resmi</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-bold uppercase">Alpa</div>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {studentAttendance.filter(a => a.status === 'Alpa').length}
                </div>
                <div className="text-[10px] text-slate-500">Tanpa Keterangan</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Riwayat Presensi Siswa
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Mata Pelajaran</th>
                      <th className="py-3 px-4">Status Kehadiran</th>
                      <th className="py-3 px-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {studentAttendance.map((att) => {
                      const subj = subjectsList.find(s => s.id === att.subjectId);
                      return (
                        <tr key={att.id}>
                          <td className="py-3 px-4 font-semibold">{att.date}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{subj?.name || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              att.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                              att.status === 'Sakit' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                              att.status === 'Izin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                              'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{att.notes || '-'}</td>
                        </tr>
                      );
                    })}
                    {studentAttendance.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400">
                          Belum ada catatan presensi untuk akun ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: RAPOR & NILAI
        ========================================================= */}
        {activeTab === 'grades' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transkrip Nilai Akademik Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Perhitungan: Presensi (45%) + Tugas (20%) + UTS (15%) + UAS (20%)
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase">Rata-Rata Nilai Akhir</div>
                <div className="text-2xl font-black text-blue-600">{avgFinalGrade}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4 text-center">Presensi (45%)</th>
                    <th className="py-3 px-4 text-center">Tugas (20%)</th>
                    <th className="py-3 px-4 text-center">UTS (15%)</th>
                    <th className="py-3 px-4 text-center">UAS (20%)</th>
                    <th className="py-3 px-4 text-center">Nilai Akhir</th>
                    <th className="py-3 px-4 text-center">Predikat</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {studentGrades.map((grd) => {
                    const subj = subjectsList.find(s => s.id === grd.subjectId);
                    const kkm = systemSettings?.kkmStandard || 75;
                    const finalVal = grd.finalScore ?? (grd as any).finalGrade ?? 0;
                    const isPassed = finalVal >= kkm;

                    return (
                      <tr key={grd.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {subj?.name || 'Mata Pelajaran'}
                        </td>
                        <td className="py-3 px-4 text-center">{grd.attendanceScore}</td>
                        <td className="py-3 px-4 text-center">{grd.assignmentScore}</td>
                        <td className="py-3 px-4 text-center">{grd.utsScore}</td>
                        <td className="py-3 px-4 text-center">{grd.uasScore}</td>
                        <td className="py-3 px-4 text-center font-black text-blue-600 dark:text-blue-400 text-sm">
                          {finalVal}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                            {grd.letterGrade || grd.predicate || 'B'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {isPassed ? 'LULUS (KKM)' : 'REMIDIAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {studentGrades.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        Belum ada input nilai rapor untuk akun ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: PKL SAYA
        ========================================================= */}
        {activeTab === 'pkl' && (
          <div className="space-y-6">
            {/* PKL Placement Details Card */}
            {studentInternship ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                      Penempatan PKL Aktif
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {studentInternship.companyName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Periode: {studentInternship.startDate} s/d {studentInternship.endDate}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddJournalModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tulis Jurnal Harian Baru</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <div className="text-slate-400 font-medium">Pembimbing Sekolah</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {studentInternship.schoolMentorName}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <div className="text-slate-400 font-medium">Pembimbing DUDI / Industri</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {studentInternship.industryMentorName || 'Bpk. Hendra (Koordinator IT)'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <div className="text-slate-400 font-medium">Nilai Akhir Sertifikat PKL</div>
                    <div className="font-black text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                      {studentInternGrade ? `${studentInternGrade.totalScore} (${studentInternGrade.predicate})` : 'Sedang Berjalan'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center space-y-3 border border-slate-200 dark:border-slate-800">
                <Building className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Belum Ada Penempatan PKL
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Data penempatan tempat Praktik Kerja Lapangan (PKL) akan diatur oleh Tim Pokja Hubin & PKL Sekolah.
                </p>
              </div>
            )}

            {/* Daily Journals List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daftar Jurnal Harian Kegiatan Siswa ({studentJournals.length})
              </h3>

              <div className="space-y-3">
                {studentJournals.map((j) => (
                  <div key={j.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{j.date}</span>
                        <span className="text-[11px] text-slate-500">({j.startTime} - {j.endTime})</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        j.status === 'Approved' || (j.status as any) === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                        j.status === 'Rejected' || (j.status as any) === 'Ditolak' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {j.status === 'Approved' || (j.status as any) === 'Disetujui' ? 'Disetujui Guru' :
                         j.status === 'Rejected' || (j.status as any) === 'Ditolak' ? 'Perlu Revisi' : 'Menunggu Verifikasi'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {j.description || j.activityDescription || (j as any).activity || 'Catatan kegiatan PKL.'}
                    </p>

                    {j.teacherNotes && (
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-[11px] border border-blue-200 dark:border-blue-900">
                        <strong>Catatan Guru:</strong> {j.teacherNotes}
                      </div>
                    )}
                  </div>
                ))}
                {studentJournals.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Belum ada catatan jurnal harian. Klik "Tulis Jurnal Harian Baru" untuk menambahkan.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 6: BURSA KERJA BKK
        ========================================================= */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-6 text-white shadow-lg space-y-1">
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Pusat Peluang Karir BKK SMK
              </h3>
              <p className="text-xs sm:text-sm text-amber-100">
                Lowongan kerja resmi terverifikasi dari mitra industri DUDI khusus untuk siswa dan alumni.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobsList.map((job) => (
                <div key={job.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-900">
                          {job.type}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {job.title}
                        </h4>
                        <div className="text-xs text-slate-500 font-medium">
                          {job.companyName}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                        {job.salaryRange || 'Gaji Menyesuaikan'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Batas Lamaran: <strong>{job.deadline}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Lamar Pekerjaan Ini</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Tulis Jurnal PKL */}
      {showAddJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tulis Jurnal Harian PKL
            </h3>
            
            <form onSubmit={handleSaveJournal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Kegiatan</label>
                <input
                  type="date"
                  value={journalDate}
                  onChange={(e) => setJournalDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Masuk</label>
                  <input
                    type="time"
                    value={journalStartTime}
                    onChange={(e) => setJournalStartTime(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Pulang</label>
                  <input
                    type="time"
                    value={journalEndTime}
                    onChange={(e) => setJournalEndTime(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rincian Kegiatan / Tugas</label>
                <textarea
                  rows={4}
                  value={journalActivities}
                  onChange={(e) => setJournalActivities(e.target.value)}
                  placeholder="Ceritakan pekerjaan atau proyek yang Anda kerjakan hari ini..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJournalModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJournal}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {isSubmittingJournal ? 'Menyimpan...' : 'Kirim Jurnal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Lamar Pekerjaan BKK */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Formulir Lamaran: {selectedJob.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perusahaan: <strong className="text-slate-700 dark:text-slate-200 font-bold">{selectedJob.companyName}</strong>
            </p>

            <form onSubmit={handleApplyJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={currentStudent.name}
                  disabled
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tautan CV / Google Drive</label>
                <input
                  type="url"
                  value={applicantCvUrl}
                  onChange={(e) => setApplicantCvUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Surat Pengantar / Motivasi</label>
                <textarea
                  rows={3}
                  value={applicantNote}
                  onChange={(e) => setApplicantNote(e.target.value)}
                  placeholder="Jelaskan secara singkat ketertarikan dan kesiapan Anda..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJobApp}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md"
                >
                  {isSubmittingJobApp ? 'Mengirim...' : 'Kirim Berkas Lamaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
