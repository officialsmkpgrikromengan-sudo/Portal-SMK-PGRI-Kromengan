import React from 'react';
import { 
  Newspaper, 
  CalendarDays, 
  Trophy, 
  Image as ImageIcon, 
  ArrowRight, 
  Sparkles, 
  Users,
  UserCheck,
  Building,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  ClipboardCheck,
  Award
} from 'lucide-react';
import { 
  NewsItem, 
  EventItem, 
  AchievementItem, 
  GalleryItem, 
  AdminSection,
  StudentItem,
  TeacherItem,
  ClassItem,
  MajorItem,
  SubjectItem,
  AcademicYearItem,
  ScheduleItem,
  AttendanceRecord,
  GradeRecord,
  CompanyItem,
  InternshipItem,
  JobItem,
  AlumniItem
} from '../../types';

interface AdminDashboardProps {
  newsList: NewsItem[];
  eventsList: EventItem[];
  achievementsList: AchievementItem[];
  galleryList: GalleryItem[];
  studentsList: StudentItem[];
  teachersList: TeacherItem[];
  classesList: ClassItem[];
  majorsList: MajorItem[];
  subjectsList: SubjectItem[];
  academicYearsList?: AcademicYearItem[];
  schedulesList?: ScheduleItem[];
  attendanceList?: AttendanceRecord[];
  gradesList?: GradeRecord[];
  companiesList?: CompanyItem[];
  internshipsList?: InternshipItem[];
  jobsList?: JobItem[];
  alumniList?: AlumniItem[];
  onNavigateSection: (section: AdminSection) => void;
  onOpenCreateNews: () => void;
  onOpenCreateEvent: () => void;
  onOpenCreateAchievement: () => void;
  onOpenCreateGallery: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
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
  companiesList = [],
  internshipsList = [],
  jobsList = [],
  alumniList = [],
  onNavigateSection,
  onOpenCreateNews,
  onOpenCreateEvent,
  onOpenCreateAchievement,
  onOpenCreateGallery
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEventsCount = (eventsList || []).filter(e => e.status === 'published' && e.date >= todayStr).length;
  const publishedNewsCount = (newsList || []).filter(n => n.status === 'published').length;

  const activeStudentsCount = (studentsList || []).filter(s => s.status === 'Aktif').length;
  const activeTeachersCount = (teachersList || []).filter(t => t.status === 'Aktif').length;
  const activeClassesCount = (classesList || []).filter(c => c.status === 'Aktif').length;
  const activeMajorsCount = (majorsList || []).filter(m => m.status === 'Aktif').length;
  const activeAcademicYear = (academicYearsList || []).find(ay => ay.isActive);

