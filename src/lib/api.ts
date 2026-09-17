import {
  SchoolInfo,
  NewsItem,
  EventItem,
  AchievementItem,
  GalleryItem,
  MajorItem,
  SubjectItem,
  TeacherItem,
  ClassItem,
  StudentItem,
  AcademicYearItem,
  ScheduleItem,
  AttendanceRecord,
  GradeRecord,
  SystemSettings,
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
  UserAccount,
  AuditLogItem,
  MasterDataStats,
  ScheduleConflictResult,
  StudentAttendanceSummary
} from '../types';

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
} from '../data/defaultData';

// Helper for local image file to base64 DataURL
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// Generic safe fetcher with fallback
async function fetchApi<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`API Error ${res.status}: ${errText || res.statusText}`);
    }

    const data = await res.json();
    return (data.data !== undefined ? data.data : data) as T;
  } catch (err) {
    if (fallback !== undefined) {
      console.warn(`[SQLite Client] Fallback used for ${url}:`, err);
      return fallback;
    }
    throw err;
  }
}

// ==========================================
// School Information Service
// ==========================================
export const getSchoolInfo = async (): Promise<SchoolInfo> => {
  return fetchApi<SchoolInfo>('/api/school-info', undefined, defaultSchoolInfo);
};

export const updateSchoolInfo = async (info: Partial<SchoolInfo>): Promise<void> => {
  const current = await getSchoolInfo();
  const merged = { ...current, ...info };
  await fetchApi<void>('/api/school-info', {
    method: 'PUT',
    body: JSON.stringify(merged)
  });
};

// ==========================================
// System Settings Service
// ==========================================
export const getSystemSettings = async (): Promise<SystemSettings> => {
  return fetchApi<SystemSettings>('/api/settings', undefined, defaultSystemSettings);
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<void> => {
  const current = await getSystemSettings();
  const merged = { ...current, ...settings };
  await fetchApi<void>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(merged)
  });
};

// ==========================================
// News Service
// ==========================================
export const getNewsList = async (includeDrafts = false): Promise<NewsItem[]> => {
  const list = await fetchApi<NewsItem[]>('/api/news', undefined, defaultNewsList);
  return list.filter(n => includeDrafts || n.status === 'published');
};

export const createNews = async (news: Omit<NewsItem, 'id'>): Promise<string> => {
  const res = await fetchApi<NewsItem>('/api/news', {
    method: 'POST',
    body: JSON.stringify(news)
  });
  return res.id;
};

export const updateNews = async (id: string, news: Partial<NewsItem>): Promise<void> => {
  await fetchApi<void>(`/api/news/${id}`, {
    method: 'PUT',
    body: JSON.stringify(news)
  });
};

export const deleteNews = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/news/${id}`, { method: 'DELETE' });
};

// ==========================================
// Events Service
// ==========================================
export const getEventsList = async (includeDrafts = false): Promise<EventItem[]> => {
  const list = await fetchApi<EventItem[]>('/api/events', undefined, defaultEventsList);
  return list.filter(e => includeDrafts || e.status === 'published');
};

export const createEvent = async (event: Omit<EventItem, 'id' | 'createdAt'> & { createdAt?: string }): Promise<string> => {
  const res = await fetchApi<EventItem>('/api/events', {
    method: 'POST',
    body: JSON.stringify(event)
  });
  return res.id;
};

export const updateEvent = async (id: string, event: Partial<EventItem>): Promise<void> => {
  await fetchApi<void>(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event)
  });
};

export const deleteEvent = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/events/${id}`, { method: 'DELETE' });
};

// ==========================================
// Achievements Service
// ==========================================
export const getAchievementsList = async (): Promise<AchievementItem[]> => {
  return fetchApi<AchievementItem[]>('/api/achievements', undefined, defaultAchievementsList);
};

export const createAchievement = async (achievement: Omit<AchievementItem, 'id' | 'createdAt'> & { createdAt?: string }): Promise<string> => {
  const res = await fetchApi<AchievementItem>('/api/achievements', {
    method: 'POST',
    body: JSON.stringify(achievement)
  });
  return res.id;
};

