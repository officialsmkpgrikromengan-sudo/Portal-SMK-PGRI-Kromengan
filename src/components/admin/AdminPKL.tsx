import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Building2, 
  Users, 
  UserCheck, 
  BookOpen, 
  Eye, 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileText,
  Check,
  X,
  Printer,
  Download
} from 'lucide-react';
import { 
  CompanyItem, 
  InternshipItem, 
  InternshipJournal, 
  InternshipMonitoring, 
  InternshipGrade, 
  StudentItem, 
  TeacherItem, 
  MajorItem, 
  ClassItem,
  AdminSection
} from '../../types';
import { 
  addCompany, 
  updateCompany, 
  deleteCompany,
  addInternship,
  updateInternship,
  deleteInternship,
  addInternshipJournal,
  updateInternshipJournal,
  deleteInternshipJournal,
  addInternshipMonitoring,
  updateInternshipMonitoring,
  deleteInternshipMonitoring,
  saveInternshipGrade,
  deleteInternshipGrade
} from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminPKLProps {
  initialSubSection?: AdminSection;
  companiesList: CompanyItem[];
  internshipsList: InternshipItem[];
  journalsList: InternshipJournal[];
  monitoringList: InternshipMonitoring[];
  gradesList: InternshipGrade[];
  studentsList: StudentItem[];
  teachersList: TeacherItem[];
  majorsList: MajorItem[];
  classesList: ClassItem[];
  onRefresh: () => void;
  onNavigateSubSection?: (sub: AdminSection) => void;
}

