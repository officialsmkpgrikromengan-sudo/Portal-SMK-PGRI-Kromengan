import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Firestore,
  writeBatch
} from 'firebase/firestore';

import firebaseConfigJson from '../../firebase-applet-config.json';
import {
  SchoolInfo,
  NewsItem,
  EventItem,
  AchievementItem,
  GalleryItem,
  ContactMessage,
  MajorItem,
  SubjectItem,
  TeacherItem,
  ClassItem,
  StudentItem,
  MasterDataStats,
  AcademicYearItem,
  ScheduleItem,
  AttendanceRecord,
  GradeRecord,
  StudentAttendanceSummary,
  SemesterType,
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
  AuditAction,
  AuditModule
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

// Initialize Firebase safely
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfigJson);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || undefined);

// Helper for local image file to base64 DataURL (works instantly without requiring external billing storage)
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// ==========================================
// School Information Service
// ==========================================
const SCHOOL_INFO_COLLECTION = 'school_info';
const SCHOOL_INFO_DOC_ID = 'main';

export const getSchoolInfo = async (): Promise<SchoolInfo> => {
  try {
    const docRef = doc(db, SCHOOL_INFO_COLLECTION, SCHOOL_INFO_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SchoolInfo;
    }
    // If not exists yet in Firestore, save default and return
    await setDoc(docRef, defaultSchoolInfo);
    return defaultSchoolInfo;
  } catch (error) {
    console.warn('Error fetching school info from Firestore, falling back to default:', error);
    return defaultSchoolInfo;
  }
};

export const updateSchoolInfo = async (info: Partial<SchoolInfo>): Promise<void> => {
  const docRef = doc(db, SCHOOL_INFO_COLLECTION, SCHOOL_INFO_DOC_ID);
  await setDoc(docRef, info, { merge: true });
};

// ==========================================
// News Service
// ==========================================
const NEWS_COLLECTION = 'news';

export const getNewsList = async (includeDrafts = false): Promise<NewsItem[]> => {
  try {
    const collRef = collection(db, NEWS_COLLECTION);
    let q = query(collRef);
    
    if (!includeDrafts) {
      q = query(collRef, where('status', '==', 'published'));
    }
    
    const snapshot = await getDocs(q);
    if (snapshot.empty && !includeDrafts) {
      // If Firestore is empty, auto-seed defaults for seamless experience
      await seedInitialData();
      return defaultNewsList.filter(n => includeDrafts || n.status === 'published');
    }
    
    const list: NewsItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as NewsItem);
    });
    
    // Sort by publishedAt / createdAt descending
    return list.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  } catch (error) {
    console.warn('Error fetching news from Firestore, using default:', error);
    return defaultNewsList.filter(n => includeDrafts || n.status === 'published');
  }
};

export const createNews = async (news: Omit<NewsItem, 'id'>): Promise<string> => {
  const id = `news-${Date.now()}`;
  const docRef = doc(db, NEWS_COLLECTION, id);
  await setDoc(docRef, { ...news, id });
  return id;
};

export const updateNews = async (id: string, news: Partial<NewsItem>): Promise<void> => {
  const docRef = doc(db, NEWS_COLLECTION, id);
  await updateDoc(docRef, { ...news, updatedAt: new Date().toISOString() });
};

export const deleteNews = async (id: string): Promise<void> => {
  const docRef = doc(db, NEWS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// Events Service
// ==========================================
const EVENTS_COLLECTION = 'events';

export const getEventsList = async (includeDrafts = false): Promise<EventItem[]> => {
  try {
    const collRef = collection(db, EVENTS_COLLECTION);
    let q = query(collRef);
    
    if (!includeDrafts) {
      q = query(collRef, where('status', '==', 'published'));
    }
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultEventsList.filter(e => includeDrafts || e.status === 'published');
    }
    
    const list: EventItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as EventItem);
    });
    
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.warn('Error fetching events from Firestore, using default:', error);
    return defaultEventsList.filter(e => includeDrafts || e.status === 'published');
  }
};

export const createEvent = async (event: Omit<EventItem, 'id'>): Promise<string> => {
  const id = `evt-${Date.now()}`;
  const docRef = doc(db, EVENTS_COLLECTION, id);
  await setDoc(docRef, { ...event, id });
  return id;
};

export const updateEvent = async (id: string, event: Partial<EventItem>): Promise<void> => {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  await updateDoc(docRef, { ...event, updatedAt: new Date().toISOString() });
};

export const deleteEvent = async (id: string): Promise<void> => {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// Achievements Service
// ==========================================
const ACHIEVEMENTS_COLLECTION = 'achievements';

export const getAchievementsList = async (): Promise<AchievementItem[]> => {
  try {
    const collRef = collection(db, ACHIEVEMENTS_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      return defaultAchievementsList;
    }
    const list: AchievementItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as AchievementItem);
    });
    return list.sort((a, b) => Number(b.year) - Number(a.year));
  } catch (error) {
    console.warn('Error fetching achievements from Firestore, using default:', error);
    return defaultAchievementsList;
  }
};

export const createAchievement = async (achievement: Omit<AchievementItem, 'id'>): Promise<string> => {
  const id = `ach-${Date.now()}`;
  const docRef = doc(db, ACHIEVEMENTS_COLLECTION, id);
  await setDoc(docRef, { ...achievement, id });
  return id;
};

export const updateAchievement = async (id: string, achievement: Partial<AchievementItem>): Promise<void> => {
  const docRef = doc(db, ACHIEVEMENTS_COLLECTION, id);
  await updateDoc(docRef, { ...achievement, updatedAt: new Date().toISOString() });
};