export const updateAchievement = async (id: string, achievement: Partial<AchievementItem>): Promise<void> => {
  await fetchApi<void>(`/api/achievements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(achievement)
  });
};

export const deleteAchievement = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/achievements/${id}`, { method: 'DELETE' });
};

// ==========================================
// Gallery Service
// ==========================================
export const getGalleryList = async (): Promise<GalleryItem[]> => {
  return fetchApi<GalleryItem[]>('/api/gallery', undefined, defaultGalleryList);
};

export const createGalleryItem = async (item: Omit<GalleryItem, 'id' | 'createdAt'> & { createdAt?: string }): Promise<string> => {
  const res = await fetchApi<GalleryItem>('/api/gallery', {
    method: 'POST',
    body: JSON.stringify(item)
  });
  return res.id;
};

export const deleteGalleryItem = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/gallery/${id}`, { method: 'DELETE' });
};

// ==========================================
// Majors Service
// ==========================================
export const getMajorsList = async (): Promise<MajorItem[]> => {
  return fetchApi<MajorItem[]>('/api/majors', undefined, defaultMajorsList);
};

export const createMajor = async (major: Omit<MajorItem, 'id' | 'createdAt'> & { createdAt?: string }): Promise<string> => {
  const res = await fetchApi<MajorItem>('/api/majors', {
    method: 'POST',
    body: JSON.stringify(major)
  });
  return res.id;
};

export const updateMajor = async (id: string, major: Partial<MajorItem>): Promise<void> => {
  await fetchApi<void>(`/api/majors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(major)
  });
};

export const deleteMajor = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/majors/${id}`, { method: 'DELETE' });
};

// ==========================================
// Subjects Service
// ==========================================
export const getSubjectsList = async (): Promise<SubjectItem[]> => {
  return fetchApi<SubjectItem[]>('/api/subjects', undefined, defaultSubjectsList);
};

export const createSubject = async (subject: Omit<SubjectItem, 'id' | 'createdAt'> & { createdAt?: string }): Promise<string> => {
  const res = await fetchApi<SubjectItem>('/api/subjects', {
    method: 'POST',
    body: JSON.stringify(subject)
  });
  return res.id;
};

export const updateSubject = async (id: string, subject: Partial<SubjectItem>): Promise<void> => {
  await fetchApi<void>(`/api/subjects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(subject)
  });
};

export const deleteSubject = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/subjects/${id}`, { method: 'DELETE' });
};

// ==========================================
// Teachers Service
// ==========================================
export const getTeachersList = async (): Promise<TeacherItem[]> => {
  return fetchApi<TeacherItem[]>('/api/teachers', undefined, defaultTeachersList);
};

export const createTeacher = async (teacher: Omit<TeacherItem, 'id' | 'createdAt'> & { createdAt?: string }): Promise<string> => {
  const res = await fetchApi<TeacherItem>('/api/teachers', {
    method: 'POST',
    body: JSON.stringify(teacher)
  });
  return res.id;
};

export const updateTeacher = async (id: string, teacher: Partial<TeacherItem>): Promise<void> => {
  await fetchApi<void>(`/api/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(teacher)
  });
};

export const deleteTeacher = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/teachers/${id}`, { method: 'DELETE' });
};

// ==========================================
// Classes Service
// ==========================================
export const getClassesList = async (): Promise<ClassItem[]> => {
  return fetchApi<ClassItem[]>('/api/classes', undefined, defaultClassesList);
};

export const createClass = async (classItem: Omit<ClassItem, 'id' | 'createdAt'> & { createdAt?: string }): Promise<string> => {
  const res = await fetchApi<ClassItem>('/api/classes', {
    method: 'POST',
    body: JSON.stringify(classItem)
  });
  return res.id;
};

export const updateClass = async (id: string, classItem: Partial<ClassItem>): Promise<void> => {
  await fetchApi<void>(`/api/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(classItem)
  });
};