export const AdminPKL: React.FC<AdminPKLProps> = ({
  initialSubSection = 'pkl_dashboard',
  companiesList,
  internshipsList,
  journalsList,
  monitoringList,
  gradesList,
  studentsList,
  teachersList,
  majorsList,
  classesList,
  onRefresh,
  onNavigateSubSection
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<AdminSection>(initialSubSection);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);

  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<InternshipItem | null>(null);

  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<InternshipJournal | null>(null);
  const [journalReviewNotes, setJournalReviewNotes] = useState('');
  const [journalReviewStatus, setJournalReviewStatus] = useState<InternshipJournal['status']>('Disetujui');

  const [isMonitoringModalOpen, setIsMonitoringModalOpen] = useState(false);
  const [editingMonitoring, setEditingMonitoring] = useState<InternshipMonitoring | null>(null);

  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<InternshipGrade | null>(null);

  // Delete Confirmations
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  // Forms state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    industryType: 'Teknologi Informasi & Telekomunikasi',
    address: '',
    city: 'Kota Malang',
    phone: '',
    email: '',
    website: '',
    contactPerson: '',
    status: 'Aktif' as CompanyItem['status'],
    quota: 5,
    description: ''
  });

  const [placementForm, setPlacementForm] = useState({
    studentId: '',
    companyId: '',
    teacherId: '',
    industrySupervisor: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Aktif' as InternshipItem['status'],
    notes: ''
  });

  const [monitoringForm, setMonitoringForm] = useState({
    internshipId: '',
    studentId: '',
    teacherId: '',
    visitDate: new Date().toISOString().split('T')[0],
    notes: '',
    evaluation: '',
    status: 'Sangat Baik'
  });

  const [gradeForm, setGradeForm] = useState({
    internshipId: '',
    studentId: '',
    industryScore: 85,
    teacherScore: 85,
    notes: ''
  });

  // Calculate Sub-Statistics for Dashboard
  const stats = useMemo(() => {
    const totalPlaced = internshipsList.length;
    const activePKL = internshipsList.filter(i => i.status === 'Aktif').length;
    const completedPKL = internshipsList.filter(i => i.status === 'Selesai').length;
    const activeCompanies = companiesList.filter(c => c.status === 'Aktif').length;
    const pendingJournals = journalsList.filter(j => j.status === 'Menunggu Verifikasi').length;
    
    const supervisorTeacherIds = new Set(internshipsList.map(i => i.teacherId).filter(Boolean));
    const totalSupervisors = supervisorTeacherIds.size;

    return { totalPlaced, activePKL, completedPKL, activeCompanies, pendingJournals, totalSupervisors };
  }, [internshipsList, companiesList, journalsList]);

  // Helper resolvers
  const getStudent = (id: string) => studentsList.find(s => s.id === id);
  const getTeacher = (id: string) => teachersList.find(t => t.id === id);
  const getCompany = (id: string) => companiesList.find(c => c.id === id);
  const getClass = (id: string) => classesList.find(c => c.id === id);
  const getMajor = (id: string) => majorsList.find(m => m.id === id);

  // Filtered Lists
  const filteredCompanies = useMemo(() => {
    return companiesList.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industryType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = !filterStatus || c.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [companiesList, searchQuery, filterStatus]);

  const filteredPlacements = useMemo(() => {
    return internshipsList.filter(i => {
      const student = getStudent(i.studentId);
      const company = getCompany(i.companyId);
      const teacher = getTeacher(i.teacherId);
      const searchStr = `${student?.fullName || ''} ${company?.name || ''} ${teacher?.fullName || ''}`.toLowerCase();
      const matchSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchCompany = !filterCompany || i.companyId === filterCompany;
      const matchStatus = !filterStatus || i.status === filterStatus;
      return matchSearch && matchCompany && matchStatus;
    });
  }, [internshipsList, studentsList, companiesList, teachersList, searchQuery, filterCompany, filterStatus]);

  const filteredJournals = useMemo(() => {
    return journalsList.filter(j => {
      const student = getStudent(j.studentId);
      const matchSearch = (student?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.activity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = !filterStatus || j.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [journalsList, studentsList, searchQuery, filterStatus]);

  // Handlers for Company
  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm({
      name: '',
      industryType: 'Teknologi Informasi & Telekomunikasi',
      address: '',
      city: 'Kota Malang',
      phone: '',
      email: '',
      website: '',
      contactPerson: '',
      status: 'Aktif',
      quota: 5,
      description: ''
    });
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (comp: CompanyItem) => {
    setEditingCompany(comp);
    setCompanyForm({
      name: comp.name,
      industryType: comp.industryType,
      address: comp.address,
      city: comp.city,
      phone: comp.phone,
      email: comp.email,
      website: comp.website,
      contactPerson: comp.contactPerson,
      status: comp.status,
      quota: comp.quota || 5,
      description: comp.description || ''
    });
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name.trim()) {
      error('Nama industri/perusahaan wajib diisi.');
      return;
    }
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, companyForm);
        success('Data industri berhasil diperbarui.');
      } else {
        await addCompany(companyForm);
        success('Industri mitra baru berhasil ditambahkan.');
      }
      setIsCompanyModalOpen(false);
      onRefresh();
    } catch (err) {
      error('Gagal menyimpan data industri.');
    }
  };

  // Handlers for Placement
  const handleOpenAddPlacement = () => {
    setEditingPlacement(null);
    setPlacementForm({
      studentId: studentsList[0]?.id || '',
      companyId: companiesList[0]?.id || '',
      teacherId: teachersList[0]?.id || '',
      industrySupervisor: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Aktif',
      notes: ''
    });
    setIsPlacementModalOpen(true);
  };

  const handleOpenEditPlacement = (placement: InternshipItem) => {
    setEditingPlacement(placement);
    setPlacementForm({
      studentId: placement.studentId,
      companyId: placement.companyId,
      teacherId: placement.teacherId,
      industrySupervisor: placement.industrySupervisor,
      startDate: placement.startDate,
      endDate: placement.endDate,
      status: placement.status,
      notes: placement.notes || ''
    });
    setIsPlacementModalOpen(true);
  };

  const handleSavePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placementForm.studentId || !placementForm.companyId || !placementForm.teacherId) {
      error('Lengkapi pilihan Siswa, Perusahaan, dan Guru Pembimbing.');
      return;
    }
    try {
      if (editingPlacement) {
        await updateInternship(editingPlacement.id, placementForm);
        success('Data penempatan PKL berhasil diperbarui.');
      } else {
        await addInternship(placementForm);
        success('Siswa berhasil ditempatkan di industri PKL.');
      }
      setIsPlacementModalOpen(false);
      onRefresh();
    } catch (err) {
      error('Gagal menyimpan data penempatan PKL.');
    }
  };

  // Handlers for Journal Review
  const handleOpenReviewJournal = (journal: InternshipJournal) => {
    setSelectedJournal(journal);
    setJournalReviewStatus(journal.status);
    setJournalReviewNotes(journal.teacherNotes || '');
    setIsJournalModalOpen(true);
  };

  const handleSaveJournalReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJournal) return;
    try {
      await updateInternshipJournal(selectedJournal.id, {
        status: journalReviewStatus,
        teacherNotes: journalReviewNotes
      });
      success('Verifikasi jurnal harian siswa berhasil disimpan.');
      setIsJournalModalOpen(false);
      onRefresh();
    } catch (err) {
      error('Gagal memperbarui status jurnal.');
    }
  };

  // Handlers for Monitoring
  const handleOpenAddMonitoring = () => {
    setEditingMonitoring(null);
    const firstInt = internshipsList[0];
    setMonitoringForm({
      internshipId: firstInt?.id || '',
      studentId: firstInt?.studentId || studentsList[0]?.id || '',
      teacherId: firstInt?.teacherId || teachersList[0]?.id || '',
      visitDate: new Date().toISOString().split('T')[0],
      notes: '',
      evaluation: 'Siswa hadir tepat waktu, disiplin, dan mampu beradaptasi dengan ritme kerja industri.',
      status: 'Sangat Baik'
    });
    setIsMonitoringModalOpen(true);
  };

  const handleSaveMonitoring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitoringForm.internshipId || !monitoringForm.notes.trim()) {
      error('Pilih penempatan dan isi catatan kunjungan monitoring.');
      return;
    }
    try {
      if (editingMonitoring) {
        await updateInternshipMonitoring(editingMonitoring.id, monitoringForm);
        success('Laporan monitoring PKL berhasil diperbarui.');
      } else {
        await addInternshipMonitoring(monitoringForm);
        success('Laporan monitoring PKL baru berhasil dicatat.');
      }
      setIsMonitoringModalOpen(false);
      onRefresh();
    } catch (err) {
      error('Gagal menyimpan laporan monitoring.');
    }
  };

  // Handlers for Grading
  const handleOpenAddGrade = (internship?: InternshipItem) => {
    const targetInt = internship || internshipsList[0];
    const existingGrade = gradesList.find(g => g.internshipId === targetInt?.id);
    
    if (existingGrade) {
      setEditingGrade(existingGrade);
      setGradeForm({
        internshipId: existingGrade.internshipId,
        studentId: existingGrade.studentId,
        industryScore: existingGrade.industryScore,
        teacherScore: existingGrade.teacherScore,
        notes: existingGrade.notes || ''
      });
    } else {
      setEditingGrade(null);
      setGradeForm({
        internshipId: targetInt?.id || '',
        studentId: targetInt?.studentId || '',
        industryScore: 85,
        teacherScore: 85,
        notes: ''
      });
    }
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeForm.internshipId || !gradeForm.studentId) {
      error('Pilih siswa/penempatan PKL.');
      return;
    }
    try {
      await saveInternshipGrade({
        id: editingGrade?.id,
        internshipId: gradeForm.internshipId,
        studentId: gradeForm.studentId,
        industryScore: Number(gradeForm.industryScore),
        teacherScore: Number(gradeForm.teacherScore),
        notes: gradeForm.notes,
        isPublished: true
      });
      success('Nilai akhir PKL berhasil disimpan dan dipublikasikan.');
      setIsGradeModalOpen(false);
      onRefresh();
    } catch (err) {
      error('Gagal menyimpan penilaian PKL.');
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'company') {
        await deleteCompany(deleteTarget.id);
        success(`Industri ${deleteTarget.name} berhasil dihapus.`);
      } else if (deleteTarget.type === 'placement') {
        await deleteInternship(deleteTarget.id);
        success(`Penempatan PKL berhasil dihapus.`);
      } else if (deleteTarget.type === 'monitoring') {
        await deleteInternshipMonitoring(deleteTarget.id);
        success(`Laporan monitoring berhasil dihapus.`);
      } else if (deleteTarget.type === 'grade') {
        await deleteInternshipGrade(deleteTarget.id);
        success(`Data nilai PKL berhasil dihapus.`);
      }
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      error('Gagal menghapus data.');
    }
  };

  return (
    <div id="admin-pkl-module" className="space-y-6">
      {/* Module Title and Navigation Tabs */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Modul Praktik Kerja Lapangan (PKL)
              </h2>
              <p className="text-xs text-slate-500">
                Kelola kemitraan industri, penempatan siswa, jurnal harian, monitoring guru, dan penilaian sertifikasi PKL.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-menu Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-2 pt-2 scrollbar-thin">
          {[
            { id: 'pkl_dashboard', label: 'Dashboard PKL', icon: <Briefcase className="w-4 h-4" /> },
            { id: 'pkl_companies', label: 'Industri / Perusahaan', icon: <Building2 className="w-4 h-4" /> },
            { id: 'pkl_placements', label: 'Penempatan Siswa', icon: <Users className="w-4 h-4" /> },
            { id: 'pkl_students', label: 'Data Siswa PKL', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'pkl_teachers', label: 'Guru Pembimbing', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'pkl_journals', label: 'Jurnal PKL', icon: <FileText className="w-4 h-4" />, badge: stats.pendingJournals },
            { id: 'pkl_monitoring', label: 'Monitoring Kunjungan', icon: <Eye className="w-4 h-4" /> },
            { id: 'pkl_grades', label: 'Penilaian PKL', icon: <Award className="w-4 h-4" /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AdminSection);
                  if (onNavigateSubSection) onNavigateSubSection(tab.id as AdminSection);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD PKL VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'pkl_dashboard' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Total Penempatan</span>
              <span className="text-2xl font-black text-slate-900">{stats.totalPlaced}</span>
              <span className="text-[10px] text-blue-600 font-bold block mt-1">Siswa Terdaftar</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">PKL Aktif</span>
              <span className="text-2xl font-black text-emerald-600">{stats.activePKL}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">Sedang Berjalan</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">PKL Selesai</span>
              <span className="text-2xl font-black text-slate-700">{stats.completedPKL}</span>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">Lulus Sertifikasi</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Mitra Industri</span>
              <span className="text-2xl font-black text-indigo-600">{stats.activeCompanies}</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-1">Perusahaan DUDI</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Guru Pembimbing</span>
              <span className="text-2xl font-black text-purple-600">{stats.totalSupervisors}</span>
              <span className="text-[10px] text-purple-600 font-bold block mt-1">Guru Ditugaskan</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Jurnal Menunggu</span>
              <span className="text-2xl font-black text-rose-600">{stats.pendingJournals}</span>
              <span className="text-[10px] text-rose-600 font-bold block mt-1">Perlu Verifikasi</span>
            </div>
          </div>

          {/* Quick Actions & Recent Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Daftar Siswa Sedang PKL Aktif</span>
                </h3>
                <button
                  onClick={() => setActiveTab('pkl_placements')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="p-3">Siswa</th>
                      <th className="p-3">Perusahaan Mitra</th>
                      <th className="p-3">Guru Pembimbing</th>
                      <th className="p-3">Periode PKL</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {internshipsList.slice(0, 5).map((item) => {
                      const student = getStudent(item.studentId);
                      const company = getCompany(item.companyId);
                      const teacher = getTeacher(item.teacherId);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-900">
                            <div>{student?.fullName || 'Siswa'}</div>
                            <div className="text-[10px] text-slate-400 font-normal">NISN: {student?.nisn}</div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{company?.name}</td>
                          <td className="p-3 text-slate-600">{teacher?.fullName}</td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {item.startDate} s/d {item.endDate}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Aksi Cepat PKL</span>
              </h3>

              <div className="space-y-2.5">
                <button
                  onClick={handleOpenAddPlacement}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4" />
                    <span>Tempatkan Siswa ke Industri</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleOpenAddCompany}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>Tambah Mitra Perusahaan Baru</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleOpenAddMonitoring}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span>Catat Kunjungan Monitoring</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleOpenAddGrade()}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-slate-500" />
                    <span>Input & Terbitkan Nilai PKL</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INDUSTRI / PERUSAHAAN VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'pkl_companies' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari perusahaan, bidang industri, atau kota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
              >
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddCompany}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Industri</span>
            </button>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.map((company) => {
              const placedCount = internshipsList.filter(i => i.companyId === company.id && i.status === 'Aktif').length;
              return (
                <div key={company.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {company.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-blue-600 block">
                            {company.industryType}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        company.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {company.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {company.description || company.address}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{company.address}, {company.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{company.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>PIC: <strong className="text-slate-700">{company.contactPerson}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Siswa PKL: <strong className="text-blue-600">{placedCount}</strong> / {company.quota || 5}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditCompany(company)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Perusahaan"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'company', id: company.id, name: company.name })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Perusahaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PENEMPATAN SISWA VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'pkl_placements' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, industri, atau guru pembimbing..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
              >
                <option value="">Semua Industri</option>
                {companiesList.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddPlacement}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Penempatan</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Siswa</th>
                    <th className="p-3.5">Industri & Pembimbing Lapangan</th>
                    <th className="p-3.5">Guru Pembimbing</th>
                    <th className="p-3.5">Periode PKL</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlacements.map((placement) => {
                    const student = getStudent(placement.studentId);
                    const company = getCompany(placement.companyId);
                    const teacher = getTeacher(placement.teacherId);
                    const studentClass = student ? getClass(student.classId) : null;

                    return (
                      <tr key={placement.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{student?.fullName || 'Siswa'}</div>
                          <div className="text-[11px] text-slate-500 font-semibold">{studentClass?.name || 'Kelas XI'} • NIS: {student?.nis}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{company?.name}</div>
                          <div className="text-[11px] text-blue-600">Supervisor: {placement.industrySupervisor || 'Belum ditentukan'}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-700">{teacher?.fullName}</div>
                          <div className="text-[10px] text-slate-400">NIP: {teacher?.nip || '-'}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                          {placement.startDate} s/d {placement.endDate}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            placement.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' :
                            placement.status === 'Selesai' ? 'bg-blue-100 text-blue-700' :
                            placement.status === 'Belum Mulai' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {placement.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAddGrade(placement)}
                              className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px]"
                              title="Beri Nilai PKL"
                            >
                              Nilai
                            </button>
                            <button
                              onClick={() => handleOpenEditPlacement(placement)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit Penempatan"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'placement', id: placement.id, name: student?.fullName || 'Penempatan' })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus Penempatan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DATA SISWA PKL & 5. GURU PEMBIMBING VIEWS */}
      {/* ========================================================================= */}
      {activeTab === 'pkl_students' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Rekap Seluruh Siswa & Status Penempatan PKL</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                <tr>
                  <th className="p-3">Siswa</th>
                  <th className="p-3">Kelas & Jurusan</th>
                  <th className="p-3">Industri PKL</th>
                  <th className="p-3">Status Penempatan</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsList.map(std => {
                  const placement = internshipsList.find(i => i.studentId === std.id);
                  const company = placement ? getCompany(placement.companyId) : null;
                  const stdClass = getClass(std.classId);
                  const stdMajor = getMajor(std.majorId);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">{std.fullName}</td>
                      <td className="p-3 text-slate-600">{stdClass?.name} • {stdMajor?.shortName || stdMajor?.name}</td>
                      <td className="p-3 font-semibold text-slate-700">{company?.name || <span className="text-slate-400 italic">Belum ditempatkan</span>}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          placement ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {placement ? placement.status : 'Belum Ditempatkan'}
                        </span>
                      </td>
                      <td className="p-3">
                        {placement ? (
                          <button
                            onClick={() => handleOpenEditPlacement(placement)}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            Detail PKL
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setPlacementForm(prev => ({ ...prev, studentId: std.id }));
                              setIsPlacementModalOpen(true);
                            }}
                            className="text-emerald-600 font-bold hover:underline"
                          >
                            + Tempatkan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pkl_teachers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Rekap Penugasan Guru Pembimbing PKL</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachersList.map(teacher => {
              const assignedPlacements = internshipsList.filter(i => i.teacherId === teacher.id);
              return (
                <div key={teacher.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {teacher.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{teacher.fullName}</h4>
                      <span className="text-[10px] text-slate-500">NIP: {teacher.nip}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Bimbingan Siswa:</span>
                    <strong className="text-blue-600 font-bold">{assignedPlacements.length} Siswa</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. JURNAL PKL VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'pkl_journals' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari aktivitas atau nama siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
              >
                <option value="">Semua Status Verifikasi</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredJournals.map(journal => {
              const student = getStudent(journal.studentId);
              const placement = internshipsList.find(i => i.id === journal.internshipId);
              const company = placement ? getCompany(placement.companyId) : null;

              return (
                <div key={journal.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-blue-200 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{student?.fullName}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">{company?.name} • Tanggal: {journal.date}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                      journal.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' :
                      journal.status === 'Menunggu Verifikasi' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {journal.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <h5 className="text-xs font-bold text-slate-800">{journal.activity}</h5>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{journal.description}</p>
                  </div>

                  {journal.teacherNotes && (
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
                      <strong>Catatan Guru Pembimbing:</strong> {journal.teacherNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {journal.attachment ? (
                      <a 
                        href={journal.attachment} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Lihat Dokumentasi Lampiran</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Tidak ada lampiran gambar</span>
                    )}

                    <button
                      onClick={() => handleOpenReviewJournal(journal)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Verifikasi & Catatan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MONITORING KUNJUNGAN VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'pkl_monitoring' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Laporan Kunjungan Guru ke Mitra Industri</h3>
            <button
              onClick={handleOpenAddMonitoring}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Kunjungan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {monitoringList.map(item => {
              const student = getStudent(item.studentId);
              const teacher = getTeacher(item.teacherId);
              const placement = internshipsList.find(i => i.id === item.internshipId);
              const company = placement ? getCompany(placement.companyId) : null;

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{company?.name || 'Kunjungan Industri'}</h4>
                      <span className="text-xs text-blue-600 font-semibold">
                        Siswa: {student?.fullName} • Guru: {teacher?.fullName}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 shrink-0">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-2">
                    <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <strong>Catatan:</strong> {item.notes}
                    </p>
                    <p className="leading-relaxed text-slate-700 font-medium">
                      <strong>Evaluasi:</strong> {item.evaluation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono">Tanggal: {item.visitDate}</span>
                    <button
                      onClick={() => setDeleteTarget({ type: 'monitoring', id: item.id, name: `Kunjungan ke ${company?.name}` })}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Hapus Laporan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. PENILAIAN PKL VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'pkl_grades' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Rekap Nilai Sertifikasi PKL</h3>
              <p className="text-xs text-slate-500">Bobot Penilaian: 60% Pembimbing Industri + 40% Guru Pembimbing Sekolah</p>
            </div>
            <button
              onClick={() => handleOpenAddGrade()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Input Nilai PKL</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="p-3.5">Siswa</th>
                    <th className="p-3.5">Perusahaan Mitra</th>
                    <th className="p-3.5 text-center">Nilai Industri (60%)</th>
                    <th className="p-3.5 text-center">Nilai Sekolah (40%)</th>
                    <th className="p-3.5 text-center">Nilai Akhir</th>
                    <th className="p-3.5 text-center">Predikat</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gradesList.map((grade) => {
                    const student = getStudent(grade.studentId);
                    const placement = internshipsList.find(i => i.id === grade.internshipId);
                    const company = placement ? getCompany(placement.companyId) : null;

                    return (
                      <tr key={grade.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div>{student?.fullName || 'Siswa'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">NISN: {student?.nisn}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{company?.name}</td>
                        <td className="p-3.5 text-center font-bold text-slate-800">{grade.industryScore}</td>
                        <td className="p-3.5 text-center font-bold text-slate-800">{grade.teacherScore}</td>
                        <td className="p-3.5 text-center font-black text-blue-600 text-sm">{grade.finalScore}</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            {grade.predicate}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingGrade(grade);
                                setGradeForm({
                                  internshipId: grade.internshipId,
                                  studentId: grade.studentId,
                                  industryScore: grade.industryScore,
                                  teacherScore: grade.teacherScore,
                                  notes: grade.notes || ''
                                });
                                setIsGradeModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit Nilai"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'grade', id: grade.id, name: `Nilai ${student?.fullName}` })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPANY FORM */}
      {/* ========================================================================= */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingCompany ? 'Edit Industri / Perusahaan Mitra' : 'Tambah Industri Mitra Baru'}
              </h3>
              <button onClick={() => setIsCompanyModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Perusahaan / Industri *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Telkom Indonesia"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bidang Industri *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Otomotif, IT, DKV"
                    value={companyForm.industryType}
                    onChange={(e) => setCompanyForm({ ...companyForm, industryType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota / Lokasi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kota Malang"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Alamat kantor / bengkel / workshop..."
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Telepon / Kontak</label>
                  <input
                    type="text"
                    placeholder="(0341) 123456"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="hrd@perusahaan.co.id"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama PIC / Supervisor</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ir. Hendra Setiawan"
                    value={companyForm.contactPerson}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactPerson: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kuota Siswa PKL</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={companyForm.quota}
                    onChange={(e) => setCompanyForm({ ...companyForm, quota: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan Industri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PLACEMENT FORM */}
      {/* ========================================================================= */}
      {isPlacementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingPlacement ? 'Edit Penempatan PKL Siswa' : 'Penempatan Siswa ke Industri PKL'}
              </h3>
              <button onClick={() => setIsPlacementModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlacement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={placementForm.studentId}
                  onChange={(e) => setPlacementForm({ ...placementForm, studentId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {studentsList.map(s => {
                    const c = getClass(s.classId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({c?.name || 'Kelas'}) - NIS: {s.nis}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Mitra Perusahaan / Industri *</label>
                <select
                  required
                  value={placementForm.companyId}
                  onChange={(e) => setPlacementForm({ ...placementForm, companyId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="">-- Pilih Industri --</option>
                  {companiesList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.industryType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Guru Pembimbing Sekolah *</label>
                  <select
                    required
                    value={placementForm.teacherId}
                    onChange={(e) => setPlacementForm({ ...placementForm, teacherId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachersList.map(t => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pembimbing Industri (PIC Lapangan)</label>
                  <input
                    type="text"
                    placeholder="Nama supervisor industri..."
                    value={placementForm.industrySupervisor}
                    onChange={(e) => setPlacementForm({ ...placementForm, industrySupervisor: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai PKL *</label>
                  <input
                    type="date"
                    required
                    value={placementForm.startDate}
                    onChange={(e) => setPlacementForm({ ...placementForm, startDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Selesai PKL *</label>
                  <input
                    type="date"
                    required
                    value={placementForm.endDate}
                    onChange={(e) => setPlacementForm({ ...placementForm, endDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Penempatan / Divisi</label>
                <input
                  type="text"
                  placeholder="Contoh: Divisi IT & Jaringan Fiber Optic"
                  value={placementForm.notes}
                  onChange={(e) => setPlacementForm({ ...placementForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsPlacementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan Penempatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: JOURNAL VERIFICATION */}
      {/* ========================================================================= */}
      {isJournalModalOpen && selectedJournal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Verifikasi Jurnal Harian Siswa</h3>
              <button onClick={() => setIsJournalModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJournalReview} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900">{selectedJournal.activity}</div>
                <p className="text-slate-600">{selectedJournal.description}</p>
                <span className="text-[10px] text-slate-400 block font-mono">Tanggal Kegiatan: {selectedJournal.date}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Verifikasi *</label>
                <select
                  value={journalReviewStatus}
                  onChange={(e) => setJournalReviewStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-bold"
                >
                  <option value="Disetujui">Disetujui</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / Umpan Balik Guru Pembimbing</label>
                <textarea
                  rows={3}
                  placeholder="Beri catatan apresiasi atau instruksi perbaikan..."
                  value={journalReviewNotes}
                  onChange={(e) => setJournalReviewNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsJournalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MONITORING FORM */}
      {/* ========================================================================= */}
      {isMonitoringModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Catat Kunjungan Monitoring Guru</h3>
              <button onClick={() => setIsMonitoringModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMonitoring} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Penempatan Siswa *</label>
                <select
                  required
                  value={monitoringForm.internshipId}
                  onChange={(e) => {
                    const selInt = internshipsList.find(i => i.id === e.target.value);
                    setMonitoringForm({
                      ...monitoringForm,
                      internshipId: e.target.value,
                      studentId: selInt?.studentId || '',
                      teacherId: selInt?.teacherId || ''
                    });
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="">-- Pilih Siswa / Industri --</option>
                  {internshipsList.map(item => {
                    const s = getStudent(item.studentId);
                    const c = getCompany(item.companyId);
                    return (
                      <option key={item.id} value={item.id}>
                        {s?.fullName} @ {c?.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Kunjungan Monitoring *</label>
                <input
                  type="date"
                  required
                  value={monitoringForm.visitDate}
                  onChange={(e) => setMonitoringForm({ ...monitoringForm, visitDate: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Kunjungan & Kondisi Siswa *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Uraikan hasil pertemuan dengan supervisor industri..."
                  value={monitoringForm.notes}
                  onChange={(e) => setMonitoringForm({ ...monitoringForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Evaluasi Capaian Kompetensi</label>
                <textarea
                  rows={2}
                  placeholder="Evaluasi keterampilan teknis dan soft skills..."
                  value={monitoringForm.evaluation}
                  onChange={(e) => setMonitoringForm({ ...monitoringForm, evaluation: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsMonitoringModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GRADE FORM */}
      {/* ========================================================================= */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingGrade ? 'Edit Penilaian PKL' : 'Input Nilai Sertifikasi PKL'}
              </h3>
              <button onClick={() => setIsGradeModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Penempatan Siswa *</label>
                <select
                  required
                  value={gradeForm.internshipId}
                  onChange={(e) => {
                    const selInt = internshipsList.find(i => i.id === e.target.value);
                    setGradeForm({
                      ...gradeForm,
                      internshipId: e.target.value,
                      studentId: selInt?.studentId || ''
                    });
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="">-- Pilih Siswa / Industri --</option>
                  {internshipsList.map(item => {
                    const s = getStudent(item.studentId);
                    const c = getCompany(item.companyId);
                    return (
                      <option key={item.id} value={item.id}>
                        {s?.fullName} ({c?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nilai Industri (60%) *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={gradeForm.industryScore}
                    onChange={(e) => setGradeForm({ ...gradeForm, industryScore: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-center text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nilai Sekolah (40%) *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={gradeForm.teacherScore}
                    onChange={(e) => setGradeForm({ ...gradeForm, teacherScore: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-center text-sm"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="font-bold text-blue-900">Perkiraan Nilai Akhir:</span>
                <strong className="text-base font-black text-blue-700">
                  {((gradeForm.industryScore * 0.6) + (gradeForm.teacherScore * 0.4)).toFixed(2)}
                </strong>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / Rekomendasi Sertifikat</label>
                <textarea
                  rows={2}
                  placeholder="Catatan kompetensi siswa..."
                  value={gradeForm.notes}
                  onChange={(e) => setGradeForm({ ...gradeForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan & Terbitkan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Konfirmasi Hapus Data"
        message={`Apakah Anda yakin ingin menghapus data "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Data"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