export const deleteAchievement = async (id: string): Promise<void> => {
  const docRef = doc(db, ACHIEVEMENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// Gallery Service
// ==========================================
const GALLERY_COLLECTION = 'gallery';

export const getGalleryList = async (): Promise<GalleryItem[]> => {
  try {
    const collRef = collection(db, GALLERY_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      return defaultGalleryList;
    }
    const list: GalleryItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as GalleryItem);
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.warn('Error fetching gallery from Firestore, using default:', error);
    return defaultGalleryList;
  }
};

export const createGalleryItem = async (item: Omit<GalleryItem, 'id'>): Promise<string> => {
  const id = `gal-${Date.now()}`;
  const docRef = doc(db, GALLERY_COLLECTION, id);
  await setDoc(docRef, { ...item, id });
  return id;
};

export const deleteGalleryItem = async (id: string): Promise<void> => {
  const docRef = doc(db, GALLERY_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// Contact Messages Service
// ==========================================
const MESSAGES_COLLECTION = 'messages';

export const sendMessage = async (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): Promise<string> => {
  const id = `msg-${Date.now()}`;
  const docRef = doc(db, MESSAGES_COLLECTION, id);
  await setDoc(docRef, {
    ...msg,
    id,
    createdAt: new Date().toISOString(),
    isRead: false
  });
  return id;
};

export const getMessagesList = async (): Promise<ContactMessage[]> => {
  try {
    const collRef = collection(db, MESSAGES_COLLECTION);
    const snapshot = await getDocs(collRef);
    const list: ContactMessage[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as ContactMessage);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Error fetching messages:', error);
    return [];
  }
};

export const markMessageRead = async (id: string, isRead = true): Promise<void> => {
  const docRef = doc(db, MESSAGES_COLLECTION, id);
  await updateDoc(docRef, { isRead });
};

export const deleteMessage = async (id: string): Promise<void> => {
  const docRef = doc(db, MESSAGES_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 2: DATA MASTER SERVICES
// ==========================================

// 1. Program Keahlian (Majors)
const MAJORS_COLLECTION = 'majors';

export const getMajorsList = async (): Promise<MajorItem[]> => {
  try {
    const collRef = collection(db, MAJORS_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      // Seed default majors if empty
      for (const m of defaultMajorsList) {
        await setDoc(doc(db, MAJORS_COLLECTION, m.id), m);
      }
      return defaultMajorsList;
    }
    const list: MajorItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as MajorItem);
    });
    return list.sort((a, b) => a.code.localeCompare(b.code));
  } catch (error) {
    console.warn('Error fetching majors from Firestore, falling back to default:', error);
    return defaultMajorsList;
  }
};

export const createMajor = async (major: Omit<MajorItem, 'id' | 'createdAt'>): Promise<string> => {
  const id = `major-${Date.now()}`;
  const docRef = doc(db, MAJORS_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...major, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateMajor = async (id: string, updates: Partial<MajorItem>): Promise<void> => {
  const docRef = doc(db, MAJORS_COLLECTION, id);
  await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
};

export const deleteMajor = async (id: string): Promise<void> => {
  const docRef = doc(db, MAJORS_COLLECTION, id);
  await deleteDoc(docRef);
};

// 2. Mata Pelajaran (Subjects)
const SUBJECTS_COLLECTION = 'subjects';

export const getSubjectsList = async (): Promise<SubjectItem[]> => {
  try {
    const collRef = collection(db, SUBJECTS_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      for (const s of defaultSubjectsList) {
        await setDoc(doc(db, SUBJECTS_COLLECTION, s.id), s);
      }
      return defaultSubjectsList;
    }
    const list: SubjectItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as SubjectItem);
    });
    return list.sort((a, b) => a.code.localeCompare(b.code));
  } catch (error) {
    console.warn('Error fetching subjects from Firestore, falling back to default:', error);
    return defaultSubjectsList;
  }
};

export const createSubject = async (subject: Omit<SubjectItem, 'id' | 'createdAt'>): Promise<string> => {
  const id = `subj-${Date.now()}`;
  const docRef = doc(db, SUBJECTS_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...subject, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateSubject = async (id: string, updates: Partial<SubjectItem>): Promise<void> => {
  const docRef = doc(db, SUBJECTS_COLLECTION, id);
  await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
};

export const deleteSubject = async (id: string): Promise<void> => {
  const docRef = doc(db, SUBJECTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// 3. Guru (Teachers)
const TEACHERS_COLLECTION = 'teachers';

export const getTeachersList = async (): Promise<TeacherItem[]> => {
  try {
    const collRef = collection(db, TEACHERS_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      for (const t of defaultTeachersList) {
        await setDoc(doc(db, TEACHERS_COLLECTION, t.id), t);
      }
      return defaultTeachersList;
    }
    const list: TeacherItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as TeacherItem);
    });
    return list.sort((a, b) => a.fullName.localeCompare(b.fullName));
  } catch (error) {
    console.warn('Error fetching teachers from Firestore, falling back to default:', error);
    return defaultTeachersList;
  }
};

export const createTeacher = async (teacher: Omit<TeacherItem, 'id' | 'createdAt'>): Promise<string> => {
  const id = `tch-${Date.now()}`;
  const docRef = doc(db, TEACHERS_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...teacher, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateTeacher = async (id: string, updates: Partial<TeacherItem>): Promise<void> => {
  const docRef = doc(db, TEACHERS_COLLECTION, id);
  await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
};

export const deleteTeacher = async (id: string): Promise<void> => {
  const docRef = doc(db, TEACHERS_COLLECTION, id);
  await deleteDoc(docRef);
};

// 4. Kelas (Classes)
const CLASSES_COLLECTION = 'classes';

export const getClassesList = async (): Promise<ClassItem[]> => {
  try {
    const collRef = collection(db, CLASSES_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      for (const c of defaultClassesList) {
        await setDoc(doc(db, CLASSES_COLLECTION, c.id), c);
      }
      return defaultClassesList;
    }
    const list: ClassItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as ClassItem);
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn('Error fetching classes from Firestore, falling back to default:', error);
    return defaultClassesList;
  }
};

export const createClass = async (cls: Omit<ClassItem, 'id' | 'createdAt'>): Promise<string> => {
  const id = `cls-${Date.now()}`;
  const docRef = doc(db, CLASSES_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...cls, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateClass = async (id: string, updates: Partial<ClassItem>): Promise<void> => {
  const docRef = doc(db, CLASSES_COLLECTION, id);
  await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
};

export const deleteClass = async (id: string): Promise<void> => {
  const docRef = doc(db, CLASSES_COLLECTION, id);
  await deleteDoc(docRef);
};

// 5. Siswa (Students)
const STUDENTS_COLLECTION = 'students';

export const getStudentsList = async (): Promise<StudentItem[]> => {
  try {
    const collRef = collection(db, STUDENTS_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      for (const s of defaultStudentsList) {
        await setDoc(doc(db, STUDENTS_COLLECTION, s.id), s);
      }
      return defaultStudentsList;
    }
    const list: StudentItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as StudentItem);
    });
    return list.sort((a, b) => a.fullName.localeCompare(b.fullName));
  } catch (error) {
    console.warn('Error fetching students from Firestore, falling back to default:', error);
    return defaultStudentsList;
  }
};

export const createStudent = async (student: Omit<StudentItem, 'id' | 'createdAt'>): Promise<string> => {
  const id = `std-${Date.now()}`;
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...student, id, createdAt: now, updatedAt: now });
  return id;
};