export const deleteClass = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/classes/${id}`, { method: 'DELETE' });
};

// ==========================================
// Students Service & Bulk Import
// ==========================================
export const getStudentsList = async (): Promise<StudentItem[]> => {
  return fetchApi<StudentItem[]>('/api/students', undefined, defaultStudentsList);
};

export const createStudent = async (student: Omit<StudentItem, 'id' | 'createdAt'> & { createdAt?: string }): Promise<string> => {
  const res = await fetchApi<StudentItem>('/api/students', {
    method: 'POST',
    body: JSON.stringify(student)
  });
  return res.id;
};

export const bulkCreateStudents = async (students: Array<Omit<StudentItem, 'id' | 'createdAt'> & { createdAt?: string }>): Promise<number> => {
  const res = await fetchApi<{ count: number }>('/api/students/bulk', {
    method: 'POST',
    body: JSON.stringify({ students })
  });
  return res.count || students.length;
};

export const updateStudent = async (id: string, student: Partial<StudentItem>): Promise<void> => {
  await fetchApi<void>(`/api/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(student)
  });
};

export const deleteStudent = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/students/${id}`, { method: 'DELETE' });
};

// Master Data Stats
export const getMasterStats = async (): Promise<MasterDataStats> => {
  try {
    const res = await fetchApi<any>('/api/stats', undefined, null);
    if (res) return res;
  } catch (e) {
    // fallback below
  }
  return {
    totalStudents: defaultStudentsList.length,
    activeStudents: defaultStudentsList.filter(s => s.status === 'Aktif').length,
    totalTeachers: defaultTeachersList.length,
    activeTeachers: defaultTeachersList.filter(t => t.status === 'Aktif').length,
    totalClasses: defaultClassesList.length,
    activeClasses: defaultClassesList.filter(c => c.status === 'Aktif').length,
    totalMajors: defaultMajorsList.length,
    activeMajors: defaultMajorsList.filter(m => m.status === 'Aktif').length,
    totalSubjects: defaultSubjectsList.length,
    activeSubjects: defaultSubjectsList.filter(s => s.status === 'Aktif').length
  };
};

export const seedInitialData = async (forceOverwrite = false): Promise<void> => {
  await fetchApi<void>('/api/database/seed', { method: 'POST', body: JSON.stringify({ force: forceOverwrite }) });
};

// ==========================================
// Academic Years Service
// ==========================================
export const getAcademicYearsList = async (): Promise<AcademicYearItem[]> => {
  return fetchApi<AcademicYearItem[]>('/api/academic-years', undefined, defaultAcademicYearsList);
};

export const createAcademicYear = async (item: Omit<AcademicYearItem, 'id'>): Promise<string> => {
  const res = await fetchApi<AcademicYearItem>('/api/academic-years', {
    method: 'POST',
    body: JSON.stringify(item)
  });
  return res.id;
};

export const updateAcademicYear = async (id: string, item: Partial<AcademicYearItem>): Promise<void> => {
  await fetchApi<void>(`/api/academic-years/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  });
};

export const setActiveAcademicYear = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/academic-years/${id}/set-active`, { method: 'POST' });
};

export const deleteAcademicYear = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/academic-years/${id}`, { method: 'DELETE' });
};

// ==========================================
// Schedules Service & Conflict Detection
// ==========================================
export const getSchedulesList = async (): Promise<ScheduleItem[]> => {
  return fetchApi<ScheduleItem[]>('/api/schedules', undefined, defaultSchedulesList);
};

