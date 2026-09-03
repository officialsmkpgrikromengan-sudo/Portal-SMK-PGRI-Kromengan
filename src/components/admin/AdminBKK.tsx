import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Building2, 
  UserCheck, 
  FileText, 
  BarChart3, 
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
  ExternalLink,
  ChevronRight,
  Download,
  Users,
  Check,
  X,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { 
  JobItem, 
  JobApplication, 
  CompanyItem, 
  AdminSection 
} from '../../types';
import { 
  addJob, 
  updateJob, 
  deleteJob, 
  addCompany, 
  updateCompany, 
  deleteCompany,
  updateJobApplicationStatus,
  deleteJobApplication
} from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminBKKProps {
  initialSubSection?: AdminSection;
  jobsList: JobItem[];
  applicationsList: JobApplication[];
  companiesList: CompanyItem[];
  onRefresh: () => void;
  onNavigateSubSection?: (sub: AdminSection) => void;
}

export const AdminBKK: React.FC<AdminBKKProps> = ({
  initialSubSection = 'bkk_dashboard',
  jobsList,
  applicationsList,
  companiesList,
  onRefresh,
  onNavigateSubSection
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<AdminSection>(initialSubSection);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);

  const [isAppDetailModalOpen, setIsAppDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [appStatusInput, setAppStatusInput] = useState<JobApplication['status']>('Terdaftar');
  const [appNotesInput, setAppNotesInput] = useState('');

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  // Job Form State
  const [jobForm, setJobForm] = useState({
    companyId: companiesList[0]?.id || '',
    position: '',
    description: '',
    requirements: '',
    location: 'Kota Malang & Sekitarnya',
    employmentType: 'Full Time' as JobItem['employmentType'],
    salaryInfo: 'Rp 3.500.000 - Rp 5.000.000',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Published' as JobItem['status']
  });

  // Calculate Statistics
  const stats = useMemo(() => {
    const totalJobs = jobsList.length;
    const activeJobs = jobsList.filter(j => j.status === 'Published').length;
    const totalApplicants = applicationsList.length;
    const acceptedApplicants = applicationsList.filter(a => a.status === 'Lolos').length;
    const inSelection = applicationsList.filter(a => a.status === 'Seleksi').length;
    const partnerCompanies = companiesList.length;

    return {
      totalJobs,
      activeJobs,
      totalApplicants,
      acceptedApplicants,
      inSelection,
      partnerCompanies
    };
  }, [jobsList, applicationsList, companiesList]);

  // Helpers
  const getCompany = (id: string) => companiesList.find(c => c.id === id);
  const getJob = (id: string) => jobsList.find(j => j.id === id);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobsList.filter(j => {
      const comp = getCompany(j.companyId);
      const searchStr = `${j.position} ${comp?.name || ''} ${j.location}`.toLowerCase();
      const matchSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchCompany = !filterCompany || j.companyId === filterCompany;
      const matchStatus = !filterStatus || j.status === filterStatus;
      return matchSearch && matchCompany && matchStatus;
    });
  }, [jobsList, companiesList, searchQuery, filterCompany, filterStatus]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applicationsList.filter(app => {
      const job = getJob(app.jobId);
      const comp = job ? getCompany(job.companyId) : null;
      const searchStr = `${app.applicantName} ${job?.position || ''} ${comp?.name || ''} ${app.applicantEmail}`.toLowerCase();
      const matchSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchStatus = !filterStatus || app.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [applicationsList, jobsList, companiesList, searchQuery, filterStatus]);

  // Handlers for Job
  const handleOpenAddJob = () => {
    setEditingJob(null);
    setJobForm({
      companyId: companiesList[0]?.id || '',
      position: '',
      description: '',
      requirements: '• Lulusan SMK jurusan relevan\n• Memiliki portofolio / sertifikat keahlian\n• Mampu bekerja mandiri maupun dalam tim\n• Disiplin dan bertanggung jawab',
      location: 'Kota Malang & Sekitarnya',
      employmentType: 'Full Time',
      salaryInfo: 'Kompetitif / Sesuai UMK',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Published'
    });
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job: JobItem) => {
    setEditingJob(job);
    setJobForm({
      companyId: job.companyId,
      position: job.position,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      employmentType: job.employmentType,
      salaryInfo: job.salaryInfo || '',
      deadline: job.deadline,
      status: job.status
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.position.trim() || !jobForm.companyId) {
      error('Posisi lowongan dan perusahaan wajib dipilih.');
      return;
    }
    try {
      if (editingJob) {
        await updateJob(editingJob.id, jobForm);
        success('Lowongan kerja berhasil diperbarui.');
      } else {
        await addJob(jobForm);
        success('Lowongan kerja baru berhasil dipublikasikan.');
      }
      setIsJobModalOpen(false);
      onRefresh();
    } catch (err) {
      error('Gagal menyimpan lowongan kerja.');
    }
  };

  // Handlers for Application Status
  const handleOpenAppDetail = (app: JobApplication) => {
    setSelectedApp(app);
    setAppStatusInput(app.status);
    setAppNotesInput(app.notes || '');
    setIsAppDetailModalOpen(true);
  };

  const handleSaveAppStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      await updateJobApplicationStatus(selectedApp.id, appStatusInput, appNotesInput);
      success('Status seleksi pelamar berhasil diperbarui.');
      setIsAppDetailModalOpen(false);
      onRefresh();
    } catch (err) {
      error('Gagal memperbarui status seleksi.');
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'job') {
        await deleteJob(deleteTarget.id);
        success(`Lowongan ${deleteTarget.name} berhasil dihapus.`);
      } else if (deleteTarget.type === 'application') {
        await deleteJobApplication(deleteTarget.id);
        success(`Data pelamar berhasil dihapus.`);
      }
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      error('Gagal menghapus data.');
    }
  };

  return (
    <div id="admin-bkk-module" className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bursa Kerja Khusus (BKK)
            </h2>
            <p className="text-xs text-slate-500">
              Pusat karir sekolah: Publikasikan lowongan kerja industri, kelola seleksi rekrutmen alumni, dan pantau keterserapan kerja.
            </p>
          </div>
        </div>

        {/* Sub-menu Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-2 pt-2 scrollbar-thin">
          {[
            { id: 'bkk_dashboard', label: 'Dashboard BKK', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'bkk_jobs', label: 'Lowongan Kerja', icon: <Briefcase className="w-4 h-4" />, badge: stats.activeJobs },
            { id: 'bkk_recruitment', label: 'Pendaftaran & Seleksi', icon: <UserCheck className="w-4 h-4" />, badge: stats.totalApplicants },
            { id: 'bkk_companies', label: 'Mitra Industri BKK', icon: <Building2 className="w-4 h-4" /> },
            { id: 'bkk_recap', label: 'Rekap & Statistik', icon: <TrendingUp className="w-4 h-4" /> }
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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD BKK */}
      {/* ========================================================================= */}
      {activeTab === 'bkk_dashboard' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Total Lowongan</span>
              <span className="text-2xl font-black text-slate-900">{stats.totalJobs}</span>
              <span className="text-[10px] text-blue-600 font-bold block mt-1">Terdaftar</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Lowongan Aktif</span>
              <span className="text-2xl font-black text-emerald-600">{stats.activeJobs}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">Sedang Buka</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Total Pelamar</span>
              <span className="text-2xl font-black text-indigo-600">{stats.totalApplicants}</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-1">Alumni & Siswa</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Tahap Seleksi</span>
              <span className="text-2xl font-black text-amber-600">{stats.inSelection}</span>
              <span className="text-[10px] text-amber-600 font-bold block mt-1">Wawancara / Tes</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Diterima / Lolos</span>
              <span className="text-2xl font-black text-teal-600">{stats.acceptedApplicants}</span>
              <span className="text-[10px] text-teal-600 font-bold block mt-1">Karier Berhasil</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Mitra BKK</span>
              <span className="text-2xl font-black text-purple-600">{stats.partnerCompanies}</span>
              <span className="text-[10px] text-purple-600 font-bold block mt-1">DUDI Rekanan</span>
            </div>
          </div>

          {/* Quick Actions & Recent Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Lowongan Kerja Terbaru</span>
                </h3>
                <button
                  onClick={() => setActiveTab('bkk_jobs')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-3">
                {jobsList.slice(0, 4).map(job => {
                  const company = getCompany(job.companyId);
                  const applicantsCount = applicationsList.filter(a => a.jobId === job.id).length;

                  return (
                    <div key={job.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{job.position}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                            {job.employmentType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {company?.name} • {job.location} • Batas: {job.deadline}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-slate-600">
                          {applicantsCount} Pelamar
                        </span>
                        <button
                          onClick={() => handleOpenEditJob(job)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Aksi Pengelolaan BKK</span>
              </h3>

              <div className="space-y-2.5">
                <button
                  onClick={handleOpenAddJob}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4" />
                    <span>Publikasikan Lowongan Baru</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('bkk_recruitment')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span>Seleksi & Verifikasi Pelamar</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('bkk_companies')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>Daftar Mitra Rekrutmen DUDI</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('bkk_recap')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <span>Laporan Keterserapan Kerja</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOWONGAN KERJA VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'bkk_jobs' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari posisi atau nama perusahaan..."
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
                <option value="">Semua Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddJob}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lowongan</span>
            </button>
          </div>

          {/* Jobs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map(job => {
              const company = getCompany(job.companyId);
              const applicantsCount = applicationsList.filter(a => a.jobId === job.id).length;

              return (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">
                          {job.position}
                        </h4>
                        <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                          {company?.name}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        job.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                        job.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Tipe: <strong className="text-slate-700">{job.employmentType}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Deadline: <strong className="text-rose-600 font-mono">{job.deadline}</strong></span>
                      </div>
                      {job.salaryInfo && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Gaji: <strong className="text-slate-700">{job.salaryInfo}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Pelamar: <strong className="text-emerald-600">{applicantsCount} Orang</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditJob(job)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Edit Lowongan"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'job', id: job.id, name: job.position })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Hapus Lowongan"
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
      {/* 3. PENDAFTARAN & RECRUITMENT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'bkk_recruitment' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama pelamar atau posisi..."
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
                <option value="">Semua Status Seleksi</option>
                <option value="Terdaftar">Terdaftar</option>
                <option value="Seleksi">Tahap Seleksi</option>
                <option value="Lolos">Lolos (Diterima)</option>
                <option value="Tidak Lolos">Tidak Lolos</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="p-3.5">Nama Pelamar</th>
                    <th className="p-3.5">Lowongan & Perusahaan</th>
                    <th className="p-3.5">Kontak</th>
                    <th className="p-3.5">Tanggal Melamar</th>
                    <th className="p-3.5">Status Seleksi</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map(app => {
                    const job = getJob(app.jobId);
                    const comp = job ? getCompany(job.companyId) : null;

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div>{app.applicantName}</div>
                          {app.cvUrl && (
                            <a 
                              href={app.cvUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[10px] text-emerald-600 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Lihat Resume / CV</span>
                            </a>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{job?.position || 'Lowongan Kerja'}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{comp?.name}</div>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <div>{app.applicantEmail}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{app.applicantPhone}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">
                          {app.appliedAt.split('T')[0]}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === 'Lolos' ? 'bg-emerald-100 text-emerald-700' :
                            app.status === 'Seleksi' ? 'bg-amber-100 text-amber-700' :
                            app.status === 'Terdaftar' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAppDetail(app)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px]"
                            >
                              Update Status
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'application', id: app.id, name: app.applicantName })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus Pelamar"
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
      {/* 4. MITRA INDUSTRI & 5. REKAP VIEWS */}
      {/* ========================================================================= */}
      {activeTab === 'bkk_companies' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Daftar Mitra Industri DUDI Rekrutmen BKK</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companiesList.map(comp => {
              const compJobs = jobsList.filter(j => j.companyId === comp.id);
              return (
                <div key={comp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      {comp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{comp.name}</h4>
                      <span className="text-[10px] text-slate-500">{comp.industryType} • {comp.city}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Lowongan Buka:</span>
                    <strong className="text-emerald-600 font-bold">{compJobs.length} Posisi</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'bkk_recap' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900">Rekapitulasi Keterserapan Kerja Lulusan (BKK)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-800">Tingkat Kelulusan Rekrutmen</span>
                <div className="text-3xl font-black text-emerald-600">
                  {stats.totalApplicants > 0 ? ((stats.acceptedApplicants / stats.totalApplicants) * 100).toFixed(1) : '0'}%
                </div>
                <span className="text-[10px] text-emerald-700">{stats.acceptedApplicants} dari {stats.totalApplicants} pelamar lolos kerja</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 text-center space-y-1">
                <span className="text-xs font-bold text-blue-800">Rata-rata Pelamar per Lowongan</span>
                <div className="text-3xl font-black text-blue-600">
                  {stats.totalJobs > 0 ? (stats.totalApplicants / stats.totalJobs).toFixed(1) : '0'}
                </div>
                <span className="text-[10px] text-blue-700">Peminat per formasi pekerjaan</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-100 text-center space-y-1">
                <span className="text-xs font-bold text-purple-800">Jejaring Industri Aktif</span>
                <div className="text-3xl font-black text-purple-600">{stats.partnerCompanies}</div>
                <span className="text-[10px] text-purple-700">Perusahaan mitra penyerap lulusan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: JOB FORM */}
      {/* ========================================================================= */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingJob ? 'Edit Lowongan Kerja BKK' : 'Publikasikan Lowongan Kerja Baru'}
              </h3>
              <button onClick={() => setIsJobModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Posisi / Judul Pekerjaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Junior Network Engineer / Frontend Developer"
                  value={jobForm.position}
                  onChange={(e) => setJobForm({ ...jobForm, position: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Perusahaan Mitra *</label>
                  <select
                    required
                    value={jobForm.companyId}
                    onChange={(e) => setJobForm({ ...jobForm, companyId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="">-- Pilih Perusahaan --</option>
                    {companiesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Pekerjaan *</label>
                  <select
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Magang">Magang Kerja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Penempatan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Malang / Surabaya / Remote"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Gaji / Benefit</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 3.500.000 - Rp 5.000.000"
                    value={jobForm.salaryInfo}
                    onChange={(e) => setJobForm({ ...jobForm, salaryInfo: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Tugas & Tanggung Jawab *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Uraikan tanggung jawab posisi..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Persyaratan / Kualifikasi *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Persyaratan kemampuan, ijazah, atau portofolio..."
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batas Akhir Pendaftaran (Deadline) *</label>
                  <input
                    type="date"
                    required
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Publikasi *</label>
                  <select
                    value={jobForm.status}
                    onChange={(e) => setJobForm({ ...jobForm, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Published">Published (Tampil di Website)</option>
                    <option value="Draft">Draft (Disimpan Sementara)</option>
                    <option value="Closed">Closed (Ditutup)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Simpan Lowongan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPLICATION DETAIL & SELECTION */}
      {/* ========================================================================= */}
      {isAppDetailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Perbarui Status Seleksi Pelamar</h3>
              <button onClick={() => setIsAppDetailModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppStatus} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900">{selectedApp.applicantName}</div>
                <div className="text-slate-600">Email: {selectedApp.applicantEmail} • Telp: {selectedApp.applicantPhone}</div>
                {selectedApp.coverLetter && (
                  <p className="text-slate-500 italic mt-1 text-[11px]">"{selectedApp.coverLetter}"</p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Seleksi Saat Ini *</label>
                <select
                  value={appStatusInput}
                  onChange={(e) => setAppStatusInput(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold"
                >
                  <option value="Terdaftar">Terdaftar (Berkas Masuk)</option>
                  <option value="Seleksi">Tahap Seleksi (Tes / Wawancara)</option>
                  <option value="Lolos">Lolos (Diterima Bekerja)</option>
                  <option value="Tidak Lolos">Tidak Lolos</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Verifikator BKK / HRD</label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Jadwal wawancara online tgl 25 Mei jam 10.00 WIB..."
                  value={appNotesInput}
                  onChange={(e) => setAppNotesInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAppDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
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