export const bulkCreateStudents = async (students: Omit<StudentItem, 'id' | 'createdAt'>[]): Promise<number> => {
  if (!students || students.length === 0) return 0;
  
  const now = new Date().toISOString();
  const batchSize = 400;
  let count = 0;
  
  for (let i = 0; i < students.length; i += batchSize) {
    const chunk = students.slice(i, i + batchSize);
    const batch = writeBatch(db);
    
    chunk.forEach((student, idx) => {
      const id = `std-${Date.now()}-${i + idx}-${Math.random().toString(36).substring(2, 7)}`;
      const docRef = doc(db, STUDENTS_COLLECTION, id);
      batch.set(docRef, { ...student, id, createdAt: now, updatedAt: now });
      count++;
    });
    
    await batch.commit();
  }
  
  return count;
};

export const updateStudent = async (id: string, updates: Partial<StudentItem>): Promise<void> => {
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
};

export const deleteStudent = async (id: string): Promise<void> => {
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// 6. Master Data Stats calculation
export const getMasterStats = async (): Promise<MasterDataStats> => {
  try {
    const [students, teachers, classes, majors, subjects] = await Promise.all([
      getStudentsList(),
      getTeachersList(),
      getClassesList(),
      getMajorsList(),
      getSubjectsList()
    ]);

    return {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'Aktif').length,
      totalTeachers: teachers.length,
      activeTeachers: teachers.filter(t => t.status === 'Aktif').length,
      totalClasses: classes.length,
      activeClasses: classes.filter(c => c.status === 'Aktif').length,
      totalMajors: majors.length,
      activeMajors: majors.filter(m => m.status === 'Aktif').length,
      totalSubjects: subjects.length,
      activeSubjects: subjects.filter(s => s.status === 'Aktif').length
    };
  } catch (error) {
    console.warn('Error calculating master data stats:', error);
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
  }
};

// ==========================================
// Seeder / Database Initialization
// ==========================================
export const seedInitialData = async (forceOverwrite = false): Promise<void> => {
  try {
    // Check if school_info exists
    const schoolDoc = doc(db, SCHOOL_INFO_COLLECTION, SCHOOL_INFO_DOC_ID);
    const schoolSnap = await getDoc(schoolDoc);
    if (!schoolSnap.exists() || forceOverwrite) {
      await setDoc(schoolDoc, defaultSchoolInfo);
    }

    // Seed News
    const newsSnap = await getDocs(collection(db, NEWS_COLLECTION));
    if (newsSnap.empty || forceOverwrite) {
      for (const item of defaultNewsList) {
        await setDoc(doc(db, NEWS_COLLECTION, item.id), item);
      }
    }

    // Seed Events
    const eventsSnap = await getDocs(collection(db, EVENTS_COLLECTION));
    if (eventsSnap.empty || forceOverwrite) {
      for (const item of defaultEventsList) {
        await setDoc(doc(db, EVENTS_COLLECTION, item.id), item);
      }
    }

    // Seed Achievements
    const achSnap = await getDocs(collection(db, ACHIEVEMENTS_COLLECTION));
    if (achSnap.empty || forceOverwrite) {
      for (const item of defaultAchievementsList) {
        await setDoc(doc(db, ACHIEVEMENTS_COLLECTION, item.id), item);
      }
    }

    // Seed Gallery
    const galSnap = await getDocs(collection(db, GALLERY_COLLECTION));
    if (galSnap.empty || forceOverwrite) {
      for (const item of defaultGalleryList) {
        await setDoc(doc(db, GALLERY_COLLECTION, item.id), item);
      }
    }

    // Seed Majors
    const majorsSnap = await getDocs(collection(db, MAJORS_COLLECTION));
    if (majorsSnap.empty || forceOverwrite) {
      for (const item of defaultMajorsList) {
        await setDoc(doc(db, MAJORS_COLLECTION, item.id), item);
      }
    }

    // Seed Subjects
    const subjectsSnap = await getDocs(collection(db, SUBJECTS_COLLECTION));
    if (subjectsSnap.empty || forceOverwrite) {
      for (const item of defaultSubjectsList) {
        await setDoc(doc(db, SUBJECTS_COLLECTION, item.id), item);
      }
    }

    // Seed Teachers
    const teachersSnap = await getDocs(collection(db, TEACHERS_COLLECTION));
    if (teachersSnap.empty || forceOverwrite) {
      for (const item of defaultTeachersList) {
        await setDoc(doc(db, TEACHERS_COLLECTION, item.id), item);
      }
    }

    // Seed Classes
    const classesSnap = await getDocs(collection(db, CLASSES_COLLECTION));
    if (classesSnap.empty || forceOverwrite) {
      for (const item of defaultClassesList) {
        await setDoc(doc(db, CLASSES_COLLECTION, item.id), item);
      }
    }

    // Seed Students
    const studentsSnap = await getDocs(collection(db, STUDENTS_COLLECTION));
    if (studentsSnap.empty || forceOverwrite) {
      for (const item of defaultStudentsList) {
        await setDoc(doc(db, STUDENTS_COLLECTION, item.id), item);
      }
    }

    // Seed Academic Years
    const aySnap = await getDocs(collection(db, ACADEMIC_YEARS_COLLECTION));
    if (aySnap.empty || forceOverwrite) {
      for (const item of defaultAcademicYearsList) {
        await setDoc(doc(db, ACADEMIC_YEARS_COLLECTION, item.id), item);
      }
    }

    // Seed Schedules
    const schSnap = await getDocs(collection(db, SCHEDULES_COLLECTION));
    if (schSnap.empty || forceOverwrite) {
      for (const item of defaultSchedulesList) {
        await setDoc(doc(db, SCHEDULES_COLLECTION, item.id), item);
      }
    }

    // Seed Attendance
    const attSnap = await getDocs(collection(db, ATTENDANCE_COLLECTION));
    if (attSnap.empty || forceOverwrite) {
      for (const item of defaultAttendanceList) {
        await setDoc(doc(db, ATTENDANCE_COLLECTION, item.id), item);
      }
    }

    // Seed Grades
    const grdSnap = await getDocs(collection(db, GRADES_COLLECTION));
    if (grdSnap.empty || forceOverwrite) {
      for (const item of defaultGradesList) {
        await setDoc(doc(db, GRADES_COLLECTION, item.id), item);
      }
    }

    // Seed System Settings
    const setSnap = await getDoc(doc(db, SYSTEM_SETTINGS_COLLECTION, SYSTEM_SETTINGS_DOC_ID));
    if (!setSnap.exists() || forceOverwrite) {
      await setDoc(doc(db, SYSTEM_SETTINGS_COLLECTION, SYSTEM_SETTINGS_DOC_ID), {
        ...defaultSystemSettings,
        updatedAt: new Date().toISOString()
      });
    }

    console.log('Firebase sample, master, and academic data seeded successfully.');
  } catch (error) {
    console.error('Error seeding initial data to Firestore:', error);
  }
};

