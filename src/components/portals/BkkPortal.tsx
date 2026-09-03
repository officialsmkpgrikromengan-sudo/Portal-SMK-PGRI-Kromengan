import React, { useState } from 'react';
import { 
  Briefcase, 
  Building, 
  Users, 
  Award, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  User, 
  LogOut, 
  Globe, 
  Edit, 
  Trash2,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { 
  JobItem, 
  JobApplication, 
  CompanyItem, 
  TracerSurvey, 
  TracerResponse, 
  SchoolInfo,
  SystemSettings
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  saveJob, 
  deleteJob, 
  updateJobApplicationStatus, 
  saveCompany, 
  deleteCompany 
} from '../../lib/firebase';

interface BkkPortalProps {
  schoolInfo: SchoolInfo;
  jobsList: JobItem[];
  jobApplicationsList: JobApplication[];
  companiesList: CompanyItem[];
  tracerSurveysList: TracerSurvey[];
  tracerResponsesList: TracerResponse[];
  systemSettings?: SystemSettings;
  onBackToPublic: () => void;
  onRefreshAll: () => void;
}

type BkkTab = 'dashboard' | 'jobs' | 'applicants' | 'companies' | 'tracer';

export const BkkPortal: React.FC<BkkPortalProps> = ({
  schoolInfo,
  jobsList = [],
  jobApplicationsList = [],
  companiesList = [],
  tracerSurveysList = [],
  tracerResponsesList = [],
  systemSettings,
  onBackToPublic,
  onRefreshAll
}) => {
  const { user, currentUserAccount, logout } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<BkkTab>('dashboard');

  // Stats calculation
  const activeJobs = jobsList.filter(j => j.status === 'Published' || (j as any).isActive);
  const totalApplicants = jobApplicationsList.length;
  const acceptedApplicants = jobApplicationsList.filter(a => a.status === 'Lolos' || (a.status as any) === 'Diterima').length;

  // State: Job Form Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobType, setJobType] = useState<string>('Full Time');
  const [jobLocation, setJobLocation] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobDeadline, setJobDeadline] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReqs, setJobReqs] = useState('');
  const [isSavingJob, setIsSavingJob] = useState(false);

  // State: Company Form Modal
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [compName, setCompName] = useState('');
  const [compSector, setCompSector] = useState('');
  const [compCity, setCompCity] = useState('');
  const [compContact, setCompContact] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const openCreateJob = () => {
    setEditingJob(null);
    setJobTitle('');
    setJobCompany(companiesList[0]?.id || 'comp-mitra-1');
    setJobType('Full Time');
    setJobLocation('Malang / Surabaya');
    setJobSalary('Rp 3.500.000 - Rp 5.000.000');
    setJobDeadline(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setJobDesc('');
    setJobReqs('');
    setShowJobModal(true);
  };

  const handleSaveJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      error('Posisi lowongan wajib diisi.');
      return;
    }

    try {
      setIsSavingJob(true);
      const jobData: any = {
        id: editingJob?.id || `job-${Date.now()}`,
        companyId: jobCompany || companiesList[0]?.id || 'comp-1',
        position: jobTitle.trim(),
        employmentType: jobType,
        location: jobLocation.trim(),
        salaryInfo: jobSalary.trim(),
        deadline: jobDeadline,
        description: jobDesc.trim(),
        requirements: jobReqs.trim() || 'Lulusan SMK relevan',
        status: 'Published',
        createdAt: editingJob?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveJob(jobData);
      success(`Lowongan "${jobData.position}" berhasil disimpan!`);
      setShowJobModal(false);
      onRefreshAll();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan lowongan kerja.');
    } finally {
      setIsSavingJob(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('Yakin ingin menghapus lowongan pekerjaan ini?')) {
      try {
        await deleteJob(id);
        success('Lowongan pekerjaan berhasil dihapus.');
        onRefreshAll();
      } catch (err) {
        error('Gagal menghapus lowongan.');
      }
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: JobApplication['status']) => {
    try {
      await updateJobApplicationStatus(appId, status);
      success(`Status pelamar diubah menjadi "${status}"!`);
      onRefreshAll();
    } catch (err) {
      error('Gagal memperbarui status pelamar.');
    }
  };

  return (
    <div id="bkk-portal" className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Top BKK Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand / Role */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Portal BKK SMK</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Bursa Kerja Khusus
                  </span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {schoolInfo.name}
                </p>
              </div>
            </div>

            {/* Right User Controls */}
            <div className="flex items-center gap-3">
              <button
                id="btn-bkk-back-web"
                onClick={onBackToPublic}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website Publik</span>
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="w-9 h-9 rounded-full bg-amber-700 border-2 border-amber-500 flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-xs">
                  {currentUserAccount?.displayName?.charAt(0) || 'B'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[160px]">
                    {currentUserAccount?.displayName || 'Petugas BKK'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Koordinator Penyaluran Kerja
                  </div>
                </div>

                <button
                  id="btn-bkk-logout"
                  onClick={logout}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all border border-rose-500/20 ml-1"
                  title="Keluar dari Portal BKK"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Dashboard BKK</span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'jobs'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Kelola Lowongan ({jobsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('applicants')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'applicants'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Seleksi Pelamar ({jobApplicationsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('companies')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'companies'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Mitra Industri DUDI ({companiesList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tracer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'tracer'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Tracer Study ({tracerResponsesList.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* =========================================================
            TAB 1: DASHBOARD BKK
        ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-800/40 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-400/30">
                    Pusat Karir & Bursa Kerja Khusus
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-2">
                    Monitoring Penyaluran Kerja & Alumni
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-200 mt-1">
                    Kelola mitra DUDI, lowongan kerja, proses rekrutmen, dan pelacakan jejak alumni (BMW).
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 shrink-0">
                  <div className="text-center px-2">
                    <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Lowongan Aktif</div>
                    <div className="text-lg sm:text-xl font-extrabold text-white">{activeJobs.length}</div>
                  </div>
                  <div className="text-center px-2 border-x border-white/10">
                    <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Pelamar Masuk</div>
                    <div className="text-lg sm:text-xl font-extrabold text-white">{totalApplicants}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Mitra DUDI</div>
                    <div className="text-lg sm:text-xl font-extrabold text-white">{companiesList.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Posting Lowongan Baru
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Publikasikan lowongan kerja dari mitra industri langsung ke portal siswa & alumni.
                </p>
                <button
                  onClick={openCreateJob}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Lowongan Kerja</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Verifikasi Pelamar
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Terdapat <strong>{jobApplicationsList.filter(a => a.status === 'Terdaftar').length} berkas lamaran baru</strong> yang siap diseleksi.
                </p>
                <button
                  onClick={() => setActiveTab('applicants')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Buka Data Pelamar</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Data Kerjasama MoU
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  {companiesList.length} Perusahaan Mitra Industri dan DUDI aktif bekerjasama.
                </p>
                <button
                  onClick={() => setActiveTab('companies')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Building className="w-4 h-4" />
                  <span>Kelola Mitra Industri</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: KELOLA LOWONGAN
        ========================================================= */}
        {activeTab === 'jobs' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Daftar Lowongan Pekerjaan BKK ({jobsList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola lowongan rekrutmen kerja untuk siswa dan alumni
                </p>
              </div>

              <button
                onClick={openCreateJob}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lowongan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobsList.map(job => {
                const companyName = companiesList.find(c => c.id === job.companyId)?.name || (job as any).companyName || 'Perusahaan Mitra';
                const pos = job.position || (job as any).title;
                const empType = job.employmentType || (job as any).type || 'Full Time';
                return (
                  <div key={job.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {empType}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {pos}
                        </h4>
                        <div className="text-xs text-slate-500 font-semibold">{companyName}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span>{job.location}</span>
                      <span>Batas: {job.deadline}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: SELEKSI PELAMAR
        ========================================================= */}
        {activeTab === 'applicants' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Daftar Pelamar Kerja Masuk ({jobApplicationsList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Seleksi berkas, verifikasi CV, dan perbarui status kelulusan interview
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                    <th className="py-3 px-4">Nama Pelamar</th>
                    <th className="py-3 px-4">Lowongan Kerja</th>
                    <th className="py-3 px-4">Kontak</th>
                    <th className="py-3 px-4">CV / Berkas</th>
                    <th className="py-3 px-4">Status Seleksi</th>
                    <th className="py-3 px-4 text-center">Ubah Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {jobApplicationsList.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{app.applicantName}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{app.jobTitle}</div>
                        <div className="text-[10px] text-slate-500">{app.companyName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <div>{app.applicantEmail}</div>
                        <div className="text-[10px] text-slate-400">{app.applicantPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        {app.cvUrl ? (
                          <a 
                            href={app.cvUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>Lihat CV</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          app.status === 'Diterima' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'Ditolak' ? 'bg-rose-100 text-rose-800' :
                          app.status === 'Interview' ? 'bg-indigo-100 text-indigo-800' :
                          app.status === 'Seleksi Berkas' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                          className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-[11px]"
                        >
                          <option value="Terdaftar">Terdaftar</option>
                          <option value="Seleksi Berkas">Seleksi Berkas</option>
                          <option value="Interview">Interview</option>
                          <option value="Diterima">Diterima</option>
                          <option value="Ditolak">Ditolak</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {jobApplicationsList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada data pelamar kerja yang masuk.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: MITRA INDUSTRI DUDI
        ========================================================= */}
        {activeTab === 'companies' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Mitra Industri & Perusahaan DUDI ({companiesList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar perusahaan rekanan untuk PKL, Rekrutmen BKK, dan Penyelarasan Kurikulum
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {companiesList.map(comp => (
                <div key={comp.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-slate-900 dark:text-white">{comp.name}</div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {comp.sector}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{comp.address}, {comp.city}</div>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    PIC: {comp.contactPerson} ({comp.phone})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: TRACER STUDY ALUMNI
        ========================================================= */}
        {activeTab === 'tracer' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Analisis Kuesioner Tracer Study Alumni
              </h3>
              <p className="text-xs text-slate-500">
                Data pelacakan lulusan BMW (Bekerja, Melanjutkan Kuliah, Wirausaha)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Bekerja (B)</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">68%</div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center">
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">Melanjutkan (M)</div>
                <div className="text-2xl font-black text-blue-600 mt-1">18%</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-center">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Wirausaha (W)</div>
                <div className="text-2xl font-black text-amber-600 mt-1">14%</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Tambah Lowongan */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tambah Lowongan Kerja BKK Baru
            </h3>

            <form onSubmit={handleSaveJobSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Posisi Pekerjaan</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Contoh: Junior Web Developer / Teknisi Mesin"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan</label>
                  <input
                    type="text"
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipe Pekerjaan</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Full-Time" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Full-Time</option>
                    <option value="Part-Time" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Part-Time</option>
                    <option value="Magang" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Magang</option>
                    <option value="Kontrak" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Kontrak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Batas Lamaran</label>
                  <input
                    type="date"
                    value={jobDeadline}
                    onChange={(e) => setJobDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Pekerjaan</label>
                <textarea
                  rows={3}
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Ringkasan tugas dan tanggung jawab..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingJob}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md"
                >
                  {isSavingJob ? 'Menyimpan...' : 'Simpan Lowongan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
