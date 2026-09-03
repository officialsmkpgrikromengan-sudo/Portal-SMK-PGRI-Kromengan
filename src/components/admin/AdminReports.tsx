import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Search, 
  BookOpen, 
  Building, 
  Briefcase, 
  GraduationCap, 
  Users, 
  UserCheck, 
  Award, 
  ClipboardCheck, 
  CheckCircle,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { 
  SchoolInfo, 
  StudentItem, 
  TeacherItem, 
  ClassItem, 
  MajorItem, 
  SubjectItem, 
  AcademicYearItem,
  AttendanceRecord,
  GradeRecord,
  CompanyItem,
  InternshipItem,
  InternshipJournal,
  InternshipMonitoring,
  InternshipGrade,
  JobItem,
  JobApplication,
  AlumniItem,
  TracerResponse,
  SystemSettings,
  ReportType
} from '../../types';
import { useToast } from '../../context/ToastContext';
import { logAuditEvent } from '../../lib/firebase';

interface AdminReportsProps {
  schoolInfo: SchoolInfo;
  studentsList: StudentItem[];
  teachersList: TeacherItem[];
  classesList: ClassItem[];
  majorsList: MajorItem[];
  subjectsList: SubjectItem[];
  academicYearsList: AcademicYearItem[];
  attendanceList: AttendanceRecord[];
  gradesList: GradeRecord[];
  companiesList: CompanyItem[];
  internshipsList: InternshipItem[];
  internshipJournalsList: InternshipJournal[];
  internshipMonitoringList: InternshipMonitoring[];
  internshipGradesList: InternshipGrade[];
  jobsList: JobItem[];
  jobApplicationsList: JobApplication[];
  alumniList: AlumniItem[];
  tracerResponsesList: TracerResponse[];
  systemSettings?: SystemSettings;
}

type ReportCategory = 'akademik' | 'pkl' | 'bkk' | 'alumni';

