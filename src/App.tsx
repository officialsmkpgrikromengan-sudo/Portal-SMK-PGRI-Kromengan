import React, { useState, useEffect, useMemo } from 'react';
import { syncSchoolInfoWithMajors } from './utils/majorsSync';
import { 
  SchoolInfo, 
  NewsItem, 
  EventItem, 
  AchievementItem, 
  GalleryItem, 
  ContactMessage, 
  NavigationPage, 
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
  TracerResponse
} from './types';
import { 
  getSchoolInfo, 
  getNewsList, 
  getEventsList, 
  getAchievementsList, 
  getGalleryList, 
  getMessagesList,
  getStudentsList,
  getTeachersList,
  getClassesList,
  getMajorsList,
  getSubjectsList,
  getAcademicYearsList,
  getSchedulesList,
  getAttendanceList,
  getGradesList,
  getSystemSettings,
  getCompaniesList,
  getInternshipsList,
  getInternshipJournalsList,
  getInternshipMonitoringList,
  getInternshipGradesList,
  getJobsList,
  getJobApplicationsList,
  getAlumniList,
  getTracerSurveysList,
  getTracerResponsesList
} from './lib/api';
import { 
  defaultSchoolInfo, 
  defaultNewsList, 
  defaultEventsList, 
  defaultAchievementsList, 
  defaultGalleryList, 
  defaultStudentsList,
  defaultTeachersList,
  defaultClassesList,
  defaultMajorsList,
  defaultSubjectsList,
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
  defaultTracerResponsesList
} from './data/defaultData';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Public Components
import { HomeView } from './components/public/HomeView';
import { ProfileView } from './components/public/ProfileView';
import { ProgramsView } from './components/public/ProgramsView';
import { NewsView } from './components/public/NewsView';
import { EventsView } from './components/public/EventsView';
import { AchievementsView } from './components/public/AchievementsView';
import { GalleryView } from './components/public/GalleryView';
import { ContactView } from './components/public/ContactView';
import { CareerView } from './components/public/CareerView';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminSchoolInfo } from './components/admin/AdminSchoolInfo';
import { AdminNews } from './components/admin/AdminNews';
import { AdminEvents } from './components/admin/AdminEvents';
import { AdminAchievements } from './components/admin/AdminAchievements';
import { AdminGallery } from './components/admin/AdminGallery';
import { AdminMessages } from './components/admin/AdminMessages';
import { AdminSettings } from './components/admin/AdminSettings';

// Admin Master Data Components (Fase 2)
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminTeachers } from './components/admin/AdminTeachers';
import { AdminClasses } from './components/admin/AdminClasses';
import { AdminMajors } from './components/admin/AdminMajors';
import { AdminSubjects } from './components/admin/AdminSubjects';

// Admin Academic Components (Fase 3)
import { AdminAcademicYears } from './components/admin/AdminAcademicYears';
import { AdminSchedules } from './components/admin/AdminSchedules';
import { AdminAttendance } from './components/admin/AdminAttendance';
import { AdminGrades } from './components/admin/AdminGrades';

// Admin Phase 5 Components (PKL, BKK, Alumni)
import { AdminPKL } from './components/admin/AdminPKL';
import { AdminBKK } from './components/admin/AdminBKK';
import { AdminAlumni } from './components/admin/AdminAlumni';

// Admin Phase 6 Components (Manajemen, Laporan, Keamanan, RBAC & Backup)
import { AdminManagement } from './components/admin/AdminManagement';
import { AdminReports } from './components/admin/AdminReports';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminBackupDoc } from './components/admin/AdminBackupDoc';

// Portals (Guru, BKK) & Login Modal
import { TeacherPortal } from './components/portals/TeacherPortal';
import { BkkPortal } from './components/portals/BkkPortal';
import { PortalLoginModal } from './components/portals/PortalLoginModal';