export const checkScheduleConflict = (
  newSchedule: Omit<ScheduleItem, 'id'> & { id?: string },
  existingSchedules: ScheduleItem[],
  excludeScheduleId?: string
): ScheduleConflictResult => {
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = (timeStr || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const newStart = timeToMinutes(newSchedule.startTime);
  const newEnd = timeToMinutes(newSchedule.endTime);

  if (newStart >= newEnd) {
    return {
      hasConflict: true,
      conflictMessage: 'Jam selesai harus lebih akhir daripada jam mulai.'
    };
  }

  for (const item of existingSchedules) {
    if (excludeScheduleId && item.id === excludeScheduleId) continue;
    if (item.status === 'Nonaktif') continue;
    if (item.academicYearId !== newSchedule.academicYearId) continue;
    if (item.day !== newSchedule.day) continue;

    const itemStart = timeToMinutes(item.startTime);
    const itemEnd = timeToMinutes(item.endTime);

    const isOverlapping = (newStart < itemEnd) && (newEnd > itemStart);

    if (isOverlapping) {
      if (item.teacherId === newSchedule.teacherId) {
        return {
          hasConflict: true,
          conflictType: 'teacher',
          conflictMessage: `Bentrok Guru: Guru bersangkutan sudah memiliki jadwal mengajar pada hari ${item.day} pukul ${item.startTime} - ${item.endTime}.`,
          conflictingSchedule: item
        };
      }

      if (item.classId === newSchedule.classId) {
        return {
          hasConflict: true,
          conflictType: 'class',
          conflictMessage: `Bentrok Kelas: Kelas ini sudah memiliki mata pelajaran pada hari ${item.day} pukul ${item.startTime} - ${item.endTime}.`,
          conflictingSchedule: item
        };
      }

      if (
        newSchedule.room && 
        item.room && 
        newSchedule.room.trim().toLowerCase() === item.room.trim().toLowerCase()
      ) {
        return {
          hasConflict: true,
          conflictType: 'room',
          conflictMessage: `Bentrok Ruangan: Ruangan "${item.room}" sedang digunakan oleh jadwal lain pada hari ${item.day} pukul ${item.startTime} - ${item.endTime}.`,
          conflictingSchedule: item
        };
      }
    }
  }

  return { hasConflict: false };
};

export const createSchedule = async (schedule: Omit<ScheduleItem, 'id'>): Promise<string> => {
  const res = await fetchApi<ScheduleItem>('/api/schedules', {
    method: 'POST',
    body: JSON.stringify(schedule)
  });
  return res.id;
};

export const updateSchedule = async (id: string, schedule: Partial<ScheduleItem>): Promise<void> => {
  await fetchApi<void>(`/api/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(schedule)
  });
};

export const deleteSchedule = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/schedules/${id}`, { method: 'DELETE' });
};

// ==========================================
// Attendance Service
// ==========================================
export const getAttendanceList = async (): Promise<AttendanceRecord[]> => {
  return fetchApi<AttendanceRecord[]>('/api/attendance', undefined, defaultAttendanceList);
};

export const saveAttendanceRecord = async (record: Omit<AttendanceRecord, 'id'> & { id?: string }): Promise<string> => {
  const res = await fetchApi<AttendanceRecord>('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(record)
  });
  return res.id;
};

export const saveAttendanceBulk = async (records: any[]): Promise<void> => {
  await fetchApi<void>('/api/attendance/bulk', {
    method: 'POST',
    body: JSON.stringify({ records })
  });
};