// ==========================================
// FASE 3: ACADEMIC YEARS SERVICE
// ==========================================
export const ACADEMIC_YEARS_COLLECTION = 'academic_years';

export const getAcademicYearsList = async (): Promise<AcademicYearItem[]> => {
  try {
    const collRef = collection(db, ACADEMIC_YEARS_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      await seedInitialData();
      return defaultAcademicYearsList;
    }
    const list: AcademicYearItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as AcademicYearItem);
    });
    return list.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0) || b.name.localeCompare(a.name));
  } catch (error) {
    console.warn('Error fetching academic years from Firestore:', error);
    return defaultAcademicYearsList;
  }
};

export const createAcademicYear = async (item: Omit<AcademicYearItem, 'id'>): Promise<string> => {
  const id = `ay-${Date.now()}`;
  const docRef = doc(db, ACADEMIC_YEARS_COLLECTION, id);
  
  // If set to active, deactivate all other years first
  if (item.isActive) {
    await deactivateAllAcademicYears(id);
  }

  await setDoc(docRef, { ...item, id, createdAt: new Date().toISOString() });
  return id;
};

export const updateAcademicYear = async (id: string, item: Partial<AcademicYearItem>): Promise<void> => {
  if (item.isActive) {
    await deactivateAllAcademicYears(id);
  }
  const docRef = doc(db, ACADEMIC_YEARS_COLLECTION, id);
  await updateDoc(docRef, { ...item, updatedAt: new Date().toISOString() });
};

export const setActiveAcademicYear = async (id: string): Promise<void> => {
  await deactivateAllAcademicYears(id);
  const docRef = doc(db, ACADEMIC_YEARS_COLLECTION, id);
  await updateDoc(docRef, { isActive: true, updatedAt: new Date().toISOString() });
};

export const deleteAcademicYear = async (id: string): Promise<void> => {
  const docRef = doc(db, ACADEMIC_YEARS_COLLECTION, id);
  await deleteDoc(docRef);
};

const deactivateAllAcademicYears = async (exceptId?: string): Promise<void> => {
  try {
    const collRef = collection(db, ACADEMIC_YEARS_COLLECTION);
    const snapshot = await getDocs(collRef);
    const batch = writeBatch(db);
    snapshot.forEach(d => {
      if (d.id !== exceptId && d.data().isActive) {
        batch.update(d.ref, { isActive: false, updatedAt: new Date().toISOString() });
      }
    });
    await batch.commit();
  } catch (err) {
    console.warn('Could not deactivate all academic years via batch:', err);
  }
};

// ==========================================
// FASE 3: SCHEDULES SERVICE
// ==========================================
export const SCHEDULES_COLLECTION = 'schedules';

export const getSchedulesList = async (): Promise<ScheduleItem[]> => {
  try {
    const collRef = collection(db, SCHEDULES_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      await seedInitialData();
      return defaultSchedulesList;
    }
    const list: ScheduleItem[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as ScheduleItem);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching schedules from Firestore:', error);
    return defaultSchedulesList;
  }
};

// Validasi bentrok jadwal
export interface ScheduleConflictResult {
  hasConflict: boolean;
  conflictType?: 'teacher' | 'class' | 'room';
  conflictMessage?: string;
  conflictingSchedule?: ScheduleItem;
}