  return (
    <div id="admin-dashboard-view" className="space-y-8 animate-in fade-in duration-150">
      {/* 1. EXECUTIVE WELCOME & CONTEXT BANNER */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800/80">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Pusat Kendali Administrasi & Akademik</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Dashboard Utama Administrator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Periode Aktif: <span className="font-bold text-amber-300">{activeAcademicYear ? `${activeAcademicYear.name} (${activeAcademicYear.semester})` : '2026/2027'}</span>. Kelola operasional akademik, kemitraan PKL industri, rekrutmen BKK, dan publikasi web sekolah.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            id="btn-dash-mgmt"
            onClick={() => onNavigateSection('management')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Pusat Manajemen & KPI
          </button>
          <button
            id="btn-dash-reports"
            onClick={() => onNavigateSection('reports')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            Laporan Terpadu
          </button>
        </div>
      </div>

      {/* 2. CORE KPI METRIC STRIP (4 Primary Institutional Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Siswa */}
        <div 
          onClick={() => onNavigateSection('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Peserta Didik</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{studentsList.length}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              <strong className="text-emerald-600">{activeStudentsCount}</strong> siswa aktif • {classesList.length} rombel
            </div>
          </div>
        </div>

        {/* Metric 2: Guru & Tendik */}
        <div 
          onClick={() => onNavigateSection('teachers')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Guru & Tendik</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{teachersList.length}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              <strong className="text-indigo-600">{activeTeachersCount}</strong> pengajar aktif • {subjectsList.length} mapel
            </div>
          </div>
        </div>

        {/* Metric 3: PKL & DUDI */}
        <div 
          onClick={() => onNavigateSection('pkl')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">PKL & Industri</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{internshipsList.length}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              <strong className="text-emerald-600">{companiesList.length}</strong> mitra DUDI aktif
            </div>
          </div>
        </div>

        {/* Metric 4: BKK & Alumni */}
        <div 
          onClick={() => onNavigateSection('bkk')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">BKK & Karir</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{jobsList.length}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              <strong className="text-amber-600">{jobsList.filter(j => j.status === 'Open').length}</strong> lowongan aktif • {alumniList.length} alumni
            </div>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL MODULES (2 Columns: Akademik & Vokasi/Konten) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Modul Akademik & Pembelajaran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Layanan Akademik & KBM
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Pengelolaan jadwal, presensi kelas, dan nilai rapor</p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
              Fase 3
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => onNavigateSection('schedules')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/70 hover:border-indigo-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Jadwal Kelas</div>
                  <div className="text-[11px] text-slate-500">{schedulesList.length} sesi terplotting</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => onNavigateSection('attendance')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/70 hover:border-emerald-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Presensi Harian</div>
                  <div className="text-[11px] text-slate-500">{attendanceList.length} pertemuan</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => onNavigateSection('grades')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200/70 hover:border-amber-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Nilai & Rapor</div>
                  <div className="text-[11px] text-slate-500">{gradesList.length} rekaman nilai</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => onNavigateSection('academic_years')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Tahun Ajaran</div>
                  <div className="text-[11px] text-slate-500">{academicYearsList.length} periode kalender</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Modul Vokasi & Publikasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Vokasi, BKK & Publikasi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Monitoring PKL, bursa kerja, dan dokumentasi sekolah</p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
              Fase 5
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => onNavigateSection('pkl')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Monitoring PKL</div>
                  <div className="text-[11px] text-slate-500">{internshipsList.length} siswa magang</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => onNavigateSection('bkk')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/70 hover:border-emerald-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">BKK & Loker</div>
                  <div className="text-[11px] text-slate-500">{jobsList.length} peluang karir</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => onNavigateSection('news')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Berita & Warta</div>
                  <div className="text-[11px] text-slate-500">{newsList.length} publikasi ({publishedNewsCount} rilis)</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => onNavigateSection('events')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Agenda Sekolah</div>
                  <div className="text-[11px] text-slate-500">{upcomingEventsCount} kegiatan mendatang</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY PREVIEWS (Clean, High-Readability Tables/Lists) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students Added */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Peserta Didik Terkini
              </h3>
              <p className="text-xs text-slate-500">Pendaftaran dan data siswa terakhir</p>
            </div>
            <button
              onClick={() => onNavigateSection('students')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Daftar Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {(studentsList || []).slice(0, 4).map((student) => {
              const studentClass = (classesList || []).find(c => c.id === student.classId);
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {student.fullName}
                      </h4>
                      <span className="text-[11px] text-slate-500 block">
                        NIS: {student.nis} • {studentClass?.name || 'Kelas -'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                    student.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {student.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Publikasi Berita Terkini
              </h3>
              <p className="text-xs text-slate-500">Status rilis artikel dan pengumuman sekolah</p>
            </div>
            <button
              onClick={() => onNavigateSection('news')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Kelola Berita</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {newsList.slice(0, 4).map((news) => (
              <div
                key={news.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {news.title}
                  </h4>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {news.publishedAt} • {news.author}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                  news.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {news.status === 'published' ? 'Terbit' : 'Draf'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