export function App() {
  const { user, currentUserAccount, role, loading: authLoading } = useAuth();
  const { error } = useToast();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [inAdminMode, setInAdminMode] = useState<boolean>(false);
  const [inPortalMode, setInPortalMode] = useState<boolean>(true);
  const [currentAdminSection, setCurrentAdminSection] = useState<AdminSection>('dashboard');

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalInitialRole, setLoginModalInitialRole] = useState<'guru' | 'bkk' | 'admin'>('guru');

  // Selected item modal states (for direct linking / view from Home)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Quick action modal triggers for admin
  const [quickCreateModal, setQuickCreateModal] = useState<{
    news: boolean;
    event: boolean;
    achievement: boolean;
    gallery: boolean;
  }>({
    news: false,
    event: false,
    achievement: false,
    gallery: false
  });

  // CMS Content Data State (Fase 1)
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(defaultSchoolInfo);
  const [newsList, setNewsList] = useState<NewsItem[]>(defaultNewsList);
  const [eventsList, setEventsList] = useState<EventItem[]>(defaultEventsList);
  const [achievementsList, setAchievementsList] = useState<AchievementItem[]>(defaultAchievementsList);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(defaultGalleryList);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);

  // Master Data State (Fase 2)
  const [studentsList, setStudentsList] = useState<StudentItem[]>(defaultStudentsList);
  const [teachersList, setTeachersList] = useState<TeacherItem[]>(defaultTeachersList);
  const [classesList, setClassesList] = useState<ClassItem[]>(defaultClassesList);
  const [majorsList, setMajorsList] = useState<MajorItem[]>(defaultMajorsList);
  const [subjectsList, setSubjectsList] = useState<SubjectItem[]>(defaultSubjectsList);

  // Academic System State (Fase 3)
  const [academicYearsList, setAcademicYearsList] = useState<AcademicYearItem[]>(defaultAcademicYearsList);
  const [schedulesList, setSchedulesList] = useState<ScheduleItem[]>(defaultSchedulesList);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(defaultAttendanceList);
  const [gradesList, setGradesList] = useState<GradeRecord[]>(defaultGradesList);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);

  // Phase 5 State: PKL, BKK & Alumni
  const [companiesList, setCompaniesList] = useState<CompanyItem[]>(defaultCompaniesList);
  const [internshipsList, setInternshipsList] = useState<InternshipItem[]>(defaultInternshipsList);
  const [internshipJournalsList, setInternshipJournalsList] = useState<InternshipJournal[]>(defaultInternshipJournalsList);
  const [internshipMonitoringList, setInternshipMonitoringList] = useState<InternshipMonitoring[]>(defaultInternshipMonitoringList);
  const [internshipGradesList, setInternshipGradesList] = useState<InternshipGrade[]>(defaultInternshipGradesList);
  
  const [jobsList, setJobsList] = useState<JobItem[]>(defaultJobsList);
  const [jobApplicationsList, setJobApplicationsList] = useState<JobApplication[]>(defaultJobApplicationsList);
  
  const [alumniList, setAlumniList] = useState<AlumniItem[]>(defaultAlumniList);
  const [tracerSurveysList, setTracerSurveysList] = useState<TracerSurvey[]>(defaultTracerSurveysList);
  const [tracerResponsesList, setTracerResponsesList] = useState<TracerResponse[]>(defaultTracerResponsesList);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Synchronize schoolInfo programs & stats with Master Majors configured by Admin
  const syncedSchoolInfo = useMemo(() => {
    return syncSchoolInfoWithMajors(schoolInfo, majorsList);
  }, [schoolInfo, majorsList]);

  // Dynamically synchronize Browser Favicon when school logo is loaded or updated
  useEffect(() => {
    const logo = syncedSchoolInfo?.logoUrl;
    if (logo) {
      const favEl = document.getElementById('app-favicon') as HTMLLinkElement | null;
      if (favEl) {
        favEl.href = logo;
      }
      const appleEl = document.getElementById('app-apple-icon') as HTMLLinkElement | null;
      if (appleEl) {
        appleEl.href = logo;
      }
    }
  }, [syncedSchoolInfo?.logoUrl]);

  // Dynamically update document title for SEO & smooth UX
  useEffect(() => {
    const schoolName = syncedSchoolInfo?.name || 'SMK PGRI Kromengan';
    if (inAdminMode) {
      document.title = `Admin Dashboard CMS | ${schoolName}`;
    } else if (inPortalMode && user) {
      if (role === 'guru') {
        document.title = `Portal Guru & Tendik | ${schoolName}`;
      } else if (role === 'bkk') {
        document.title = `Portal Bursa Kerja Khusus BKK | ${schoolName}`;
      } else {
        document.title = `Portal Manajemen Sekolah | ${schoolName}`;
      }
    } else {
      const pageTitleMap: Record<NavigationPage, string> = {
        home: `${schoolName} – Portal Resmi Sekolah & Sistem Akademik`,
        profile: `Profil & Sejarah Sekolah | ${schoolName}`,
        programs: `Program Keahlian & Jurusan Vokasi | ${schoolName}`,
        news: `Berita & Pengumuman Sekolah | ${schoolName}`,
        events: `Agenda & Kegiatan Sekolah | ${schoolName}`,
        achievements: `Prestasi Siswa & Lembaga | ${schoolName}`,
        gallery: `Galeri Foto & Dokumentasi | ${schoolName}`,
        career: `Pusat Karir BKK & Tracer Study Alumni | ${schoolName}`,
        contact: `Kontak & Lokasi Kampus | ${schoolName}`
      };
      document.title = pageTitleMap[currentPage] || `${schoolName} – Portal Resmi Sekolah`;
    }
  }, [inAdminMode, inPortalMode, user, role, currentPage, syncedSchoolInfo?.name]);

  // Fetch all data from SQLite database
  const loadAllData = async () => {
    try {
      setIsLoadingData(true);
      const [
        info, 
        news, 
        events, 
        achievements, 
        gallery, 
        majorsData,
        companiesData,
        jobsData,
        alumniData,
        tracerSurveysData
      ] = await Promise.all([
        getSchoolInfo(),
        getNewsList(true), // Include drafts for admin awareness
        getEventsList(true),
        getAchievementsList(),
        getGalleryList(),
        getMajorsList(),
        getCompaniesList(),
        getJobsList(),
        getAlumniList(),
        getTracerSurveysList()
      ]);

      if (info) setSchoolInfo(info);
      if (Array.isArray(news)) setNewsList(news);
      if (Array.isArray(events)) setEventsList(events);
      if (Array.isArray(achievements)) setAchievementsList(achievements);
      if (Array.isArray(gallery)) setGalleryList(gallery);
      if (Array.isArray(majorsData)) setMajorsList(majorsData);
      if (Array.isArray(companiesData)) setCompaniesList(companiesData);
      if (Array.isArray(jobsData)) setJobsList(jobsData);
      if (Array.isArray(alumniData)) setAlumniList(alumniData);
      if (Array.isArray(tracerSurveysData)) setTracerSurveysList(tracerSurveysData);

      // If user is admin, also load master collections, academic modules, and contact messages
      if (user) {
        try {
          const [
            messages, 
            studs, 
            teachs, 
            clss, 
            subjs,
            acYears,
            scheds,
            atts,
            grds,
            sysSettings,
            internshipsData,
            journalsData,
            monitoringData,
            internGradesData,
            jobAppsData,
            tracerResponsesData
          ] = await Promise.all([
            getMessagesList(),
            getStudentsList(),
            getTeachersList(),
            getClassesList(),
            getSubjectsList(),
            getAcademicYearsList(),
            getSchedulesList(),
            getAttendanceList(),
            getGradesList(),
            getSystemSettings(),
            getInternshipsList(),
            getInternshipJournalsList(),
            getInternshipMonitoringList(),
            getInternshipGradesList(),
            getJobApplicationsList(),
            getTracerResponsesList()
          ]);

          setMessagesList(messages);
          if (studs && studs.length > 0) setStudentsList(studs);
          if (teachs && teachs.length > 0) setTeachersList(teachs);
          if (clss && clss.length > 0) setClassesList(clss);
          if (subjs && subjs.length > 0) setSubjectsList(subjs);
          if (acYears && acYears.length > 0) setAcademicYearsList(acYears);
          if (scheds && scheds.length > 0) setSchedulesList(scheds);
          if (atts && atts.length > 0) setAttendanceList(atts);
          if (grds && grds.length > 0) setGradesList(grds);
          if (sysSettings) setSystemSettings(sysSettings);
          if (internshipsData && internshipsData.length > 0) setInternshipsList(internshipsData);
          if (journalsData && journalsData.length > 0) setInternshipJournalsList(journalsData);
          if (monitoringData && monitoringData.length > 0) setInternshipMonitoringList(monitoringData);
          if (internGradesData && internGradesData.length > 0) setInternshipGradesList(internGradesData);
          if (jobAppsData && jobAppsData.length > 0) setJobApplicationsList(jobAppsData);
          if (tracerResponsesData && tracerResponsesData.length > 0) setTracerResponsesList(tracerResponsesData);
        } catch (mErr) {
          console.warn('Academic and Master data load for admin:', mErr);
        }
      }
    } catch (err) {
      console.error('Error fetching data from Firestore:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  // Scroll to top on public page change
  const handleNavigatePage = (page: NavigationPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNewsItem = (news: NewsItem | null) => {
    setSelectedNews(news);
    if (news && currentPage !== 'news') {
      setCurrentPage('news');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectEventItem = (event: EventItem | null) => {
    setSelectedEvent(event);
    if (event && currentPage !== 'events') {
      setCurrentPage('events');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Loading state
  if (authLoading && isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-bounce shadow-xl">
          <span className="text-xl font-extrabold">SMK</span>
        </div>
        <p className="text-sm font-semibold text-slate-300">Memuat Portal Resmi Sekolah...</p>
      </div>
    );
  }

  // ==========================================
  // ROLE-BASED USER PORTAL VIEW (Guru, BKK)
  // ==========================================
  if (user && inPortalMode && !inAdminMode) {
    if (role === 'guru') {
      return (
        <TeacherPortal
          schoolInfo={schoolInfo}
          teachersList={teachersList}
          classesList={classesList}
          subjectsList={subjectsList}
          schedulesList={schedulesList}
          studentsList={studentsList}
          attendanceList={attendanceList}
          gradesList={gradesList}
          internshipsList={internshipsList}
          internshipJournalsList={internshipJournalsList}
          internshipMonitoringList={internshipMonitoringList}
          systemSettings={systemSettings}
          onBackToPublic={() => setInPortalMode(false)}
          onRefreshAll={loadAllData}
        />
      );
    }

    if (role === 'bkk') {
      return (
        <BkkPortal
          schoolInfo={schoolInfo}
          jobsList={jobsList}
          jobApplicationsList={jobApplicationsList}
          companiesList={companiesList}
          tracerSurveysList={tracerSurveysList}
          tracerResponsesList={tracerResponsesList}
          systemSettings={systemSettings}
          onBackToPublic={() => setInPortalMode(false)}
          onRefreshAll={loadAllData}
        />
      );
    }
  }

  // ==========================================
  // ADMIN CMS VIEW
  // ==========================================
  if (inAdminMode || (user && (role === 'admin' || role === 'kepala_sekolah' || role === 'tu') && inPortalMode)) {
    // If not logged in, render Admin Login screen
    if (!user) {
      return (
        <AdminLogin onBackToPublic={() => { setInAdminMode(false); setInPortalMode(false); }} />
      );
    }

    // If logged in, render Admin Dashboard with layout
    return (
      <AdminLayout
        currentSection={currentAdminSection}
        onNavigateSection={(sec) => {
          setCurrentAdminSection(sec);
          setQuickCreateModal({ news: false, event: false, achievement: false, gallery: false });
        }}
        onBackToWebsite={() => { setInAdminMode(false); setInPortalMode(false); }}
        schoolInfo={schoolInfo}
        unreadMessagesCount={messagesList.length}
      >
        {/* Dashboard */}
        {currentAdminSection === 'dashboard' && (
          <AdminDashboard
            newsList={newsList}
            eventsList={eventsList}
            achievementsList={achievementsList}
            galleryList={galleryList}
            studentsList={studentsList}
            teachersList={teachersList}
            classesList={classesList}
            majorsList={majorsList}
            subjectsList={subjectsList}
            academicYearsList={academicYearsList}
            schedulesList={schedulesList}
            attendanceList={attendanceList}
            gradesList={gradesList}
            companiesList={companiesList}
            internshipsList={internshipsList}
            jobsList={jobsList}
            alumniList={alumniList}
            onNavigateSection={setCurrentAdminSection}
            onOpenCreateNews={() => {
              setCurrentAdminSection('news');
              setQuickCreateModal(prev => ({ ...prev, news: true }));
            }}
            onOpenCreateEvent={() => {
              setCurrentAdminSection('events');
              setQuickCreateModal(prev => ({ ...prev, event: true }));
            }}
            onOpenCreateAchievement={() => {
              setCurrentAdminSection('achievements');
              setQuickCreateModal(prev => ({ ...prev, achievement: true }));
            }}
            onOpenCreateGallery={() => {
              setCurrentAdminSection('gallery');
              setQuickCreateModal(prev => ({ ...prev, gallery: true }));
            }}
          />
        )}

        {/* FASE 3: AKADEMIK & PEMBELAJARAN */}
        {currentAdminSection === 'academic_years' && (
          <AdminAcademicYears
            academicYearsList={academicYearsList}
            onRefresh={loadAllData}
          />
        )}

        {currentAdminSection === 'schedules' && (
          <AdminSchedules
            schedulesList={schedulesList}
            academicYearsList={academicYearsList}
            classesList={classesList}
            subjectsList={subjectsList}
            teachersList={teachersList}
            onRefresh={loadAllData}
          />
        )}

        {currentAdminSection === 'attendance' && (
          <AdminAttendance
            attendanceList={attendanceList}
            academicYearsList={academicYearsList}
            classesList={classesList}
            subjectsList={subjectsList}
            teachersList={teachersList}
            studentsList={studentsList}
            onRefresh={loadAllData}
          />
        )}

        {currentAdminSection === 'grades' && (
          <AdminGrades
            gradesList={gradesList}
            attendanceList={attendanceList}
            academicYearsList={academicYearsList}
            classesList={classesList}
            subjectsList={subjectsList}
            teachersList={teachersList}
            studentsList={studentsList}
            systemSettings={systemSettings}
            onRefresh={loadAllData}
          />
        )}

        {/* FASE 5: MODUL PKL, BKK & ALUMNI */}
        {(currentAdminSection === 'pkl' || currentAdminSection.startsWith('pkl_')) && (
          <AdminPKL
            initialSubSection={currentAdminSection}
            companiesList={companiesList}
            internshipsList={internshipsList}
            journalsList={internshipJournalsList}
            monitoringList={internshipMonitoringList}
            gradesList={internshipGradesList}
            studentsList={studentsList}
            teachersList={teachersList}
            classesList={classesList}
            majorsList={majorsList}
            onRefresh={loadAllData}
            onNavigateSubSection={setCurrentAdminSection}
          />
        )}

        {(currentAdminSection === 'bkk' || currentAdminSection.startsWith('bkk_')) && (
          <AdminBKK
            initialSubSection={currentAdminSection}
            jobsList={jobsList}
            applicationsList={jobApplicationsList}
            companiesList={companiesList}
            majorsList={majorsList}
            onRefresh={loadAllData}
            onNavigateSubSection={setCurrentAdminSection}
          />
        )}

        {(currentAdminSection === 'alumni' || currentAdminSection.startsWith('alumni_')) && (
          <AdminAlumni
            initialSubSection={currentAdminSection}
            alumniList={alumniList}
            tracerSurveysList={tracerSurveysList}
            tracerResponsesList={tracerResponsesList}
            majorsList={majorsList}
            onRefresh={loadAllData}
            onNavigateSubSection={setCurrentAdminSection}
          />
        )}

        {/* FASE 2: DATA MASTER SEKOLAH */}
        {currentAdminSection === 'students' && (
          <AdminStudents
            studentsList={studentsList}
            classesList={classesList}
            majorsList={majorsList}
            teachersList={teachersList}
            onRefresh={loadAllData}
          />
        )}

        {currentAdminSection === 'teachers' && (
          <AdminTeachers
            teachersList={teachersList}
            subjectsList={subjectsList}
            classesList={classesList}
            onRefresh={loadAllData}
          />
        )}

        {currentAdminSection === 'classes' && (
          <AdminClasses
            classesList={classesList}
            majorsList={majorsList}
            teachersList={teachersList}
            studentsList={studentsList}
            onRefresh={loadAllData}
          />
        )}

        {currentAdminSection === 'majors' && (
          <AdminMajors
            majorsList={majorsList}
            teachersList={teachersList}
            studentsList={studentsList}
            classesList={classesList}
            onRefresh={loadAllData}
          />
        )}

        {currentAdminSection === 'subjects' && (
          <AdminSubjects
            subjectsList={subjectsList}
            majorsList={majorsList}
            teachersList={teachersList}
            onRefresh={loadAllData}
          />
        )}

        {/* FASE 1: KONTEN WEBSITE CMS */}
        {currentAdminSection === 'school_info' && (
          <AdminSchoolInfo
            schoolInfo={schoolInfo}
            onRefresh={loadAllData}
          />
        )}

        {currentAdminSection === 'news' && (
          <AdminNews
            newsList={newsList}
            onRefresh={loadAllData}
            isCreateModalOpen={quickCreateModal.news}
            onCloseCreateModal={() => setQuickCreateModal(prev => ({ ...prev, news: false }))}
          />
        )}

        {currentAdminSection === 'events' && (
          <AdminEvents
            eventsList={eventsList}
            onRefresh={loadAllData}
            isCreateModalOpen={quickCreateModal.event}
            onCloseCreateModal={() => setQuickCreateModal(prev => ({ ...prev, event: false }))}
          />
        )}

        {currentAdminSection === 'achievements' && (
          <AdminAchievements
            achievementsList={achievementsList}
            onRefresh={loadAllData}
            isCreateModalOpen={quickCreateModal.achievement}
            onCloseCreateModal={() => setQuickCreateModal(prev => ({ ...prev, achievement: false }))}
          />
        )}

        {currentAdminSection === 'gallery' && (
          <AdminGallery
            galleryList={galleryList}
            onRefresh={loadAllData}
            isCreateModalOpen={quickCreateModal.gallery}
            onCloseCreateModal={() => setQuickCreateModal(prev => ({ ...prev, gallery: false }))}
          />
        )}

        {currentAdminSection === 'messages' && (
          <AdminMessages
            messages={messagesList}
            onRefresh={loadAllData}
          />
        )}

        {/* FASE 6: MANAJEMEN, LAPORAN, USERS, AUDIT LOGS & BACKUP */}
        {currentAdminSection === 'management' && (
          <AdminManagement
            schoolInfo={schoolInfo}
            studentsList={studentsList}
            teachersList={teachersList}
            classesList={classesList}
            majorsList={majorsList}
            subjectsList={subjectsList}
            academicYearsList={academicYearsList}
            attendanceList={attendanceList}
            gradesList={gradesList}
            companiesList={companiesList}
            internshipsList={internshipsList}
            internshipJournalsList={internshipJournalsList}
            internshipMonitoringList={internshipMonitoringList}
            internshipGradesList={internshipGradesList}
            jobsList={jobsList}
            jobApplicationsList={jobApplicationsList}
            alumniList={alumniList}
            tracerResponsesList={tracerResponsesList}
            systemSettings={systemSettings}
            onNavigateSection={setCurrentAdminSection}
          />
        )}

        {currentAdminSection === 'reports' && (
          <AdminReports
            schoolInfo={schoolInfo}
            studentsList={studentsList}
            teachersList={teachersList}
            classesList={classesList}
            majorsList={majorsList}
            subjectsList={subjectsList}
            academicYearsList={academicYearsList}
            attendanceList={attendanceList}
            gradesList={gradesList}
            companiesList={companiesList}
            internshipsList={internshipsList}
            internshipJournalsList={internshipJournalsList}
            internshipMonitoringList={internshipMonitoringList}
            internshipGradesList={internshipGradesList}
            jobsList={jobsList}
            jobApplicationsList={jobApplicationsList}
            alumniList={alumniList}
            tracerResponsesList={tracerResponsesList}
            systemSettings={systemSettings}
          />
        )}

        {currentAdminSection === 'users' && (
          <AdminUsers
            teachersList={teachersList}
            studentsList={studentsList}
            currentUserEmail={user?.email}
          />
        )}

        {currentAdminSection === 'audit_logs' && (
          <AdminAuditLogs />
        )}

        {currentAdminSection === 'backup_doc' && (
          <AdminBackupDoc
            schoolInfo={schoolInfo}
            studentsList={studentsList}
            teachersList={teachersList}
            classesList={classesList}
            majorsList={majorsList}
            subjectsList={subjectsList}
            academicYearsList={academicYearsList}
            attendanceList={attendanceList}
            gradesList={gradesList}
            companiesList={companiesList}
            internshipsList={internshipsList}
            internshipJournalsList={internshipJournalsList}
            internshipMonitoringList={internshipMonitoringList}
            internshipGradesList={internshipGradesList}
            jobsList={jobsList}
            jobApplicationsList={jobApplicationsList}
            alumniList={alumniList}
            tracerSurveysList={tracerSurveysList}
            tracerResponsesList={tracerResponsesList}
            systemSettings={systemSettings}
          />
        )}

        {currentAdminSection === 'settings' && (
          <AdminSettings
            systemSettings={systemSettings}
            schoolInfo={schoolInfo}
            newsList={newsList}
            eventsList={eventsList}
            achievementsList={achievementsList}
            galleryList={galleryList}
            studentsList={studentsList}
            teachersList={teachersList}
            classesList={classesList}
            majorsList={majorsList}
            subjectsList={subjectsList}
            academicYearsList={academicYearsList}
            schedulesList={schedulesList}
            attendanceList={attendanceList}
            gradesList={gradesList}
            onRefreshAll={loadAllData}
            onBack={() => setCurrentAdminSection('dashboard')}
            onBackToPublic={() => setInAdminMode(false)}
          />
        )}
      </AdminLayout>
    );
  }

  // ==========================================
  // WEBSITE PUBLIK VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Maintenance Mode Notice Banner */}
      {systemSettings.maintenanceMode && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span className="w-2 h-2 rounded-full bg-amber-950 animate-ping shrink-0" />
            <span>Pemberitahuan Sistem: Mode Pemeliharaan (Maintenance Mode) sedang aktif. Tim administrator sedang melakukan pembaharuan data.</span>
          </div>
        </div>
      )}

      {/* Public Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigatePage}
        onOpenLoginModal={(initialRole) => {
          setLoginModalInitialRole(initialRole || 'guru');
          setIsLoginModalOpen(true);
        }}
        onOpenUserPortal={() => setInPortalMode(true)}
        schoolInfo={syncedSchoolInfo}
      />

      {/* Main Public Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomeView
            schoolInfo={syncedSchoolInfo}
            majorsList={majorsList}
            newsList={newsList}
            eventsList={eventsList}
            achievementsList={achievementsList}
            galleryList={galleryList}
            onNavigate={handleNavigatePage}
            onSelectNews={handleSelectNewsItem}
            onSelectEvent={handleSelectEventItem}
          />
        )}

        {currentPage === 'profile' && (
          <ProfileView schoolInfo={syncedSchoolInfo} />
        )}

        {currentPage === 'programs' && (
          <ProgramsView
            schoolInfo={syncedSchoolInfo}
            majorsList={majorsList}
            onNavigate={handleNavigatePage}
          />
        )}

        {currentPage === 'career' && (
          <CareerView
            jobsList={jobsList}
            companiesList={companiesList}
            alumniList={alumniList}
            tracerSurveysList={tracerSurveysList}
            majorsList={majorsList}
            onRefresh={loadAllData}
          />
        )}

        {currentPage === 'news' && (
          <NewsView
            newsList={newsList}
            selectedNews={selectedNews}
            onSelectNews={handleSelectNewsItem}
          />
        )}

        {currentPage === 'events' && (
          <EventsView
            eventsList={eventsList}
            selectedEvent={selectedEvent}
            onSelectEvent={handleSelectEventItem}
          />
        )}

        {currentPage === 'achievements' && (
          <AchievementsView achievementsList={achievementsList} />
        )}

        {currentPage === 'gallery' && (
          <GalleryView galleryList={galleryList} />
        )}

        {currentPage === 'contact' && (
          <ContactView schoolInfo={syncedSchoolInfo} />
        )}
      </main>

      {/* Public Footer */}
      <Footer
        schoolInfo={syncedSchoolInfo}
        majorsList={majorsList}
        onNavigate={handleNavigatePage}
        onOpenAdmin={() => setInAdminMode(true)}
        onOpenLoginModal={(initialRole) => {
          setLoginModalInitialRole(initialRole || 'guru');
          setIsLoginModalOpen(true);
        }}
      />

      {/* Unified Role Portal Login Modal (Guru, BKK, Admin) */}
      <PortalLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialRole={loginModalInitialRole}
        onLoginSuccess={(userRole) => {
          setInPortalMode(true);
        }}
      />
    </div>
  );
}
export default App;