export const deleteAttendanceRecord = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/attendance/${id}`, { method: 'DELETE' });
};

export const calculateStudentAttendanceSummary = (
  students: StudentItem[],
  records: AttendanceRecord[],
  filterSubjectId?: string
): StudentAttendanceSummary[] => {
  const relevantRecords = filterSubjectId 
    ? records.filter(r => r.subjectId === filterSubjectId)
    : records;

  return students.map(student => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let totalMeetings = 0;

    relevantRecords.forEach(rec => {
      const studentAtt = rec.items?.find(i => i.studentId === student.id);
      if (studentAtt) {
        totalMeetings++;
        if (studentAtt.status === 'Hadir') hadir++;
        else if (studentAtt.status === 'Sakit') sakit++;
        else if (studentAtt.status === 'Izin') izin++;
        else if (studentAtt.status === 'Alpa') alpa++;
      }
    });

    const percentage = totalMeetings > 0 
      ? Math.round((hadir / totalMeetings) * 100) 
      : 100;

    return {
      studentId: student.id,
      studentName: student.fullName,
      studentNis: student.nis,
      totalMeetings,
      hadir,
      sakit,
      izin,
      alpa,
      percentage
    };
  });
};

// ==========================================
// Grades Service & Formulas
// ==========================================
export const calculateFinalGrade = (
  attendanceScore: number,
  assignmentScore: number,
  utsScore: number,
  uasScore: number,
  customWeights?: { attendance?: number; assignment?: number; uts?: number; uas?: number }
): { finalScore: number; letterGrade: 'A' | 'B' | 'C' | 'D' | 'E'; predicate: string } => {
  const weightAttendance = (customWeights?.attendance ?? 45) / 100;
  const weightAssignment = (customWeights?.assignment ?? 20) / 100;
  const weightUTS = (customWeights?.uts ?? 15) / 100;
  const weightUAS = (customWeights?.uas ?? 20) / 100;

  const finalScore = Number(
    (
      (attendanceScore * weightAttendance) +
      (assignmentScore * weightAssignment) +
      (utsScore * weightUTS) +
      (uasScore * weightUAS)
    ).toFixed(2)
  );

  let letterGrade: 'A' | 'B' | 'C' | 'D' | 'E' = 'E';
  let predicate = 'Sangat Kurang';

  if (finalScore >= 85) {
    letterGrade = 'A';
    predicate = 'Sangat Baik';
  } else if (finalScore >= 75) {
    letterGrade = 'B';
    predicate = 'Baik';
  } else if (finalScore >= 60) {
    letterGrade = 'C';
    predicate = 'Cukup';
  } else if (finalScore >= 50) {
    letterGrade = 'D';
    predicate = 'Kurang';
  } else {
    letterGrade = 'E';
    predicate = 'Sangat Kurang';
  }

  return { finalScore, letterGrade, predicate };
};

export const getGradesList = async (): Promise<GradeRecord[]> => {
  return fetchApi<GradeRecord[]>('/api/grades', undefined, defaultGradesList);
};

export const saveGradeRecord = async (
  record: any,
  customWeights?: { attendance?: number; assignment?: number; uts?: number; uas?: number }
): Promise<string> => {
  const { finalScore, letterGrade, predicate } = calculateFinalGrade(
    record.attendanceScore,
    record.assignmentScore,
    record.utsScore,
    record.uasScore,
    customWeights
  );

  const fullRecord = {
    ...record,
    finalScore,
    letterGrade,
    predicate
  };

  const res = await fetchApi<GradeRecord>('/api/grades', {
    method: 'POST',
    body: JSON.stringify(fullRecord)
  });
  return res.id;
};

export const saveGrade = saveGradeRecord;

export const saveGradesBatch = async (
  records: any[],
  customWeights?: { attendance?: number; assignment?: number; uts?: number; uas?: number }
): Promise<void> => {
  const fullRecords = records.map(r => {
    const { finalScore, letterGrade, predicate } = calculateFinalGrade(
      r.attendanceScore,
      r.assignmentScore,
      r.utsScore,
      r.uasScore,
      customWeights
    );
    return { ...r, finalScore, letterGrade, predicate };
  });

  await fetchApi<void>('/api/grades/batch', {
    method: 'POST',
    body: JSON.stringify({ grades: fullRecords })
  });
};

export const deleteGradeRecord = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/grades/${id}`, { method: 'DELETE' });
};

// ==========================================
// Vocational: Companies
// ==========================================
export const getCompanies = async (): Promise<CompanyItem[]> => {
  return fetchApi<CompanyItem[]>('/api/companies', undefined, defaultCompaniesList);
};
export const getCompaniesList = getCompanies;

export const addCompany = async (company: Omit<CompanyItem, 'id' | 'createdAt'>): Promise<string> => {
  const res = await fetchApi<CompanyItem>('/api/companies', {
    method: 'POST',
    body: JSON.stringify(company)
  });
  return res.id;
};
export const saveCompany = addCompany;

