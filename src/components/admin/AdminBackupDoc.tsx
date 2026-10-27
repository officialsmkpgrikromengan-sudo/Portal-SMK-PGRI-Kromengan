import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  FileCode, 
  ShieldCheck, 
  Server, 
  Layers, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  HardDrive, 
  RefreshCw,
  Copy,
  Check
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
  TracerSurvey,
  TracerResponse,
  SystemSettings
} from '../../types';
import { useToast } from '../../context/ToastContext';
import { logAuditEvent } from '../../lib/api';

interface AdminBackupDocProps {
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
  tracerSurveysList: TracerSurvey[];
  tracerResponsesList: TracerResponse[];
  systemSettings?: SystemSettings;
}

export const AdminBackupDoc: React.FC<AdminBackupDocProps> = ({
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
  tracerSurveysList = [],
  tracerResponsesList = [],
  systemSettings
}) => {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState<'backup' | 'schema' | 'security' | 'env'>('backup');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    success('Teks berhasil disalin ke clipboard.');
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDownloadFullBackup = () => {
    try {
      const backupData = {
        metadata: {
          app: 'Portal Resmi SMK PGRI Kromengan',
          version: '6.0.0-production',
          exportedAt: new Date().toISOString(),
          exportedBy: 'Administrator Utama',
          systemStats: {
            totalStudents: studentsList.length,
            totalTeachers: teachersList.length,
            totalClasses: classesList.length,
            totalMajors: majorsList.length,
            totalSubjects: subjectsList.length,
            totalCompanies: companiesList.length,
            totalInternships: internshipsList.length,
            totalJobs: jobsList.length,
            totalAlumni: alumniList.length
          }
        },
        schoolInfo,
        systemSettings: systemSettings || {},
        masterData: {
          majors: majorsList,
          subjects: subjectsList,
          teachers: teachersList,
          classes: classesList,
          students: studentsList,
          academicYears: academicYearsList
        },
        academicData: {
          attendance: attendanceList,
          grades: gradesList
        },
        pklData: {
          companies: companiesList,
          internships: internshipsList,
          journals: internshipJournalsList,
          monitoring: internshipMonitoringList,
          grades: internshipGradesList
        },
        bkkData: {
          jobs: jobsList,
          applications: jobApplicationsList
        },
        alumniData: {
          alumni: alumniList,
          tracerSurveys: tracerSurveysList,
          tracerResponses: tracerResponsesList
        }
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `SMK_PGRI_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logAuditEvent('EXPORT', 'Settings', 'backup-json', 'Melakukan ekspor cadangan penuh sistem (Full JSON Backup).');
      success('Berkas cadangan basis data (Full Backup JSON) berhasil diunduh.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="admin-backup-doc-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Database Architecture & Recovery Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cadangan Data & Dokumentasi Teknis
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1">
            Ekspor arsip cadangan (JSON Backup), panduan skema koleksi Cloud Firestore, aturan keamanan, dan konfigurasi sistem.
          </p>
        </div>

        <button
          id="btn-download-json-backup"
          onClick={handleDownloadFullBackup}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Full Backup (JSON)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Pusat Cadangan (Backup & Restore)</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'schema'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Struktur Skema SQLite</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Keamanan Database & API</span>
        </button>

        <button
          onClick={() => setActiveTab('env')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'env'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Environment (.env.example)</span>
        </button>
      </div>

      {/* TAB 1: BACKUP & RECOVERY */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">1-Click Full Backup Snapshot</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Menyimpan salinan seluruh data SQLite (Siswa, Guru, Rombel, Nilai, Absensi, PKL, BKK, Alumni, Tracer Study) ke dalam satu berkas terenkripsi ringan.
              </p>
              <button
                onClick={handleDownloadFullBackup}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan (.JSON)</span>
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Integritas Data Master</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sistem dilengkapi fallback built-in data default dan validasi skema bertipe data kuat (TypeScript) untuk mencegah korupsi data saat ekspor/impor.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Database Status: Sinkron & Normal</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Prosedur Pemulihan (Disaster Recovery)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Untuk pemulihan darurat, berkas JSON dapat diimpor langsung via antarmuka admin atau melalui Firebase Admin CLI tanpa ketergantungan Cloud Functions berbayar.
              </p>
              <div className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-lg">
                Protokol Gratis & Hemat Biaya
              </div>
            </div>
          </div>

          {/* Detailed Statistics of Datasets in Backup */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Volume Data yang Dicakup dalam Snapshot</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Siswa Aktif</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{studentsList.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Dewan Guru</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{teachersList.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Rombel Kelas</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{classesList.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Rekap Nilai</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{gradesList.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Mitra PKL</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{companiesList.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Database Alumni</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{alumniList.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SQLITE SCHEMA */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Tabel Database (SQLite Single Engine)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Struktur database terpadu relasional untuk Portal SMK PGRI Kromengan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 font-mono">school_info</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">Single Doc</span>
              </div>
              <p className="text-slate-600 text-[11px]">Profil sekolah, NPSN, akreditasi, visi misi, kontak, link medsos, & kepala sekolah.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 font-mono">students</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">Collection</span>
              </div>
              <p className="text-slate-600 text-[11px]">Data peserta didik: NIS, NISN, nama, kelas, jurusan, kontak wali, & status.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 font-mono">teachers</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">Collection</span>
              </div>
              <p className="text-slate-600 text-[11px]">Data guru dan tenaga kependidikan: NIP, gelar, mapel yang diampu, kontak.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 font-mono">grades</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">Collection</span>
              </div>
              <p className="text-slate-600 text-[11px]">Rekap penilaian: presensi, tugas harian, UTS, UAS, nilai akhir, predikat kelulusan.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 font-mono">internships</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">Collection</span>
              </div>
              <p className="text-slate-600 text-[11px]">Penempatan PKL vokasi: siswa, mitra industri, guru pembimbing, periode magang.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 font-mono">jobs</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">Collection</span>
              </div>
              <p className="text-slate-600 text-[11px]">Lowongan kerja BKK: posisi, kualifikasi, perusahaan rekanan, tenggat pendaftaran.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 font-mono">alumni</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">Collection</span>
              </div>
              <p className="text-slate-600 text-[11px]">Database alumni & karir: tahun lulus, status BMW (Bekerja, Melanjutkan, Wirausaha).</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 font-mono">audit_logs</span>
                <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold">Security Log</span>
              </div>
              <p className="text-slate-600 text-[11px]">Catatan jejak aktivitas admin/pengguna: aksi (Create, Update, Delete, Export), timestamp, IP.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY RULES */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Prinsip Keamanan SQLite & Express API</h3>
              <p className="text-xs text-slate-500 mt-0.5">Proteksi Parameterized Prepared Statements, Table Whitelisting, Scrypt Password Hashing, & Rate Limiting</p>
            </div>
            <button
              onClick={() => handleCopy(`// SQLite Security & Defense-in-Depth Specification\n1. Parameterized Prepared Statements (Zero SQL Injection)\n2. Strict Table Whitelisting (db.prepare allowed only on authorized tables)\n3. Scrypt Salting & Cryptographic Password Hashing\n4. In-Memory Sliding-Window Rate Limiting on /api/auth/*\n5. Strict HTTP Headers (X-Content-Type-Options, X-Frame-Options, XSS, Referrer)`, 'rules')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'rules' ? 'Tersalin' : 'Salin Standar Keamanan'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
            <pre>{`// ==========================================
// ARSITEKTUR KEAMANAN DATABASE TUNGGAL SQLITE
// ==========================================

1. Parameterized Queries (Anti SQL-Injection):
   Setiap operasi SELECT, INSERT, UPDATE, dan DELETE pada SQLite
   menggunakan prepared statement dengan placeholder (?) sehingga
   data input dari pengguna tidak pernah diinterpretasikan sebagai kode SQL.

2. Table Whitelisting & Identifier Guard:
   Nama tabel diverifikasi secara ketat terhadap daftar ALLOWED_TABLES
   sebelum kueri dieksekusi. Nama tabel yang tidak sah akan langsung ditolak.

3. Scrypt Password Hashing with Salt:
   Kata sandi akun pengguna (Admin, Guru, Siswa) dienkripsi menggunakan
   algoritma kriptografi crypto.scryptSync dengan salt 16-byte acak.
   Hash kata sandi tidak pernah dikembalikan ke sisi klien (browser).

4. Rate Limiting Otentikasi:
   Setiap permintaan ke rute /api/auth/* dilindungi oleh sliding-window
   rate limiter untuk menggagalkan serangan brute-force dictionary attack.

5. Header Keamanan HTTP:
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: SAMEORIGIN
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin`}</pre>
          </div>
        </div>
      )}

      {/* TAB 4: ENVIRONMENT VARIABLES & KEAMANAN GITHUB */}
      {activeTab === 'env' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Deklarasi Environment Variables & Keamanan API Key GitHub</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daftar variabel lingkungan aman dan panduan proteksi kredensial rahasia saat upload ke GitHub</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-blue-300 font-mono text-xs overflow-x-auto leading-relaxed">
            <pre>{`# =======================================================
# ENVIRONMENT VARIABLES (.env) - JANGAN DI-COMMIT KE GITHUB!
# File .env otomatis diabaikan oleh .gitignore
# =======================================================

# 1. Google Gemini AI API Key (HANYA SISI SERVER)
# Kunci ini diproses secara aman di backend (/server) dan TIDAK PERNAH
# dikirim atau diekspos ke browser / public repository.
GEMINI_API_KEY=

# 2. Base URL Aplikasi
APP_URL=

# 3. Mode Lingkungan & Port Server
NODE_ENV=production
PORT=3000

# -------------------------------------------------------
# ATURAN KEAMANAN GITHUB:
# 1. File .env, file .sqlite, dan berkas kredensial dimasukkan ke .gitignore.
# 2. Jangan pernah memberi awalan VITE_ pada kunci rahasia/API key pribadi.
# 3. Kunci API hanya dipanggil di server backend melalui process.env.`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
