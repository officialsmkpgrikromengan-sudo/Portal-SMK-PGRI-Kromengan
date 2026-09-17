import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  defaultSchoolInfo,
  defaultNewsList,
  defaultEventsList,
  defaultAchievementsList,
  defaultGalleryList,
  defaultMajorsList,
  defaultSubjectsList,
  defaultTeachersList,
  defaultClassesList,
  defaultStudentsList,
  defaultAcademicYearsList,
  defaultSchedulesList,
  defaultAttendanceList,
  defaultGradesList,
  defaultSystemSettings,
  defaultCompaniesList,
  defaultInternshipsList,
  defaultInternshipJournalsList,
  defaultInternshipMonitoringList,
  defaultInternshipGradesList,
  defaultJobsList,
  defaultJobApplicationsList,
  defaultAlumniList,
  defaultTracerSurveysList,
  defaultTracerResponsesList,
  defaultUsersList,
  defaultAuditLogsList
} from '../src/data/defaultData';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DB_FILE_PATH = path.join(DATA_DIR, 'school.sqlite');

// Initialize SQLite database instance
export const db = new DatabaseSync(DB_FILE_PATH);

// Utility for hashing passwords securely
export function hashPassword(password: string): string {
  const salt = 'smk_pgri_secret_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Helper to prevent SQLite bind errors with undefined
function s(val: any, fallback = ''): string {
  return (val !== undefined && val !== null) ? String(val) : fallback;
}

// Initialize SQLite Tables
export function initDatabaseSchema() {
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // 1. School Info
  db.exec(`
    CREATE TABLE IF NOT EXISTS school_info (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 2. System Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 3. News
  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
  `);

  // 4. Events
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  `);

  // 5. Achievements
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      year TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 6. Gallery
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 7. Majors
  db.exec(`
    CREATE TABLE IF NOT EXISTS majors (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      shortName TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 8. Subjects
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 9. Teachers
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      nip TEXT,
      fullName TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_teachers_nip ON teachers(nip);
  `);

  // 10. Classes
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gradeLevel TEXT NOT NULL,
      majorId TEXT,
      academicYearId TEXT,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 11. Students
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      nisn TEXT,
      nis TEXT,
      fullName TEXT NOT NULL,
      classId TEXT,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);
    CREATE INDEX IF NOT EXISTS idx_students_nis ON students(nis);
    CREATE INDEX IF NOT EXISTS idx_students_class ON students(classId);
  `);

  // 12. Academic Years
  db.exec(`
    CREATE TABLE IF NOT EXISTS academic_years (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      isCurrent INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 13. Schedules
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      classId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      day TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 14. Attendance
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      classId TEXT NOT NULL,
      date TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_attendance_lookup ON attendance(classId, date);
  `);

  // 15. Grades
  db.exec(`
    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      classId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      academicYearId TEXT,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(studentId);
  `);

  // 16. Companies
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sector TEXT,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 17. Internships
  db.exec(`
    CREATE TABLE IF NOT EXISTS internships (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      companyId TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 18. Internship Journals
  db.exec(`
    CREATE TABLE IF NOT EXISTS internship_journals (
      id TEXT PRIMARY KEY,
      internshipId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 19. Internship Monitoring
  db.exec(`
    CREATE TABLE IF NOT EXISTS internship_monitoring (
      id TEXT PRIMARY KEY,
      internshipId TEXT NOT NULL,
      date TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 20. Internship Grades
  db.exec(`
    CREATE TABLE IF NOT EXISTS internship_grades (
      id TEXT PRIMARY KEY,
      internshipId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 21. Jobs
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      companyId TEXT,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 22. Job Applications
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      applicantId TEXT,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 23. Alumni
  db.exec(`
    CREATE TABLE IF NOT EXISTS alumni (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      graduationYear TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 24. Tracer Surveys
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracer_surveys (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 25. Tracer Responses
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracer_responses (
      id TEXT PRIMARY KEY,
      surveyId TEXT,
      alumniId TEXT,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 26. Users (with secure password hashing)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      username TEXT,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  // 27. Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      performedBy TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp);
  `);

  // 28. Contact Messages
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

// Seed Initial Data if database is freshly created
export function seedDatabaseIfNeeded(force = false) {
  const check = db.prepare('SELECT id FROM school_info WHERE id = ?').get('main');
  if (check && !force) {
    return; // Already initialized
  }

  const now = new Date().toISOString();

  // Helper transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. School Info
    const insertSchoolInfo = db.prepare('INSERT OR REPLACE INTO school_info (id, data, updatedAt) VALUES (?, ?, ?)');
    insertSchoolInfo.run('main', JSON.stringify(defaultSchoolInfo), now);

    // 2. System Settings
    const insertSettings = db.prepare('INSERT OR REPLACE INTO system_settings (id, data, updatedAt) VALUES (?, ?, ?)');
    insertSettings.run('main', JSON.stringify(defaultSystemSettings), now);

    // 3. News
    const insertNews = db.prepare('INSERT OR REPLACE INTO news (id, title, slug, category, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultNewsList) {
      insertNews.run(item.id, item.title, item.slug, item.category, item.status, JSON.stringify(item), item.createdAt || now, item.updatedAt || now);
    }

    // 4. Events
    const insertEvent = db.prepare('INSERT OR REPLACE INTO events (id, title, category, date, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultEventsList) {
      insertEvent.run(s(item.id), s(item.title), s(item.category), s(item.date), s(item.status), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 5. Achievements
    const insertAch = db.prepare('INSERT OR REPLACE INTO achievements (id, title, category, year, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultAchievementsList) {
      insertAch.run(s(item.id), s(item.title), s(item.category), s(item.year), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 6. Gallery
    const insertGal = db.prepare('INSERT OR REPLACE INTO gallery (id, title, category, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    for (const item of defaultGalleryList) {
      insertGal.run(s(item.id), s(item.title), s(item.category), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 7. Majors
    const insertMajor = db.prepare('INSERT OR REPLACE INTO majors (id, code, name, shortName, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultMajorsList) {
      insertMajor.run(s(item.id), s(item.code), s(item.name), s(item.shortName, item.code), s(item.status), JSON.stringify(item), s(item.createdAt, now), s(item.updatedAt, now));
    }

    // 8. Subjects
    const insertSub = db.prepare('INSERT OR REPLACE INTO subjects (id, code, name, category, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultSubjectsList) {
      insertSub.run(s(item.id), s(item.code), s(item.name), s(item.group), s(item.status), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 9. Teachers
    const insertTeach = db.prepare('INSERT OR REPLACE INTO teachers (id, nip, fullName, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultTeachersList) {
      insertTeach.run(s(item.id), s(item.nip), s(item.fullName), s(item.status), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 10. Classes
    const insertClass = db.prepare('INSERT OR REPLACE INTO classes (id, name, gradeLevel, majorId, academicYearId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultClassesList) {
      insertClass.run(s(item.id), s(item.name), s(item.grade), s(item.majorId), s(item.academicYear), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 11. Students
    const insertStd = db.prepare('INSERT OR REPLACE INTO students (id, nisn, nis, fullName, classId, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultStudentsList) {
      insertStd.run(s(item.id), s(item.nisn), s(item.nis), s(item.fullName), s(item.classId), s(item.status), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 12. Academic Years
    const insertAy = db.prepare('INSERT OR REPLACE INTO academic_years (id, name, isCurrent, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    for (const item of defaultAcademicYearsList) {
      insertAy.run(s(item.id), s(item.name), item.isActive ? 1 : 0, JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 13. Schedules
    const insertSch = db.prepare('INSERT OR REPLACE INTO schedules (id, classId, subjectId, day, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultSchedulesList) {
      insertSch.run(s(item.id), s(item.classId), s(item.subjectId), s(item.day), JSON.stringify(item), now, now);
    }

    // 14. Attendance
    const insertAtt = db.prepare('INSERT OR REPLACE INTO attendance (id, classId, date, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    for (const item of defaultAttendanceList) {
      insertAtt.run(s(item.id), s(item.classId), s(item.date), JSON.stringify(item), s(item.createdAt, now), s(item.updatedAt, now));
    }

    // 15. Grades
    const insertGrd = db.prepare('INSERT OR REPLACE INTO grades (id, studentId, classId, subjectId, academicYearId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultGradesList) {
      insertGrd.run(s(item.id), s(item.studentId), s(item.classId), s(item.subjectId), s(item.academicYearId), JSON.stringify(item), s(item.createdAt, now), s(item.updatedAt, now));
    }

    // 16. Companies
    const insertComp = db.prepare('INSERT OR REPLACE INTO companies (id, name, sector, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultCompaniesList) {
      insertComp.run(s(item.id), s(item.name), s(item.industryType), s(item.status), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 17. Internships
    const insertIntern = db.prepare('INSERT OR REPLACE INTO internships (id, studentId, companyId, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultInternshipsList) {
      insertIntern.run(s(item.id), s(item.studentId), s(item.companyId), s(item.status), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 18. Internship Journals
    const insertJrnl = db.prepare('INSERT OR REPLACE INTO internship_journals (id, internshipId, studentId, date, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultInternshipJournalsList) {
      insertJrnl.run(s(item.id), s(item.internshipId), s(item.studentId), s(item.date), s(item.status), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 19. Internship Monitoring
    const insertMon = db.prepare('INSERT OR REPLACE INTO internship_monitoring (id, internshipId, date, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    for (const item of defaultInternshipMonitoringList) {
      insertMon.run(s(item.id), s(item.internshipId), s(item.visitDate), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 20. Internship Grades
    const insertIntGrd = db.prepare('INSERT OR REPLACE INTO internship_grades (id, internshipId, studentId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    for (const item of defaultInternshipGradesList) {
      insertIntGrd.run(s(item.id), s(item.internshipId), s(item.studentId), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 21. Jobs
    const insertJob = db.prepare('INSERT OR REPLACE INTO jobs (id, title, companyId, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultJobsList) {
      insertJob.run(s(item.id), s(item.position), s(item.companyId), s(item.status), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 22. Job Applications
    const insertApp = db.prepare('INSERT OR REPLACE INTO job_applications (id, jobId, applicantId, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultJobApplicationsList) {
      insertApp.run(s(item.id), s(item.jobId), s((item as any).studentId || (item as any).userId), s(item.status), JSON.stringify(item), s(item.appliedAt, now), now);
    }

    // 23. Alumni
    const insertAlum = db.prepare('INSERT OR REPLACE INTO alumni (id, fullName, graduationYear, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of defaultAlumniList) {
      insertAlum.run(s(item.id), s(item.name), s(item.graduationYear), s(item.status), JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 24. Tracer Surveys
    const insertSurv = db.prepare('INSERT OR REPLACE INTO tracer_surveys (id, title, isActive, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    for (const item of defaultTracerSurveysList) {
      insertSurv.run(s(item.id), s(item.title), item.isActive ? 1 : 0, JSON.stringify(item), s(item.createdAt, now), now);
    }

    // 25. Tracer Responses
    const insertResp = db.prepare('INSERT OR REPLACE INTO tracer_responses (id, surveyId, alumniId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    for (const item of defaultTracerResponsesList) {
      insertResp.run(s(item.id), s(item.surveyId), s(item.alumniId), JSON.stringify(item), s(item.submittedAt, now), now);
    }

    // 26. Users (with secure salted password hashing)
    const insertUser = db.prepare('INSERT OR REPLACE INTO users (id, email, username, role, status, passwordHash, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const u of defaultUsersList) {
      const defaultPass = u.initialPassword || (u.role === 'admin' ? 'admin123456' : u.role === 'guru' ? 'guru123456' : 'siswa123456');
      const passHash = hashPassword(defaultPass);
      insertUser.run(s(u.id), s(u.email).toLowerCase(), s(u.username).toLowerCase(), s(u.role), s(u.status), passHash, JSON.stringify(u), s(u.createdAt, now), now);
    }

    // 27. Audit Logs
    const insertAudit = db.prepare('INSERT OR REPLACE INTO audit_logs (id, action, module, performedBy, timestamp, data, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const a of defaultAuditLogsList) {
      insertAudit.run(s(a.id), s(a.action), s(a.module), s(a.userEmail || a.userId), s(a.createdAt), JSON.stringify(a), s(a.createdAt, now));
    }

    db.exec('COMMIT;');
    console.log('[SQLite Database] Successfully seeded initial schema and data to', DB_FILE_PATH);
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('[SQLite Database] Failed to seed initial data:', err);
    throw err;
  }
}

// Strict whitelist of allowed SQLite tables to prevent any SQL injection
const ALLOWED_TABLES = new Set([
  'school_info', 'system_settings', 'news', 'events', 'achievements',
  'gallery', 'majors', 'subjects', 'teachers', 'classes', 'students',
  'academic_years', 'schedules', 'attendance', 'grades', 'companies',
  'internships', 'internship_journals', 'internship_monitoring',
  'internship_grades', 'jobs', 'job_applications', 'alumni',
  'tracer_surveys', 'tracer_responses', 'users', 'audit_logs', 'messages'
]);

function validateTable(tableName: string): string {
  if (!ALLOWED_TABLES.has(tableName)) {
    throw new Error(`Unauthorized or invalid database table: ${tableName}`);
  }
  return tableName;
}

function sanitizeOrderBy(order: string): string {
  const sanitized = order.trim();
  // Only allow valid column names followed by optional ASC or DESC
  if (/^[a-zA-Z0-9_]+(\s+(ASC|DESC))?$/i.test(sanitized)) {
    return sanitized;
  }
  return 'createdAt DESC';
}

// Generic CRUD helpers
export function getAll<T>(tableName: string, orderByCol = 'createdAt DESC'): T[] {
  try {
    const validTable = validateTable(tableName);
    const validOrder = sanitizeOrderBy(orderByCol);
    const rows = db.prepare(`SELECT data FROM ${validTable} ORDER BY ${validOrder}`).all() as Array<{ data: string }>;
    return rows.map(r => JSON.parse(r.data));
  } catch (err) {
    console.error(`Error in getAll(${tableName}):`, err);
    return [];
  }
}

export function getById<T>(tableName: string, id: string): T | null {
  try {
    const validTable = validateTable(tableName);
    const row = db.prepare(`SELECT data FROM ${validTable} WHERE id = ?`).get(id) as { data: string } | undefined;
    return row ? JSON.parse(row.data) : null;
  } catch (err) {
    console.error(`Error in getById(${tableName}, ${id}):`, err);
    return null;
  }
}

export function deleteById(tableName: string, id: string): boolean {
  try {
    const validTable = validateTable(tableName);
    const result = db.prepare(`DELETE FROM ${validTable} WHERE id = ?`).run(id);
    return result.changes > 0;
  } catch (err) {
    console.error(`Error in deleteById(${tableName}, ${id}):`, err);
    return false;
  }
}
