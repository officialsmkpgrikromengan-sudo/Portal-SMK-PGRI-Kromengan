export type ContentStatus = 'published' | 'draft';

export interface SchoolStats {
  students: number;
  teachers: number;
  majors: number;
  partnerships: number;
  accreditationYear: string;
}

export interface OrgMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  category: 'Pimpinan' | 'Wakil Kepala Sekolah' | 'Kepala Program' | 'Tata Usaha';
}

export interface FacilityItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  capacity?: string;
}

export interface VocationalProgram {
  id: string;
  name: string;
  code: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  imageUrl: string;
  jobProspects: string[];
  competencies: string[];
  headOfProgram?: string;
}

export interface SchoolSocials {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
}

export interface SchoolInfo {
  name: string;
  tagline: string;
  motto?: string;
  logoUrl?: string;
  npsn: string;
  accreditation: string;
  headmasterName: string;
  headmasterTitle: string;
  headmasterSpeech: string;
  headmasterPhoto: string;
  history: string;
  vision: string;
  missions: string[];
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  workingHours: string;
  mapsEmbedUrl: string;
  socials: SchoolSocials;
  stats: SchoolStats;
  facilities: FacilityItem[];
  organization: OrgMember[];
  programs: VocationalProgram[];
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  status: ContentStatus;
  thumbnailUrl: string;
  views?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: ContentStatus;
  posterUrl: string;
  registrationLink?: string;
  organizer?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AchievementLevel = 
  | 'Sekolah'
  | 'Kecamatan'
  | 'Kota/Kabupaten'
  | 'Provinsi'
  | 'Nasional'
  | 'Internasional';

export interface AchievementItem {
  id: string;
  title: string;
  studentName: string;
  level: AchievementLevel;
  rank: string;
  year: string;
  category: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export type GalleryCategory = 
  | 'Akademik'
  | 'Ekstrakurikuler'
  | 'Prestasi & Lomba'
  | 'Fasilitas'
  | 'Kegiatan Siswa'
  | 'Upacara & Event';

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  imageUrl: string;
  date: string;
  description?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

export type NavigationPage = 
  | 'home'
  | 'profile'
  | 'programs'
  | 'news'
  | 'events'
  | 'achievements'
  | 'gallery'
  | 'career'
  | 'contact';

export type AdminSection = 
  | 'dashboard'
  | 'management'
  | 'reports'
  | 'audit_logs'
  | 'users'
  | 'backup_doc'
  | 'academic_years'
  | 'schedules'
  | 'attendance'
  | 'grades'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'majors'
  | 'subjects'
  | 'pkl'
  | 'pkl_dashboard'
  | 'pkl_students'
  | 'pkl_companies'
  | 'pkl_placements'
  | 'pkl_teachers'
  | 'pkl_journals'
  | 'pkl_monitoring'
  | 'pkl_grades'
  | 'bkk'
  | 'bkk_dashboard'
  | 'bkk_companies'
  | 'bkk_jobs'
  | 'bkk_recruitment'
  | 'bkk_recap'
  | 'alumni'
  | 'alumni_list'
  | 'alumni_tracer'
  | 'alumni_stats'
  | 'school_info'
  | 'news'
  | 'events'
  | 'achievements'
  | 'gallery'
  | 'messages'
  | 'settings';

export type UserRole = 'admin' | 'guru' | 'siswa' | 'kepala_sekolah' | 'tu' | 'bkk' | 'public';

export type AccountStatus = 'Aktif' | 'Nonaktif';

export interface UserAccount {
  id: string; // userId / auth UID
  email: string;
  displayName: string;
  username?: string; // NIS for Siswa, NIP for Guru, or custom username
  initialPassword?: string; // Default password configured by admin
  role: UserRole;
  status: AccountStatus;
  phone?: string;
  photoUrl?: string;
  notes?: string;
  teacherId?: string;
  studentId?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT' | 'SETTINGS';

export type AuditModule = 
  | 'Akademik' 
  | 'Master Data' 
  | 'PKL' 
  | 'BKK' 
  | 'Alumni' 
  | 'CMS' 
  | 'Auth' 
  | 'Settings' 
  | 'Laporan'
  | 'Sistem';

export interface AuditLogItem {
  id: string; // logId
  userId: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  module: AuditModule;
  targetId?: string;
  targetName?: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

export type ReportType = 
  // Akademik
  | 'academic_students'
  | 'academic_teachers'
  | 'academic_classes'
  | 'academic_grades_recap'
  | 'academic_attendance_recap'
  // PKL
  | 'pkl_students_list'
  | 'pkl_companies_list'
  | 'pkl_placements_list'
  | 'pkl_monitoring_list'
  | 'pkl_grades_recap'
  // BKK
  | 'bkk_jobs_list'
  | 'bkk_applicants_list'
  | 'bkk_recruitment_results'
  // Alumni
  | 'alumni_database'
  | 'alumni_tracer_study'
  | 'alumni_employment_stats';

export type TeacherSection = 
  | 'dashboard'
  | 'schedule'
  | 'attendance'
  | 'attendance_recap'
  | 'grades'
  | 'profile';

export type StudentSection = 
  | 'dashboard'
  | 'schedule'
  | 'attendance'
  | 'grades'
  | 'profile';

// ==========================================
// FASE 2: DATA MASTER SEKOLAH TYPES
// ==========================================

export type GenderType = 'Laki-laki' | 'Perempuan';

// 1. Program Keahlian (Major)
export type MajorStatus = 'Aktif' | 'Nonaktif';

export interface MajorItem {
  id: string;
  code: string;           // contoh: TJKT, DKV, TO, RPL, MPLB
  name: string;           // contoh: Teknik Jaringan Komputer dan Telekomunikasi
  shortName: string;      // contoh: TJKT
  description: string;
  status: MajorStatus;
  headOfProgram?: string;
  imageUrl?: string;
  iconName?: string;
  competencies?: string[];
  jobProspects?: string[];
  createdAt: string;
  updatedAt?: string;
}

// 2. Mata Pelajaran (Subject)
export type SubjectGroup = 'Umum' | 'Kejuruan' | 'Muatan Lokal' | 'Pilihan';
export type SubjectStatus = 'Aktif' | 'Nonaktif';

export interface SubjectItem {
  id: string;
  code: string;           // contoh: MP-UM-01, MP-TJKT-02
  name: string;           // contoh: Administrasi Infrastruktur Jaringan
  group: SubjectGroup;
  majorId?: string;       // ID program keahlian jika merupakan mapel Kejuruan/Pilihan
  status: SubjectStatus;
  createdAt: string;
  updatedAt?: string;
}

// 3. Guru (Teacher)
export type TeacherStatus = 'Aktif' | 'Nonaktif';

export interface TeacherItem {
  id: string;
  nip: string;            // NIP / NUPTK
  fullName: string;       // Nama lengkap beserta gelar
  gender: GenderType;
  email: string;
  phone: string;
  photoUrl: string;
  subjectIds: string[];   // ID mata pelajaran yang diampu
  status: TeacherStatus;
  createdAt: string;
  updatedAt?: string;
}

// 4. Kelas (Class)
export type ClassGrade = 'X' | 'XI' | 'XII';
export type ClassStatus = 'Aktif' | 'Nonaktif';

export interface ClassItem {
  id: string;
  name: string;                 // contoh: X TJKT 1, XI TJKT 1, XII TJKT 1
  grade: ClassGrade;            // X, XI, XII
  majorId: string;              // Relasi ke Program Keahlian
  homeroomTeacherId?: string;   // Relasi ke Guru Wali Kelas
  academicYear: string;         // contoh: 2025/2026, 2026/2027
  status: ClassStatus;
  createdAt: string;
  updatedAt?: string;
}

// 5. Siswa (Student)
export type StudentStatus = 'Aktif' | 'Lulus' | 'Pindah' | 'Nonaktif';

export interface StudentItem {
  id: string;
  nis: string;            // Nomor Induk Siswa (e.g. 242501001)
  nisn: string;           // Nomor Induk Siswa Nasional (10 digit)
  fullName: string;
  gender: GenderType;
  birthPlace: string;
  birthDate: string;      // YYYY-MM-DD
  address: string;
  phone: string;
  email: string;
  photoUrl: string;
  classId: string;        // Relasi ke Kelas
  majorId: string;        // Relasi ke Program Keahlian
  enrollmentYear: string; // Tahun masuk, misal 2024, 2025, 2026
  status: StudentStatus;
  createdAt: string;
  updatedAt?: string;
}

// Master Dashboard Stats
export interface MasterDataStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalClasses: number;
  activeClasses: number;
  totalMajors: number;
  activeMajors: number;
  totalSubjects: number;
  activeSubjects: number;
}

// ==========================================
// FASE 3: AKADEMIK, JADWAL, ABSENSI & NILAI
// ==========================================

export type SemesterType = 'Ganjil' | 'Genap';

// 1. Tahun Ajaran (Academic Year)
export interface AcademicYearItem {
  id: string;
  name: string;           // contoh: '2026/2027'
  semester: SemesterType; // 'Ganjil' | 'Genap'
  isActive: boolean;      // Hanya satu periode yang aktif
  startDate?: string;     // YYYY-MM-DD
  endDate?: string;       // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// 2. Jadwal Pelajaran (Schedule)
export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
export type ScheduleStatus = 'Aktif' | 'Nonaktif';

export interface ScheduleItem {
  id: string;
  academicYearId: string; // Relasi ke Tahun Ajaran
  classId: string;        // Relasi ke Kelas
  subjectId: string;      // Relasi ke Mata Pelajaran
  teacherId: string;      // Relasi ke Guru Pengampu
  day: DayOfWeek;         // Senin - Sabtu
  startTime: string;      // HH:mm (contoh: '07:00')
  endTime: string;        // HH:mm (contoh: '08:30')
  room: string;           // contoh: 'Lab TJKT 1', 'Ruang 102', 'Bengkel Otomotif'
  status: ScheduleStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ScheduleConflictResult {
  hasConflict: boolean;
  conflictType?: 'teacher' | 'class' | 'room';
  conflictMessage?: string;
  conflictingSchedule?: ScheduleItem;
}

// 3. Absensi Siswa (Attendance)
export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface AttendanceStudentItem {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  academicYearId: string; // Relasi ke Tahun Ajaran aktif
  date: string;           // YYYY-MM-DD
  time?: string;          // HH:mm
  classId: string;        // Relasi ke Kelas
  subjectId: string;      // Relasi ke Mata Pelajaran
  teacherId: string;      // Guru yang mengabsen
  items: AttendanceStudentItem[];
  topicOrMaterial?: string; // Materi yang diajarkan pada pertemuan tersebut
  createdAt: string;
  updatedAt?: string;
}

// Rekap Kehadiran per Siswa
export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  studentNis: string;
  totalMeetings: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  percentage: number; // Persentase Kehadiran: (Hadir / totalMeetings) * 100
}

// 4. Nilai Siswa (Grade)
export interface GradeRecord {
  id: string;
  studentId: string;      // Relasi ke Siswa
  subjectId: string;      // Relasi ke Mata Pelajaran
  teacherId: string;      // Guru Penilai
  classId: string;        // Relasi ke Kelas
  academicYearId: string; // Relasi ke Tahun Ajaran
  semester: SemesterType; // Ganjil / Genap
  