export const checkScheduleConflict = (
  newSchedule: Omit<ScheduleItem, 'id'> & { id?: string },
  existingSchedules: ScheduleItem[],
  excludeScheduleId?: string
): ScheduleConflictResult => {
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
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
    // Skip self if editing
    if (excludeScheduleId && item.id === excludeScheduleId) continue;
    if (item.status === 'Nonaktif') continue;
    if (item.academicYearId !== newSchedule.academicYearId) continue;
    if (item.day !== newSchedule.day) continue;

    const itemStart = timeToMinutes(item.startTime);
    const itemEnd = timeToMinutes(item.endTime);

    // Overlap condition: startA < endB and endA > startB
    const isOverlapping = (newStart < itemEnd) && (newEnd > itemStart);

    if (isOverlapping) {
      // 1. Guru Conflict
      if (item.teacherId === newSchedule.teacherId) {
        return {
          hasConflict: true,
          conflictType: 'teacher',
          conflictMessage: `Bentrok Guru: Guru bersangkutan sudah memiliki jadwal mengajar pada hari ${item.day} pukul ${item.startTime} - ${item.endTime}.`,
          conflictingSchedule: item
        };
      }

      // 2. Kelas Conflict
      if (item.classId === newSchedule.classId) {
        return {
          hasConflict: true,
          conflictType: 'class',
          conflictMessage: `Bentrok Kelas: Kelas ini sudah memiliki mata pelajaran pada hari ${item.day} pukul ${item.startTime} - ${item.endTime}.`,
          conflictingSchedule: item
        };
      }

      // 3. Ruangan Conflict (hanya jika ada ruangan yang sama dan tidak kosong)
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
  const id = `sch-${Date.now()}`;
  const docRef = doc(db, SCHEDULES_COLLECTION, id);
  await setDoc(docRef, { ...schedule, id, createdAt: new Date().toISOString() });
  return id;
};

export const updateSchedule = async (id: string, schedule: Partial<ScheduleItem>): Promise<void> => {
  const docRef = doc(db, SCHEDULES_COLLECTION, id);
  await updateDoc(docRef, { ...schedule, updatedAt: new Date().toISOString() });
};

export const deleteSchedule = async (id: string): Promise<void> => {
  const docRef = doc(db, SCHEDULES_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 3: ATTENDANCE SERVICE
// ==========================================
export const ATTENDANCE_COLLECTION = 'attendance';

export const getAttendanceList = async (): Promise<AttendanceRecord[]> => {
  try {
    const collRef = collection(db, ATTENDANCE_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      await seedInitialData();
      return defaultAttendanceList;
    }
    const list: AttendanceRecord[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.warn('Error fetching attendance from Firestore:', error);
    return defaultAttendanceList;
  }
};

export const saveAttendanceRecord = async (record: Omit<AttendanceRecord, 'id'> & { id?: string }): Promise<string> => {
  const id = record.id || `att-${Date.now()}`;
  const docRef = doc(db, ATTENDANCE_COLLECTION, id);
  await setDoc(docRef, { 
    ...record, 
    id, 
    updatedAt: new Date().toISOString(),
    createdAt: record.createdAt || new Date().toISOString()
  }, { merge: true });
  return id;
};

export const deleteAttendanceRecord = async (id: string): Promise<void> => {
  const docRef = doc(db, ATTENDANCE_COLLECTION, id);
  await deleteDoc(docRef);
};

// Helper: Hitung rekap absensi per siswa dalam kelas tertentu
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
      : 100; // default 100% jika belum ada pertemuan

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
// FASE 3: GRADES SERVICE & FORMULA
// ==========================================
export const GRADES_COLLECTION = 'grades';

/**
 * Rumus Perhitungan Nilai Akhir:
 * Nilai Akhir = (Kehadiran × 45%) + (Tugas & Ulangan × 20%) + (UTS × 15%) + (UAS × 20%)
 */
export const calculateFinalGrade = (
  attendanceScore: number,
  assignmentScore: number,
  utsScore: number,
  uasScore: number,
  customWeights?: { attendance?: number; assignment?: number; uts?: number; uas?: number }
): { finalScore: number; letterGrade: 'A' | 'B' | 'C' | 'D' | 'E'; predicate: string } => {
  // Bobot persentase (default 45%, 20%, 15%, 20% jika tidak ditentukan)
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
  try {
    const collRef = collection(db, GRADES_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) {
      await seedInitialData();
      return defaultGradesList;
    }
    const list: GradeRecord[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as GradeRecord);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching grades from Firestore:', error);
    return defaultGradesList;
  }
};

export interface GradeInputPayload {
  id?: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  academicYearId: string;
  semester: SemesterType;
  attendanceScore: number;
  assignmentScore: number;
  utsScore: number;
  uasScore: number;
  finalScore?: number;
  letterGrade?: 'A' | 'B' | 'C' | 'D' | 'E';
  predicate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const saveGradeRecord = async (
  grade: GradeInputPayload,
  customWeights?: { attendance?: number; assignment?: number; uts?: number; uas?: number }
): Promise<string> => {
  const id = grade.id || `grd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, GRADES_COLLECTION, id);

  // Auto-calculate finalScore and letterGrade based on component inputs
  const calculated = calculateFinalGrade(
    grade.attendanceScore || 0,
    grade.assignmentScore || 0,
    grade.utsScore || 0,
    grade.uasScore || 0,
    customWeights
  );

  const payload: GradeRecord = {
    ...grade,
    id,
    finalScore: calculated.finalScore,
    letterGrade: calculated.letterGrade,
    predicate: calculated.predicate,
    updatedAt: new Date().toISOString(),
    createdAt: grade.createdAt || new Date().toISOString()
  };

  await setDoc(docRef, payload, { merge: true });
  return id;
};

export const saveGradesBatch = async (
  grades: GradeInputPayload[],
  customWeights?: { attendance?: number; assignment?: number; uts?: number; uas?: number }
): Promise<void> => {
  const batch = writeBatch(db);
  grades.forEach(g => {
    const id = g.id || `grd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const calculated = calculateFinalGrade(
      g.attendanceScore || 0,
      g.assignmentScore || 0,
      g.utsScore || 0,
      g.uasScore || 0,
      customWeights
    );
    const docRef = doc(db, GRADES_COLLECTION, id);
    batch.set(docRef, {
      ...g,
      id,
      finalScore: calculated.finalScore,
      letterGrade: calculated.letterGrade,
      predicate: calculated.predicate,
      updatedAt: new Date().toISOString(),
      createdAt: g.createdAt || new Date().toISOString()
    }, { merge: true });
  });
  await batch.commit();
};

export const deleteGradeRecord = async (id: string): Promise<void> => {
  const docRef = doc(db, GRADES_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// SYSTEM SETTINGS SERVICE
// ==========================================
export const SYSTEM_SETTINGS_COLLECTION = 'system_settings';
export const SYSTEM_SETTINGS_DOC_ID = 'main';

export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const docRef = doc(db, SYSTEM_SETTINGS_COLLECTION, SYSTEM_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...defaultSystemSettings, ...docSnap.data() } as SystemSettings;
    }
    // If not exists yet in Firestore, save default and return
    await setDoc(docRef, { ...defaultSystemSettings, updatedAt: new Date().toISOString() });
    return defaultSystemSettings;
  } catch (error) {
    console.warn('Error fetching system settings from Firestore, falling back to default:', error);
    return defaultSystemSettings;
  }
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<void> => {
  const docRef = doc(db, SYSTEM_SETTINGS_COLLECTION, SYSTEM_SETTINGS_DOC_ID);
  await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
};

// ==========================================
// FASE 5: PKL - COMPANIES SERVICE
// ==========================================
export const COMPANIES_COLLECTION = 'companies';

export const getCompanies = async (): Promise<CompanyItem[]> => {
  try {
    const q = query(collection(db, COMPANIES_COLLECTION), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultCompaniesList;
    }
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CompanyItem));
  } catch (error) {
    console.warn('Error fetching companies from Firestore, falling back to default:', error);
    return defaultCompaniesList;
  }
};

export const addCompany = async (company: Omit<CompanyItem, 'id' | 'createdAt'>): Promise<string> => {
  const id = `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, COMPANIES_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...company, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateCompany = async (id: string, data: Partial<CompanyItem>): Promise<void> => {
  const docRef = doc(db, COMPANIES_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteCompany = async (id: string): Promise<void> => {
  const docRef = doc(db, COMPANIES_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 5: PKL - INTERNSHIPS (PENEMPATAN) SERVICE
// ==========================================
export const INTERNSHIPS_COLLECTION = 'internships';

export const getInternships = async (): Promise<InternshipItem[]> => {
  try {
    const q = query(collection(db, INTERNSHIPS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultInternshipsList;
    }
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as InternshipItem));
  } catch (error) {
    console.warn('Error fetching internships from Firestore, falling back to default:', error);
    return defaultInternshipsList;
  }
};

export const addInternship = async (internship: Omit<InternshipItem, 'id' | 'createdAt'>): Promise<string> => {
  const id = `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, INTERNSHIPS_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...internship, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateInternship = async (id: string, data: Partial<InternshipItem>): Promise<void> => {
  const docRef = doc(db, INTERNSHIPS_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteInternship = async (id: string): Promise<void> => {
  const docRef = doc(db, INTERNSHIPS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 5: PKL - JOURNALS SERVICE
// ==========================================
export const INTERNSHIP_JOURNALS_COLLECTION = 'internship_journals';

export const getInternshipJournals = async (internshipId?: string, studentId?: string): Promise<InternshipJournal[]> => {
  try {
    const q = query(collection(db, INTERNSHIP_JOURNALS_COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      let list = defaultInternshipJournalsList;
      if (internshipId) list = list.filter(j => j.internshipId === internshipId);
      if (studentId) list = list.filter(j => j.studentId === studentId);
      return list;
    }
    let results = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as InternshipJournal));
    if (internshipId) results = results.filter(j => j.internshipId === internshipId);
    if (studentId) results = results.filter(j => j.studentId === studentId);
    return results;
  } catch (error) {
    console.warn('Error fetching internship journals from Firestore, falling back to default:', error);
    let list = defaultInternshipJournalsList;
    if (internshipId) list = list.filter(j => j.internshipId === internshipId);
    if (studentId) list = list.filter(j => j.studentId === studentId);
    return list;
  }
};

export const addInternshipJournal = async (journal: Omit<InternshipJournal, 'id' | 'createdAt'>): Promise<string> => {
  const id = `jrn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, INTERNSHIP_JOURNALS_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...journal, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateInternshipJournal = async (id: string, data: Partial<InternshipJournal>): Promise<void> => {
  const docRef = doc(db, INTERNSHIP_JOURNALS_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteInternshipJournal = async (id: string): Promise<void> => {
  const docRef = doc(db, INTERNSHIP_JOURNALS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 5: PKL - MONITORING SERVICE
// ==========================================
export const INTERNSHIP_MONITORING_COLLECTION = 'internship_monitoring';

export const getInternshipMonitoring = async (): Promise<InternshipMonitoring[]> => {
  try {
    const q = query(collection(db, INTERNSHIP_MONITORING_COLLECTION), orderBy('visitDate', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultInternshipMonitoringList;
    }
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as InternshipMonitoring));
  } catch (error) {
    console.warn('Error fetching internship monitoring from Firestore, falling back to default:', error);
    return defaultInternshipMonitoringList;
  }
};

export const addInternshipMonitoring = async (monitoring: Omit<InternshipMonitoring, 'id' | 'createdAt'>): Promise<string> => {
  const id = `mon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, INTERNSHIP_MONITORING_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...monitoring, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateInternshipMonitoring = async (id: string, data: Partial<InternshipMonitoring>): Promise<void> => {
  const docRef = doc(db, INTERNSHIP_MONITORING_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteInternshipMonitoring = async (id: string): Promise<void> => {
  const docRef = doc(db, INTERNSHIP_MONITORING_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 5: PKL - GRADES (PENILAIAN) SERVICE
// ==========================================
export const INTERNSHIP_GRADES_COLLECTION = 'internship_grades';

export const getInternshipGrades = async (): Promise<InternshipGrade[]> => {
  try {
    const q = query(collection(db, INTERNSHIP_GRADES_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultInternshipGradesList;
    }
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as InternshipGrade));
  } catch (error) {
    console.warn('Error fetching internship grades from Firestore, falling back to default:', error);
    return defaultInternshipGradesList;
  }
};

export const saveInternshipGrade = async (grade: Partial<InternshipGrade> & { internshipId: string; studentId: string }): Promise<string> => {
  const id = grade.id || `igrd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, INTERNSHIP_GRADES_COLLECTION, id);
  const now = new Date().toISOString();

  const indScore = grade.industryScore ?? 0;
  const tchScore = grade.teacherScore ?? 0;
  const finalScore = Number(((indScore * 0.6) + (tchScore * 0.4)).toFixed(2));
  
  let predicate = 'Kurang';
  if (finalScore >= 90) predicate = 'Sangat Baik';
  else if (finalScore >= 80) predicate = 'Baik';
  else if (finalScore >= 70) predicate = 'Cukup';

  const fullData: InternshipGrade = {
    id,
    internshipId: grade.internshipId,
    studentId: grade.studentId,
    industryScore: indScore,
    teacherScore: tchScore,
    finalScore,
    predicate,
    notes: grade.notes || '',
    isPublished: grade.isPublished ?? true,
    createdAt: grade.createdAt || now,
    updatedAt: now
  };

  await setDoc(docRef, fullData, { merge: true });
  return id;
};

export const deleteInternshipGrade = async (id: string): Promise<void> => {
  const docRef = doc(db, INTERNSHIP_GRADES_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 5: BKK - JOBS (LOWONGAN KERJA) SERVICE
// ==========================================
export const JOBS_COLLECTION = 'jobs';

export const getJobs = async (): Promise<JobItem[]> => {
  try {
    const q = query(collection(db, JOBS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultJobsList;
    }
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as JobItem));
  } catch (error) {
    console.warn('Error fetching jobs from Firestore, falling back to default:', error);
    return defaultJobsList;
  }
};

export const addJob = async (job: Omit<JobItem, 'id' | 'createdAt'>): Promise<string> => {
  const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, JOBS_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...job, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateJob = async (id: string, data: Partial<JobItem>): Promise<void> => {
  const docRef = doc(db, JOBS_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteJob = async (id: string): Promise<void> => {
  const docRef = doc(db, JOBS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 5: BKK - RECRUITMENT / APPLICATIONS SERVICE
// ==========================================
export const JOB_APPLICATIONS_COLLECTION = 'job_applications';

export const getJobApplications = async (jobId?: string): Promise<JobApplication[]> => {
  try {
    const q = query(collection(db, JOB_APPLICATIONS_COLLECTION), orderBy('appliedAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      let list = defaultJobApplicationsList;
      if (jobId) list = list.filter(a => a.jobId === jobId);
      return list;
    }
    let results = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as JobApplication));
    if (jobId) results = results.filter(a => a.jobId === jobId);
    return results;
  } catch (error) {
    console.warn('Error fetching job applications from Firestore, falling back to default:', error);
    let list = defaultJobApplicationsList;
    if (jobId) list = list.filter(a => a.jobId === jobId);
    return list;
  }
};

export const applyForJob = async (application: Omit<JobApplication, 'id' | 'appliedAt'>): Promise<string> => {
  const id = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, JOB_APPLICATIONS_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...application, id, appliedAt: now, updatedAt: now });
  return id;
};

export const updateJobApplicationStatus = async (id: string, status: JobApplication['status'], notes?: string): Promise<void> => {
  const docRef = doc(db, JOB_APPLICATIONS_COLLECTION, id);
  const updatePayload: any = { status, updatedAt: new Date().toISOString() };
  if (notes !== undefined) updatePayload.notes = notes;
  await updateDoc(docRef, updatePayload);
};

export const deleteJobApplication = async (id: string): Promise<void> => {
  const docRef = doc(db, JOB_APPLICATIONS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 5: ALUMNI SERVICE
// ==========================================
export const ALUMNI_COLLECTION = 'alumni';

export const getAlumniList = async (): Promise<AlumniItem[]> => {
  try {
    const q = query(collection(db, ALUMNI_COLLECTION), orderBy('graduationYear', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultAlumniList;
    }
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AlumniItem));
  } catch (error) {
    console.warn('Error fetching alumni from Firestore, falling back to default:', error);
    return defaultAlumniList;
  }
};

export const addAlumni = async (alumni: Omit<AlumniItem, 'id' | 'createdAt'>): Promise<string> => {
  const id = `alm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, ALUMNI_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...alumni, id, createdAt: now, updatedAt: now });
  return id;
};

export const updateAlumni = async (id: string, data: Partial<AlumniItem>): Promise<void> => {
  const docRef = doc(db, ALUMNI_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteAlumni = async (id: string): Promise<void> => {
  const docRef = doc(db, ALUMNI_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// FASE 5: TRACER STUDY SURVEY & RESPONSES SERVICE
// ==========================================
export const TRACER_SURVEYS_COLLECTION = 'tracer_surveys';
export const TRACER_RESPONSES_COLLECTION = 'tracer_responses';

export const getTracerSurveys = async (): Promise<TracerSurvey[]> => {
  try {
    const snapshot = await getDocs(collection(db, TRACER_SURVEYS_COLLECTION));
    if (snapshot.empty) {
      for (const s of defaultTracerSurveysList) {
        await setDoc(doc(db, TRACER_SURVEYS_COLLECTION, s.id), s);
      }
      return defaultTracerSurveysList;
    }
    return snapshot.docs.map(d => {
      const data = d.data() as TracerSurvey;
      const questions = (data.questions || []).map((q: any) => ({
        ...q,
        question: q.question || q.text || '',
        text: q.text || q.question || ''
      }));
      return {
        ...data,
        id: d.id,
        questions
      };
    });
  } catch (error) {
    console.warn('Error fetching tracer surveys from Firestore, falling back to default:', error);
    return defaultTracerSurveysList;
  }
};

export const saveTracerSurvey = async (survey: Partial<TracerSurvey> & { title: string; questions: any[] }): Promise<string> => {
  const id = survey.id || `survey-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, TRACER_SURVEYS_COLLECTION, id);
  const now = new Date().toISOString();
  const normalizedQuestions = (survey.questions || []).map((q: any) => ({
    ...q,
    question: q.question || q.text || '',
    text: q.text || q.question || ''
  }));
  const fullData: TracerSurvey = {
    id,
    title: survey.title,
    description: survey.description || '',
    targetGraduationYears: survey.targetGraduationYears || ['2022', '2023', '2024', '2025'],
    isActive: survey.isActive ?? true,
    questions: normalizedQuestions,
    createdAt: survey.createdAt || now,
    updatedAt: now
  };
  await setDoc(docRef, fullData, { merge: true });
  return id;
};

export const getTracerResponses = async (surveyId?: string): Promise<TracerResponse[]> => {
  try {
    const q = query(collection(db, TRACER_RESPONSES_COLLECTION), orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      let list = defaultTracerResponsesList;
      if (surveyId) list = list.filter(r => r.surveyId === surveyId);
      return list;
    }
    let results = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as TracerResponse));
    if (surveyId) results = results.filter(r => r.surveyId === surveyId);
    return results;
  } catch (error) {
    console.warn('Error fetching tracer responses from Firestore, falling back to default:', error);
    let list = defaultTracerResponsesList;
    if (surveyId) list = list.filter(r => r.surveyId === surveyId);
    return list;
  }
};

export const submitTracerResponse = async (response: Omit<TracerResponse, 'id' | 'submittedAt'>): Promise<string> => {
  const id = `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, TRACER_RESPONSES_COLLECTION, id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...response, id, submittedAt: now });
  return id;
};

// Aliases for unified naming convention
export const getCompaniesList = getCompanies;
export const getInternshipsList = getInternships;
export const getInternshipJournalsList = getInternshipJournals;
export const getInternshipMonitoringList = getInternshipMonitoring;
export const getInternshipGradesList = getInternshipGrades;
export const getJobsList = getJobs;
export const getJobApplicationsList = getJobApplications;
export const getTracerSurveysList = getTracerSurveys;
export const getTracerResponsesList = getTracerResponses;

// ============================================================================
// FASE 6: ROLE MANAGEMENT, USERS, AUDIT LOGS & BACKUP
// ============================================================================

export const USERS_COLLECTION = 'users';
export const AUDIT_LOGS_COLLECTION = 'audit_logs';

export const getUsers = async (): Promise<UserAccount[]> => {
  try {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultUsersList;
    }
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as UserAccount));
  } catch (error) {
    console.warn('Error fetching users from Firestore, falling back to default:', error);
    return defaultUsersList;
  }
};

export const saveUser = async (userAccount: UserAccount): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, userAccount.id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...userAccount, updatedAt: now }, { merge: true });
};

export const deleteUser = async (userId: string): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(docRef);
};

export const updateUserStatus = async (userId: string, status: 'Aktif' | 'Nonaktif'): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const now = new Date().toISOString();
  await updateDoc(docRef, { status, updatedAt: now });
};

export const updateUserRole = async (userId: string, role: UserAccount['role']): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const now = new Date().toISOString();
  await updateDoc(docRef, { role, updatedAt: now });
};