export const updateCompany = async (id: string, data: Partial<CompanyItem>): Promise<void> => {
  await fetchApi<void>(`/api/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteCompany = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/companies/${id}`, { method: 'DELETE' });
};

// ==========================================
// Vocational: Internships (PKL)
// ==========================================
export const getInternships = async (): Promise<InternshipItem[]> => {
  return fetchApi<InternshipItem[]>('/api/internships', undefined, defaultInternshipsList);
};
export const getInternshipsList = getInternships;

export const addInternship = async (internship: Omit<InternshipItem, 'id' | 'createdAt'>): Promise<string> => {
  const res = await fetchApi<InternshipItem>('/api/internships', {
    method: 'POST',
    body: JSON.stringify(internship)
  });
  return res.id;
};

export const updateInternship = async (id: string, data: Partial<InternshipItem>): Promise<void> => {
  await fetchApi<void>(`/api/internships/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteInternship = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/internships/${id}`, { method: 'DELETE' });
};

// ==========================================
// Vocational: Internship Journals
// ==========================================
export const getInternshipJournals = async (internshipId?: string, studentId?: string): Promise<InternshipJournal[]> => {
  const list = await fetchApi<InternshipJournal[]>('/api/internship-journals', undefined, defaultInternshipJournalsList);
  return list.filter(j => {
    if (internshipId && j.internshipId !== internshipId) return false;
    if (studentId && j.studentId !== studentId) return false;
    return true;
  });
};
export const getInternshipJournalsList = getInternshipJournals;

export const addInternshipJournal = async (journal: Omit<InternshipJournal, 'id' | 'createdAt'>): Promise<string> => {
  const res = await fetchApi<InternshipJournal>('/api/internship-journals', {
    method: 'POST',
    body: JSON.stringify(journal)
  });
  return res.id;
};
export const saveInternshipJournal = addInternshipJournal;

export const updateInternshipJournal = async (id: string, data: Partial<InternshipJournal>): Promise<void> => {
  await fetchApi<void>(`/api/internship-journals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const verifyInternshipJournal = async (id: string, status: any, notes?: string): Promise<void> => {
  await updateInternshipJournal(id, { status, teacherNotes: notes });
};

export const deleteInternshipJournal = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/internship-journals/${id}`, { method: 'DELETE' });
};

// ==========================================
// Vocational: Internship Monitoring
// ==========================================
export const getInternshipMonitoring = async (): Promise<InternshipMonitoring[]> => {
  return fetchApi<InternshipMonitoring[]>('/api/internship-monitoring', undefined, defaultInternshipMonitoringList);
};
export const getInternshipMonitoringList = getInternshipMonitoring;

export const addInternshipMonitoring = async (monitoring: Omit<InternshipMonitoring, 'id' | 'createdAt'>): Promise<string> => {
  const res = await fetchApi<InternshipMonitoring>('/api/internship-monitoring', {
    method: 'POST',
    body: JSON.stringify(monitoring)
  });
  return res.id;
};
export const saveInternshipMonitoring = addInternshipMonitoring;

export const updateInternshipMonitoring = async (id: string, data: Partial<InternshipMonitoring>): Promise<void> => {
  await fetchApi<void>(`/api/internship-monitoring/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteInternshipMonitoring = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/internship-monitoring/${id}`, { method: 'DELETE' });
};

// ==========================================
// Vocational: Internship Grades
// ==========================================
export const getInternshipGrades = async (): Promise<InternshipGrade[]> => {
  return fetchApi<InternshipGrade[]>('/api/internship-grades', undefined, defaultInternshipGradesList);
};
export const getInternshipGradesList = getInternshipGrades;

export const saveInternshipGrade = async (grade: Partial<InternshipGrade> & { internshipId: string; studentId: string }): Promise<string> => {
  const res = await fetchApi<InternshipGrade>('/api/internship-grades', {
    method: 'POST',
    body: JSON.stringify(grade)
  });
  return res.id;
};