  // Komponen Nilai (0 - 100)
  attendanceScore: number;  // Kehadiran (Bobot 45%)
  assignmentScore: number;  // Tugas & Ulangan Harian (Bobot 20%)
  utsScore: number;         // UTS (Bobot 15%)
  uasScore: number;         // UAS (Bobot 20%)
  
  // Perhitungan Nilai Akhir
  // Nilai Akhir = (attendanceScore × 45%) + (assignmentScore × 20%) + (utsScore × 15%) + (uasScore × 20%)
  finalScore: number;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  predicate: string;        // Sangat Baik, Baik, Cukup, Kurang, Sangat Kurang
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// 5. Konfigurasi Sistem & Pengaturan Admin
export interface SystemSettings {
  id?: string;
  adminDisplayName?: string;
  adminPhone?: string;
  adminAvatarUrl?: string;
  kkmStandard: number;
  attendanceWeight: number;
  assignmentWeight: number;
  utsWeight: number;
  uasWeight: number;
  schoolStartTime: string;
  schoolEndTime: string;
  ppdbStatus: 'open' | 'closed' | 'coming_soon';
  ppdbYear: string;
  maintenanceMode: boolean;
  enableSoundNotification: boolean;
  helpdeskPhone?: string;
  helpdeskEmail?: string;
  updatedAt?: string;
}

// ==========================================
// FASE 5: MODUL PKL (PRAKTIK KERJA LAPANGAN)
// ==========================================

export type CompanyStatus = 'Aktif' | 'Nonaktif';

export interface CompanyItem {
  id: string; // companyId
  name: string;
  industryType: string; // e.g. 'Teknologi Informasi & Jaringan', 'Manufaktur & Otomotif', 'Desain Grafis & Multimedia'
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
  status: CompanyStatus;
  logoUrl?: string;
  quota?: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export type InternshipStatus = 'Belum Mulai' | 'Aktif' | 'Selesai' | 'Dibatalkan';

export interface InternshipItem {
  id: string; // internshipId
  studentId: string;
  companyId: string;
  teacherId: string; // Guru Pembimbing
  industrySupervisor: string; // Pembimbing Industri
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: InternshipStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type JournalStatus = 'Menunggu Verifikasi' | 'Disetujui' | 'Perlu Perbaikan';

export interface InternshipJournal {
  id: string; // journalId
  internshipId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  activity: string;
  description: string;
  attachment?: string; // photo/file URL or base64
  status: JournalStatus;
  teacherNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InternshipMonitoring {
  id: string; // monitoringId
  internshipId: string;
  studentId: string;
  teacherId: string;
  visitDate: string; // YYYY-MM-DD
  notes: string;
  evaluation: string;
  status: string; // e.g. 'Sangat Baik', 'Baik', 'Cukup'
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InternshipGrade {
  id: string; // gradeId
  internshipId: string;
  studentId: string;
  industryScore: number; // 0 - 100
  teacherScore: number;  // 0 - 100
  finalScore: number;    // Nilai akhir berbobot
  predicate: string;     // Sangat Baik, Baik, Cukup, Kurang
  notes?: string;
  isPublished?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// FASE 5: MODUL BKK (BURSA KERJA KHUSUS)
// ==========================================

export type JobEmploymentType = 'Full Time' | 'Part Time' | 'Kontrak' | 'Magang';
export type JobStatus = 'Draft' | 'Published' | 'Closed';

export interface JobItem {
  id: string; // jobId
  companyId: string;
  position: string;
  description: string;
  requirements: string;
  location: string;
  employmentType: JobEmploymentType;
  salaryInfo: string;
  deadline: string; // YYYY-MM-DD
  status: JobStatus;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ApplicationStatus = 'Terdaftar' | 'Seleksi' | 'Lolos' | 'Tidak Lolos' | 'Dibatalkan';

export interface JobApplication {
  id: string; // applicationId
  jobId: string;
  userId?: string;
  studentId?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  cvUrl: string;
  coverLetter?: string;
  status: ApplicationStatus;
  notes?: string;
  appliedAt: string;
  updatedAt?: string;
}

// ==========================================
// FASE 5: MODUL ALUMNI & TRACER STUDY
// ==========================================

export type AlumniStatus = 'Bekerja' | 'Kuliah' | 'Wirausaha' | 'Mencari Kerja' | 'Lainnya';

export interface AlumniItem {
  id: string; // alumniId
  name: string;
  graduationYear: string; // e.g. '2023', '2024', '2025'
  majorId: string;
  email: string;
  phone: string;
  city: string;
  status: AlumniStatus;
  currentJob?: string;
  currentCompany?: string;
  position?: string;
  higherEducation?: string;
  startYear?: string;
  photoUrl?: string;
  bio?: string;
  notes?: string;
  testimonial?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type TracerQuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'year';

export interface TracerQuestion {
  id: string;
  question: string;
  text?: string;
  type: TracerQuestionType;
  options?: string[];
  required: boolean;
  category?: string;
}

export interface TracerSurvey {
  id: string;
  title: string;
  description: string;
  targetGraduationYears?: string[];
  isActive: boolean;
  questions: TracerQuestion[];
  createdAt: string;
  updatedAt?: string;
}

export interface TracerResponse {
  id: string;
  surveyId: string;
  alumniId?: string;
  alumniName: string;
  graduationYear: string;
  majorId?: string;
  answers: Record<string, any>;
  submittedAt: string;
}