export const getAuditLogs = async (limitCount = 100): Promise<AuditLogItem[]> => {
  try {
    const q = query(collection(db, AUDIT_LOGS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultAuditLogsList;
    }
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AuditLogItem)).slice(0, limitCount);
  } catch (error) {
    console.warn('Error fetching audit logs from Firestore, falling back to default:', error);
    return defaultAuditLogsList;
  }
};

export const logAuditEvent = async (
  action: AuditAction,
  module: AuditModule,
  targetId: string,
  description: string,
  targetName?: string,
  userOverride?: { uid?: string; email?: string; role?: string }
): Promise<void> => {
  try {
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(db, AUDIT_LOGS_COLLECTION, id);
    const now = new Date().toISOString();
    
    // Grab currentUser safely from auth
    const currentAuthUser = auth.currentUser;
    const userId = userOverride?.uid || currentAuthUser?.uid || 'system';
    const userEmail = userOverride?.email || currentAuthUser?.email || 'admin@smkpgri.sch.id';
    const userRole = userOverride?.role || 'admin';

    const logEntry: AuditLogItem = {
      id,
      userId,
      userEmail,
      userRole,
      action,
      module,
      targetId,
      targetName: targetName || '',
      description,
      ipAddress: '180.252.164.22', // Client gateway network
      createdAt: now
    };

    await setDoc(docRef, logEntry);
  } catch (err) {
    console.warn('Silent notice: could not write audit log:', err);
  }
};