export const deleteInternshipGrade = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/internship-grades/${id}`, { method: 'DELETE' });
};

// ==========================================
// Vocational: Jobs & Applications (BKK)
// ==========================================
export const getJobs = async (): Promise<JobItem[]> => {
  return fetchApi<JobItem[]>('/api/jobs', undefined, defaultJobsList);
};
export const getJobsList = getJobs;

export const addJob = async (job: Omit<JobItem, 'id' | 'createdAt'>): Promise<string> => {
  const res = await fetchApi<JobItem>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(job)
  });
  return res.id;
};
export const saveJob = addJob;

export const updateJob = async (id: string, data: Partial<JobItem>): Promise<void> => {
  await fetchApi<void>(`/api/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteJob = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/jobs/${id}`, { method: 'DELETE' });
};

// Job Applications
export const getJobApplications = async (jobId?: string): Promise<JobApplication[]> => {
  const list = await fetchApi<JobApplication[]>('/api/job-applications', undefined, defaultJobApplicationsList);
  return jobId ? list.filter(a => a.jobId === jobId) : list;
};
export const getJobApplicationsList = getJobApplications;

export const applyForJob = async (application: Omit<JobApplication, 'id' | 'appliedAt' | 'cvUrl'> & { jobTitle?: string; companyName?: string; cvUrl?: string }): Promise<string> => {
  const res = await fetchApi<JobApplication>('/api/job-applications', {
    method: 'POST',
    body: JSON.stringify(application)
  });
  return res.id;
};
export const submitJobApplication = applyForJob;

export const updateJobApplicationStatus = async (id: string, status: JobApplication['status'], notes?: string): Promise<void> => {
  await fetchApi<void>(`/api/job-applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  });
};

export const deleteJobApplication = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/job-applications/${id}`, { method: 'DELETE' });
};

// ==========================================
// Vocational: Alumni Directory
// ==========================================
export const getAlumniList = async (): Promise<AlumniItem[]> => {
  return fetchApi<AlumniItem[]>('/api/alumni', undefined, defaultAlumniList);
};

export const addAlumni = async (alumni: Omit<AlumniItem, 'id' | 'createdAt'>): Promise<string> => {
  const res = await fetchApi<AlumniItem>('/api/alumni', {
    method: 'POST',
    body: JSON.stringify(alumni)
  });
  return res.id;
};

export const updateAlumni = async (id: string, data: Partial<AlumniItem>): Promise<void> => {
  await fetchApi<void>(`/api/alumni/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteAlumni = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/alumni/${id}`, { method: 'DELETE' });
};

// ==========================================
// Vocational: Tracer Study
// ==========================================
export const getTracerSurveys = async (): Promise<TracerSurvey[]> => {
  return fetchApi<TracerSurvey[]>('/api/tracer-surveys', undefined, defaultTracerSurveysList);
};
export const getTracerSurveysList = getTracerSurveys;

export const resetTracerSurveyToDefault = async (_surveyId?: string): Promise<void> => {
  await fetchApi<void>('/api/tracer-surveys/reset-default', { method: 'POST' });
};

export const saveTracerSurvey = async (survey: Partial<TracerSurvey> & { title: string; questions: any[] }): Promise<string> => {
  const res = await fetchApi<TracerSurvey>('/api/tracer-surveys', {
    method: 'POST',
    body: JSON.stringify(survey)
  });
  return res.id;
};

export const getTracerResponses = async (surveyId?: string): Promise<TracerResponse[]> => {
  const list = await fetchApi<TracerResponse[]>('/api/tracer-responses', undefined, defaultTracerResponsesList);
  return surveyId ? list.filter(r => r.surveyId === surveyId) : list;
};
export const getTracerResponsesList = getTracerResponses;

export const submitTracerResponse = async (response: Omit<TracerResponse, 'id' | 'submittedAt'>): Promise<string> => {
  const res = await fetchApi<TracerResponse>('/api/tracer-responses', {
    method: 'POST',
    body: JSON.stringify(response)
  });
  return res.id;
};

// ==========================================
// Users & Roles Management
// ==========================================
export const getUsers = async (): Promise<UserAccount[]> => {
  return fetchApi<UserAccount[]>('/api/users', undefined, defaultUsersList);
};
export const getUsersList = getUsers;

export const saveUser = async (userAccount: UserAccount): Promise<void> => {
  if (userAccount.id) {
    await fetchApi<void>(`/api/users/${userAccount.id}`, {
      method: 'PUT',
      body: JSON.stringify(userAccount)
    });
  } else {
    await fetchApi<void>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userAccount)
    });
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  await fetchApi<void>(`/api/users/${userId}`, { method: 'DELETE' });
};

export const updateUserStatus = async (userId: string, status: 'Aktif' | 'Nonaktif'): Promise<void> => {
  const backendStatus = status === 'Aktif' ? 'active' : 'inactive';
  await fetchApi<void>(`/api/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: backendStatus })
  });
};