export const AdminReports: React.FC<AdminReportsProps> = ({
  schoolInfo,
  studentsList = [],
  teachersList = [],
  classesList = [],
  majorsList = [],
  subjectsList = [],
  academicYearsList = [],
  attendanceList = [],
  gradesList = [],
  companiesList = [],
  internshipsList = [],
  internshipJournalsList = [],
  internshipMonitoringList = [],
  internshipGradesList = [],
  jobsList = [],
  jobApplicationsList = [],
  alumniList = [],
  tracerResponsesList = [],
  systemSettings
}) => {
  const { success, info } = useToast();
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('akademik');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('academic_students');
  
  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterClassId, setFilterClassId] = useState('all');
  const [filterMajorId, setFilterMajorId] = useState('all');
  const [filterAcademicYearId, setFilterAcademicYearId] = useState('all');
  
  // Print Preview Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Map of Report Configs
  const reportOptions: Record<ReportCategory, { type: ReportType; title: string; desc: string; icon: React.ReactNode }[]> = {
    akademik: [
      { 
        type: 'academic_students', 
        title: 'Daftar Siswa Lengkap', 
        desc: 'Rekapitulasi seluruh data peserta didik aktif, kelas, NIS/NISN, dan program keahlian.',
        icon: <Users className="w-4 h-4 text-blue-600" />
      },
      { 
        type: 'academic_teachers', 
        title: 'Daftar Dewan Guru & Tenaga Kependidikan', 
        desc: 'Daftar tenaga pendidik beserta NIP/NUPTK, status, dan mata pelajaran yang diampu.',
        icon: <UserCheck className="w-4 h-4 text-emerald-600" />
      },
      { 
        type: 'academic_classes', 
        title: 'Data Rombongan Belajar (Kelas)', 
        desc: 'Data seluruh rombel, tingkat kelas, jurusan, serta penugasan guru wali kelas.',
        icon: <Layers className="w-4 h-4 text-violet-600" />
      },
      { 
        type: 'academic_grades_recap', 
        title: 'Rekapitulasi Nilai & Capaian Belajar', 
        desc: 'Daftar nilai akhir siswa per mata pelajaran, kehadiran, tugas, UTS, UAS, dan predikat kelulusan.',
        icon: <Award className="w-4 h-4 text-amber-600" />
      },
      { 
        type: 'academic_attendance_recap', 
        title: 'Rekapitulasi Presensi & Kehadiran', 
        desc: 'Laporan kehadiran berkala siswa (Hadir, Sakit, Izin, Alpa) dan persentase presensi.',
        icon: <ClipboardCheck className="w-4 h-4 text-indigo-600" />
      }
    ],
    pkl: [
      { 
        type: 'pkl_students_list', 
        title: 'Daftar Siswa PKL', 
        desc: 'Status penempatan magang siswa, periode mulai-selesai, dan perusahaan tempat praktik.',
        icon: <Users className="w-4 h-4 text-blue-600" />
      },
      { 
        type: 'pkl_companies_list', 
        title: 'Daftar Mitra Industri (DUDI)', 
        desc: 'Daftar seluruh perusahaan rekanan, PIC industri, kontak, alamat, dan kuota penerimaan.',
        icon: <Building className="w-4 h-4 text-emerald-600" />
      },
      { 
        type: 'pkl_placements_list', 
        title: 'Rekap Penempatan & Pembimbing', 
        desc: 'Pemetaan penempatan siswa magang beserta penetapan guru pembimbing sekolah.',
        icon: <Layers className="w-4 h-4 text-violet-600" />
      },
      { 
        type: 'pkl_monitoring_list', 
        title: 'Rekap Monitoring Guru Pembimbing', 
        desc: 'Catatan hasil kunjungan supervisi berkala guru pembimbing ke lokasi industri.',
        icon: <ClipboardCheck className="w-4 h-4 text-amber-600" />
      },
      { 
        type: 'pkl_grades_recap', 
        title: 'Rekapitulasi Nilai Akhir PKL', 
        desc: 'Nilai gabungan pembimbing industri dan pembimbing sekolah beserta predikat kelulusan.',
        icon: <Award className="w-4 h-4 text-indigo-600" />
      }
    ],
    bkk: [
      { 
        type: 'bkk_jobs_list', 
        title: 'Daftar Lowongan Kerja BKK', 
        desc: 'Publikasi informasi loker dari perusahaan mitra, kualifikasi, batas waktu, dan tipe kontrak.',
        icon: <Briefcase className="w-4 h-4 text-blue-600" />
      },
      { 
        type: 'bkk_applicants_list', 
        title: 'Rekap Pendaftar & Pelamar Kerja', 
        desc: 'Daftar pelamar kerja (siswa/alumni), kelengkapan berkas CV, kontak, dan posisi yang dilamar.',
        icon: <Users className="w-4 h-4 text-emerald-600" />
      },
      { 
        type: 'bkk_recruitment_results', 
        title: 'Hasil Rekrutmen & Penyerapan Kerja', 
        desc: 'Daftar pelamar yang dinyatakan lolos seleksi dan diterima bekerja di industri mitra.',
        icon: <CheckCircle className="w-4 h-4 text-violet-600" />
      }
    ],
    alumni: [
      { 
        type: 'alumni_database', 
        title: 'Database Alumni Lengkap', 
        desc: 'Data seluruh lulusan sekolah, tahun kelulusan, kontak, status karir, dan profil.',
        icon: <GraduationCap className="w-4 h-4 text-blue-600" />
      },
      { 
        type: 'alumni_tracer_study', 
        title: 'Hasil Survei Tracer Study', 
        desc: 'Rekapitulasi respon kuesioner pelacakan jejak alumni dan relevansi kurikulum vokasi.',
        icon: <ClipboardCheck className="w-4 h-4 text-emerald-600" />
      },
      { 
        type: 'alumni_employment_stats', 
        title: 'Statistik Keterserapan Lulusan (BMW)', 
        desc: 'Rasio persentase alumni bekerja, melanjutkan studi (kuliah), dan berwirausaha.',
        icon: <Award className="w-4 h-4 text-violet-600" />
      }
    ]
  };

  // Helper maps for lookups
  const classMap = useMemo(() => new Map(classesList.map(c => [c.id, c.name])), [classesList]);
  const majorMap = useMemo(() => new Map(majorsList.map(m => [m.id, m.name])), [majorsList]);
  const teacherMap = useMemo(() => new Map(teachersList.map(t => [t.id, t.fullName])), [teachersList]);
  const subjectMap = useMemo(() => new Map(subjectsList.map(s => [s.id, s.name])), [subjectsList]);
  const companyMap = useMemo(() => new Map(companiesList.map(c => [c.id, c.name])), [companiesList]);
  const studentMap = useMemo(() => new Map(studentsList.map(s => [s.id, s.fullName])), [studentsList]);
  const jobMap = useMemo(() => new Map(jobsList.map(j => [j.id, j.position])), [jobsList]);

  // Compute table headers and table data dynamically based on selectedReportType
  const reportData = useMemo(() => {
    let headers: string[] = [];
    let rows: any[] = [];
    let reportTitle = '';

    switch (selectedReportType) {
      case 'academic_students': {
        reportTitle = 'Laporan Data Induk Peserta Didik (Siswa)';
        headers = ['No', 'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Kelas', 'Program Keahlian', 'No. HP', 'Status'];
        let filtered = studentsList;
        if (filterClassId !== 'all') filtered = filtered.filter(s => s.classId === filterClassId);
        if (filterMajorId !== 'all') filtered = filtered.filter(s => s.majorId === filterMajorId);
        if (searchKeyword) {
          const kw = searchKeyword.toLowerCase();
          filtered = filtered.filter(s => s.fullName.toLowerCase().includes(kw) || s.nis.includes(kw) || s.nisn.includes(kw));
        }
        rows = filtered.map((s, idx) => [
          idx + 1,
          s.nis,
          s.nisn,
          s.fullName,
          s.gender === 'Laki-laki' ? 'L' : 'P',
          classMap.get(s.classId) || s.classId,
          majorMap.get(s.majorId) || s.majorId,
          s.phone || '-',
          s.status
        ]);
        break;
      }

      case 'academic_teachers': {
        reportTitle = 'Laporan Data Dewan Guru & Tenaga Pendidik';
        headers = ['No', 'NIP / NUPTK', 'Nama Lengkap & Gelar', 'L/P', 'Email', 'No. HP', 'Mata Pelajaran', 'Status'];
        let filtered = teachersList;
        if (searchKeyword) {
          const kw = searchKeyword.toLowerCase();
          filtered = filtered.filter(t => t.fullName.toLowerCase().includes(kw) || t.nip.includes(kw) || t.email.toLowerCase().includes(kw));
        }
        rows = filtered.map((t, idx) => [
          idx + 1,
          t.nip || '-',
          t.fullName,
          t.gender === 'Laki-laki' ? 'L' : 'P',
          t.email,
          t.phone,
          t.subjectIds?.map(id => subjectMap.get(id) || id).join(', ') || '-',
          t.status
        ]);
        break;
      }

      case 'academic_classes': {
        reportTitle = 'Laporan Data Rombongan Belajar (Kelas)';
        headers = ['No', 'Nama Rombel', 'Tingkat', 'Program Keahlian', 'Guru Wali Kelas', 'Tahun Ajaran', 'Status'];
        let filtered = classesList;
        if (filterMajorId !== 'all') filtered = filtered.filter(c => c.majorId === filterMajorId);
        rows = filtered.map((c, idx) => [
          idx + 1,
          c.name,
          c.grade,
          majorMap.get(c.majorId) || c.majorId,
          c.homeroomTeacherId ? teacherMap.get(c.homeroomTeacherId) || c.homeroomTeacherId : '-',
          c.academicYear,
          c.status
        ]);
        break;
      }

      case 'academic_grades_recap': {
        reportTitle = 'Rekapitulasi Nilai & Capaian Belajar Siswa';
        headers = ['No', 'Nama Siswa', 'Mata Pelajaran', 'Kelas', 'Presensi (45%)', 'Tugas (20%)', 'UTS (15%)', 'UAS (20%)', 'Nilai Akhir', 'Huruf', 'Predikat'];
        let filtered = gradesList;
        if (filterClassId !== 'all') filtered = filtered.filter(g => g.classId === filterClassId);
        if (searchKeyword) {
          const kw = searchKeyword.toLowerCase();
          filtered = filtered.filter(g => (studentMap.get(g.studentId) || '').toLowerCase().includes(kw));
        }
        rows = filtered.map((g, idx) => [
          idx + 1,
          studentMap.get(g.studentId) || g.studentId,
          subjectMap.get(g.subjectId) || g.subjectId,
          classMap.get(g.classId) || g.classId,
          g.attendanceScore,
          g.assignmentScore,
          g.utsScore,
          g.uasScore,
          g.finalScore,
          g.letterGrade,
          g.predicate
        ]);
        break;
      }

      case 'academic_attendance_recap': {
        reportTitle = 'Laporan Rekapitulasi Presensi Siswa';
        headers = ['No', 'Tanggal', 'Rombel', 'Mata Pelajaran', 'Guru Pengampu', 'Total Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Tingkat Kehadiran'];
        let filtered = attendanceList;
        if (filterClassId !== 'all') filtered = filtered.filter(a => a.classId === filterClassId);
        rows = filtered.map((a, idx) => {
          const total = a.items?.length || 0;
          const hadir = a.items?.filter(i => i.status === 'Hadir').length || 0;
          const sakit = a.items?.filter(i => i.status === 'Sakit').length || 0;
          const izin = a.items?.filter(i => i.status === 'Izin').length || 0;
          const alpa = a.items?.filter(i => i.status === 'Alpa').length || 0;
          const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;
          return [
            idx + 1,
            a.date,
            classMap.get(a.classId) || a.classId,
            subjectMap.get(a.subjectId) || a.subjectId,
            teacherMap.get(a.teacherId) || a.teacherId,
            total,
            hadir,
            sakit,
            izin,
            alpa,
            `${pct}%`
          ];
        });
        break;
      }

      case 'pkl_students_list':
      case 'pkl_placements_list': {
        reportTitle = 'Laporan Penempatan & Siswa Praktik Kerja Lapangan (PKL)';
        headers = ['No', 'Nama Siswa', 'Perusahaan Mitra (DUDI)', 'Guru Pembimbing Sekolah', 'Pembimbing Industri', 'Mulai', 'Selesai', 'Status'];
        let filtered = internshipsList;
        if (searchKeyword) {
          const kw = searchKeyword.toLowerCase();
          filtered = filtered.filter(i => (studentMap.get(i.studentId) || '').toLowerCase().includes(kw) || (companyMap.get(i.companyId) || '').toLowerCase().includes(kw));
        }
        rows = filtered.map((i, idx) => [
          idx + 1,
          studentMap.get(i.studentId) || i.studentId,
          companyMap.get(i.companyId) || i.companyId,
          teacherMap.get(i.teacherId) || i.teacherId,
          i.industrySupervisor || '-',
          i.startDate,
          i.endDate,
          i.status
        ]);
        break;
      }

      case 'pkl_companies_list': {
        reportTitle = 'Daftar Rekanan Mitra Dunia Usaha & Dunia Industri (DUDI)';
        headers = ['No', 'Nama Perusahaan', 'Bidang Industri', 'Kota', 'Kontak Person', 'Telepon / WhatsApp', 'Email', 'Kuota', 'Status'];
        let filtered = companiesList;
        if (searchKeyword) {
          const kw = searchKeyword.toLowerCase();
          filtered = filtered.filter(c => c.name.toLowerCase().includes(kw) || c.city.toLowerCase().includes(kw));
        }
        rows = filtered.map((c, idx) => [
          idx + 1,
          c.name,
          c.industryType,
          c.city,
          c.contactPerson,
          c.phone,
          c.email,
          `${c.quota || 10} Siswa`,
          c.status
        ]);
        break;
      }

      case 'pkl_monitoring_list': {
        reportTitle = 'Laporan Supervisi & Monitoring Guru Pembimbing PKL';
        headers = ['No', 'Tanggal Kunjungan', 'Nama Siswa', 'Guru Pembimbing', 'Catatan & Evaluasi Industri', 'Status Evaluasi'];
        let filtered = internshipMonitoringList;
        rows = filtered.map((m, idx) => [
          idx + 1,
          m.visitDate,
          studentMap.get(m.studentId) || m.studentId,
          teacherMap.get(m.teacherId) || m.teacherId,
          `${m.notes} - ${m.evaluation}`,
          m.status
        ]);
        break;
      }

      case 'pkl_grades_recap': {
        reportTitle = 'Rekapitulasi Nilai Akhir Praktik Kerja Lapangan (PKL)';
        headers = ['No', 'Nama Siswa', 'Nilai Industri (60%)', 'Nilai Sekolah (40%)', 'Nilai Akhir', 'Predikat', 'Status'];
        let filtered = internshipGradesList;
        rows = filtered.map((g, idx) => [
          idx + 1,
          studentMap.get(g.studentId) || g.studentId,
          g.industryScore,
          g.teacherScore,
          g.finalScore,
          g.predicate,
          g.isPublished ? 'Terbit' : 'Draft'
        ]);
        break;
      }

      case 'bkk_jobs_list': {
        reportTitle = 'Laporan Informasi Lowongan Kerja Bursa Kerja Khusus (BKK)';
        headers = ['No', 'Posisi Lowongan', 'Perusahaan Mitra', 'Tipe Pekerjaan', 'Lokasi', 'Info Gaji', 'Batas Pendaftaran', 'Status'];
        let filtered = jobsList;
        rows = filtered.map((j, idx) => [
          idx + 1,
          j.position,
          companyMap.get(j.companyId) || j.companyId,
          j.employmentType,
          j.location,
          j.salaryInfo,
          j.deadline,
          j.status
        ]);
        break;
      }

      case 'bkk_applicants_list':
      case 'bkk_recruitment_results': {
        reportTitle = 'Laporan Pendaftar & Rekapitulasi Seleksi Kerja BKK';
        headers = ['No', 'Nama Pelamar', 'Posisi yang Dilamar', 'Email', 'No. WhatsApp', 'Tanggal Lamar', 'Status Seleksi'];
        let filtered = jobApplicationsList;
        if (selectedReportType === 'bkk_recruitment_results') {
          filtered = filtered.filter(a => a.status === 'Lolos');
        }
        if (searchKeyword) {
          const kw = searchKeyword.toLowerCase();
          filtered = filtered.filter(a => a.applicantName.toLowerCase().includes(kw));
        }
        rows = filtered.map((a, idx) => [
          idx + 1,
          a.applicantName,
          jobMap.get(a.jobId) || a.jobId,
          a.applicantEmail,
          a.applicantPhone,
          new Date(a.appliedAt).toLocaleDateString('id-ID'),
          a.status
        ]);
        break;
      }

      case 'alumni_database':
      case 'alumni_employment_stats': {
        reportTitle = 'Laporan Database & Keterserapan Alumni (Tracer)';
        headers = ['No', 'Nama Lengkap Alumni', 'Tahun Lulus', 'Program Keahlian', 'Status Karir', 'Tempat Kerja / Perguruan Tinggi', 'Jabatan / Prodi', 'Kontak No. HP'];
        let filtered = alumniList;
        if (filterMajorId !== 'all') filtered = filtered.filter(a => a.majorId === filterMajorId);
        if (searchKeyword) {
          const kw = searchKeyword.toLowerCase();
          filtered = filtered.filter(a => a.name.toLowerCase().includes(kw) || a.currentCompany?.toLowerCase().includes(kw));
        }
        rows = filtered.map((a, idx) => [
          idx + 1,
          a.name,
          a.graduationYear,
          majorMap.get(a.majorId) || a.majorId,
          a.status,
          a.currentCompany || a.higherEducation || '-',
          a.position || '-',
          a.phone
        ]);
        break;
      }

      case 'alumni_tracer_study': {
        reportTitle = 'Laporan Umpan Balik Responden Tracer Study';
        headers = ['No', 'Nama Alumni', 'Tahun Lulus', 'Status Terkini', 'Masa Tunggu Kerja', 'Relevansi Jurusan', 'Rentang Gaji', 'Tanggal Submit'];
        let filtered = tracerResponsesList;
        rows = filtered.map((r, idx) => [
          idx + 1,
          r.alumniName,
          r.graduationYear,
          r.answers?.q1 || '-',
          r.answers?.q2 || '-',
          r.answers?.q3 || '-',
          r.answers?.q4 || '-',
          new Date(r.submittedAt).toLocaleDateString('id-ID')
        ]);
        break;
      }

      default:
        reportTitle = 'Laporan Sekolah';
        headers = ['No', 'Data'];
        rows = [];
    }

    return {
      reportTitle,
      headers,
      rows
    };
  }, [
    selectedReportType,
    studentsList,
    teachersList,
    classesList,
    gradesList,
    attendanceList,
    internshipsList,
    companiesList,
    internshipMonitoringList,
    internshipGradesList,
    jobsList,
    jobApplicationsList,
    alumniList,
    tracerResponsesList,
    filterClassId,
    filterMajorId,
    searchKeyword,
    classMap,
    majorMap,
    teacherMap,
    subjectMap,
    companyMap,
    studentMap,
    jobMap
  ]);

  // Export CSV Function (Excel Compatible with UTF-8 BOM)
  const handleExportCsv = () => {
    try {
      const { reportTitle, headers, rows } = reportData;
      if (rows.length === 0) {
        info('Tidak ada data pada laporan ini untuk diekspor.');
        return;
      }

      // Build CSV string with escaping
      const csvRows: string[] = [];
      
      // Header metadata
      csvRows.push(`"${schoolInfo.name}"`);
      csvRows.push(`"${reportTitle}"`);
      csvRows.push(`"Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}"`);
      csvRows.push(''); // Empty line

      // Table Column headers
      csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

      // Table Data rows
      rows.forEach(row => {
        const escaped = row.map((cell: any) => {
          const str = cell !== undefined && cell !== null ? String(cell) : '';
          return `"${str.replace(/"/g, '""')}"`;
        });
        csvRows.push(escaped.join(','));
      });

      const csvContent = '\uFEFF' + csvRows.join('\r\n'); // Add UTF-8 BOM for Excel
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `Laporan_${selectedReportType}_${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logAuditEvent('EXPORT', 'Laporan', selectedReportType, `Mengekspor laporan CSV: ${reportTitle}`);
      success(`Laporan "${reportTitle}" berhasil diunduh dalam format CSV/Excel.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Browser Print trigger
  const handleTriggerPrint = () => {
    logAuditEvent('PRINT', 'Laporan', selectedReportType, `Mencetak laporan resmi: ${reportData.reportTitle}`);
    window.print();
  };

  return (
    <div id="admin-reports-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Pusat Laporan & Rekapitulasi Resmi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sistem Laporan & Ekspor Data Terpadu
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1">
            Unduh laporan format CSV/Excel atau cetak dokumen resmi dengan kop surat sekolah berstandar A4.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-report-export-csv"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>

          <button
            id="btn-report-print-preview"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Format Cetak (Kop Surat)</span>
          </button>
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setActiveCategory('akademik');
            setSelectedReportType('academic_students');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeCategory === 'akademik'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">5 Jenis</span>
          </div>
          <h3 className="text-xs font-bold text-slate-800">1. Laporan Akademik</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Siswa, guru, rombel, nilai & absensi</p>
        </button>

        <button
          onClick={() => {
            setActiveCategory('pkl');
            setSelectedReportType('pkl_students_list');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeCategory === 'pkl'
              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">5 Jenis</span>
          </div>
          <h3 className="text-xs font-bold text-slate-800">2. Laporan PKL</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Mitra DUDI, penempatan, monitoring & nilai</p>
        </button>

        <button
          onClick={() => {
            setActiveCategory('bkk');
            setSelectedReportType('bkk_jobs_list');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeCategory === 'bkk'
              ? 'bg-violet-50/80 border-violet-500 ring-2 ring-violet-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-violet-100 text-violet-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">3 Jenis</span>
          </div>
          <h3 className="text-xs font-bold text-slate-800">3. Laporan BKK</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Lowongan, pendaftar & penyerapan kerja</p>
        </button>

        <button
          onClick={() => {
            setActiveCategory('alumni');
            setSelectedReportType('alumni_database');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeCategory === 'alumni'
              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">3 Jenis</span>
          </div>
          <h3 className="text-xs font-bold text-slate-800">4. Laporan Alumni</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Database lulusan, tracer study & BMW</p>
        </button>
      </div>

      {/* Specific Sub-report options */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Pilih Format Laporan {activeCategory.toUpperCase()}:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportOptions[activeCategory].map(item => (
            <button
              key={item.type}
              onClick={() => setSelectedReportType(item.type)}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                selectedReportType === item.type
                  ? 'bg-blue-50/60 border-blue-500 text-blue-900 shadow-xs font-semibold'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="p-2 rounded-lg bg-white shadow-xs shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{item.title}</div>
                <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Live Preview Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Cari dalam laporan..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(selectedReportType === 'academic_students' || selectedReportType === 'academic_grades_recap' || selectedReportType === 'academic_attendance_recap') && (
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
            >
              <option value="all">Semua Kelas</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {(selectedReportType === 'academic_students' || selectedReportType === 'academic_classes' || selectedReportType === 'alumni_database') && (
            <select
              value={filterMajorId}
              onChange={(e) => setFilterMajorId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
            >
              <option value="all">Semua Program Keahlian</option>
              {majorsList.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.shortName})</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Menampilkan <strong className="text-slate-800">{reportData.rows.length}</strong> baris data</span>
        </div>
      </div>

      {/* Live Data Table Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">{reportData.reportTitle}</h3>
          </div>
          <span className="text-[11px] text-slate-500">Live Database Preview</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                {reportData.headers.map((h, i) => (
                  <th key={i} className="p-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length} className="p-8 text-center text-slate-400">
                    Tidak ada data yang sesuai dengan filter atau kata kunci yang dipilih.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    {row.map((cell: any, cIdx: number) => (
                      <td key={cIdx} className="p-3 whitespace-nowrap">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT PREVIEW MODAL (Official School Letterhead) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold">Pratinjau Cetak Dokumen Resmi (Format A4)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Sekarang</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto bg-slate-100 flex justify-center">
              <div id="official-printable-doc" className="bg-white p-8 rounded-lg shadow-md max-w-3xl w-full text-slate-900 text-xs font-sans space-y-6">
                {/* Official Letterhead (KOP SURAT) */}
                <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-4 text-center">
                  <div className="w-16 h-16 rounded-xl bg-blue-900 text-white flex items-center justify-center font-extrabold text-xl shrink-0">
                    PGRI
                  </div>
                  <div className="flex-1 text-center space-y-0.5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      YAYASAN PEMBINA LEMBAGA PENDIDIKAN DASAR DAN MENENGAH (YPLP DIKDASMEN)
                    </h2>
                    <h1 className="text-base font-extrabold uppercase text-blue-900 tracking-tight">
                      {schoolInfo.name}
                    </h1>
                    <p className="text-[10px] text-slate-600">
                      NPSN: {schoolInfo.npsn} | Akreditasi: {schoolInfo.accreditation}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {schoolInfo.address}, {schoolInfo.city}, {schoolInfo.province} | Telp: {schoolInfo.phone} | Email: {schoolInfo.email}
                    </p>
                  </div>
                </div>

                {/* Document Title & Metadata */}
                <div className="text-center space-y-1 py-2">
                  <h3 className="text-sm font-bold uppercase underline underline-offset-4 text-slate-900">
                    {reportData.reportTitle}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Periode Tahun Ajaran: 2026/2027 | Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </p>
                </div>

                {/* Printable Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-400 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        {reportData.headers.map((h, i) => (
                          <th key={i} className="border border-slate-400 p-2 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.rows.slice(0, 50).map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell: any, cIdx: number) => (
                            <td key={cIdx} className="border border-slate-400 p-2">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.rows.length > 50 && (
                    <p className="text-[9px] text-slate-400 italic mt-1 text-right">
                      * Menampilkan 50 baris pertama untuk pratinjau cetak. Gunakan ekspor CSV untuk data lengkap.
                    </p>
                  )}
                </div>

                {/* Signatures */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px]">
                  <div className="space-y-12">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Kepala Sekolah</p>
                    </div>
                    <div>
                      <p className="font-bold underline">{schoolInfo.headmasterName}</p>
                      <p className="text-slate-500">NIP: 19740512 200003 1 002</p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <p>{schoolInfo.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold">Petugas / Administrator</p>
                    </div>
                    <div>
                      <p className="font-bold underline">Administrator Sistem</p>
                      <p className="text-slate-500">NIP / NUPTK: -</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