export const getUsersList = getUsers;
export const getAuditLogsList = getAuditLogs;

// Additional convenience wrappers for portal operations
export const saveJob = async (job: any): Promise<string> => {
  if (job.id) {
    await updateJob(job.id, job);
    return job.id;
  }
  return await addJob(job);
};

export const saveCompany = async (company: any): Promise<string> => {
  if (company.id) {
    await updateCompany(company.id, company);
    return company.id;
  }
  return await addCompany(company);
};

export const saveInternshipJournal = async (journal: any): Promise<string> => {
  if (journal.id) {
    await updateInternshipJournal(journal.id, journal);
    return journal.id;
  }
  return await addInternshipJournal(journal);
};

export const submitJobApplication = async (app: any): Promise<string> => {
  return await applyForJob(app);
};

export const saveAttendanceBulk = async (records: any[]): Promise<void> => {
  if (!records || records.length === 0) return;
  for (const r of records) {
    if (r.id) {
      const docRef = doc(db, ATTENDANCE_COLLECTION, r.id);
      await setDoc(docRef, r, { merge: true });
    } else {
      await saveAttendanceRecord(r);
    }
  }
};

export const saveGrade = async (grade: any): Promise<string> => {
  return await saveGradeRecord(grade);
};

export const verifyInternshipJournal = async (id: string, status: any, notes?: string): Promise<void> => {
  await updateInternshipJournal(id, { status, teacherNotes: notes });
};

export const saveInternshipMonitoring = async (monitoring: any): Promise<string> => {
  if (monitoring.id) {
    await updateInternshipMonitoring(monitoring.id, monitoring);
    return monitoring.id;
  }
  return await addInternshipMonitoring(monitoring);
};