export const updateUserRole = async (userId: string, role: UserAccount['role']): Promise<void> => {
  await fetchApi<void>(`/api/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
};

// ==========================================
// Audit Logs
// ==========================================
export const getAuditLogs = async (_limitCount = 100): Promise<AuditLogItem[]> => {
  return fetchApi<AuditLogItem[]>('/api/audit-logs', undefined, defaultAuditLogsList);
};
export const getAuditLogsList = getAuditLogs;

export const logAuditEvent = async (
  action: string,
  module: string,
  targetOrPerformer: string,
  details?: string,
  performedBy?: string
): Promise<void> => {
  const item = {
    action,
    module,
    targetId: targetOrPerformer,
    performedBy: performedBy || targetOrPerformer,
    details: details || '',
    timestamp: new Date().toISOString()
  };
  await fetchApi<void>('/api/audit-logs', {
    method: 'POST',
    body: JSON.stringify(item)
  }).catch(e => console.warn('Could not record audit log:', e));
};

// ==========================================
// Contact Messages
// ==========================================
export const getMessages = async (): Promise<any[]> => {
  return fetchApi<any[]>('/api/messages', undefined, []);
};

export const sendMessage = async (messageData: { name: string; email: string; phone?: string; subject: string; message: string }): Promise<void> => {
  await fetchApi<void>('/api/messages', {
    method: 'POST',
    body: JSON.stringify(messageData)
  });
};

export const deleteMessage = async (id: string): Promise<void> => {
  await fetchApi<void>(`/api/messages/${id}`, { method: 'DELETE' });
};

export const getMessagesList = getMessages;

// Constants for collection names (backward compatibility)
export const ACADEMIC_YEARS_COLLECTION = 'academic_years';
export const SCHEDULES_COLLECTION = 'schedules';
export const ATTENDANCE_COLLECTION = 'attendance';
export const GRADES_COLLECTION = 'grades';
export const SYSTEM_SETTINGS_COLLECTION = 'system_settings';
export const SYSTEM_SETTINGS_DOC_ID = 'main';
export const COMPANIES_COLLECTION = 'companies';
export const INTERNSHIPS_COLLECTION = 'internships';
export const INTERNSHIP_JOURNALS_COLLECTION = 'internship_journals';
export const INTERNSHIP_MONITORING_COLLECTION = 'internship_monitoring';
export const INTERNSHIP_GRADES_COLLECTION = 'internship_grades';
export const JOBS_COLLECTION = 'jobs';
export const JOB_APPLICATIONS_COLLECTION = 'job_applications';
export const ALUMNI_COLLECTION = 'alumni';
export const TRACER_SURVEYS_COLLECTION = 'tracer_surveys';
export const TRACER_RESPONSES_COLLECTION = 'tracer_responses';
export const USERS_COLLECTION = 'users';
export const AUDIT_LOGS_COLLECTION = 'audit_logs';

// Database Stats & Export helpers
export const getDatabaseStats = async (): Promise<any> => {
  return fetchApi<any>('/api/database/stats');
};
