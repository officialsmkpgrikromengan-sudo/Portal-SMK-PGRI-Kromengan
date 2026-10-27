import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Building2, 
  GraduationCap, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  ExternalLink, 
  Send, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  Globe,
  Award,
  X,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { 
  JobItem, 
  CompanyItem, 
  AlumniItem, 
  TracerSurvey, 
  MajorItem 
} from '../../types';
import { defaultTracerSurveysList } from '../../data/defaultData';
import { applyForJob, submitTracerResponse } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface CareerViewProps {
  jobsList: JobItem[];
  companiesList: CompanyItem[];
  alumniList: AlumniItem[];
  tracerSurveysList: TracerSurvey[];
  majorsList: MajorItem[];
  onRefresh?: () => void;
}

export const CareerView: React.FC<CareerViewProps> = ({
  jobsList,
  companiesList,
  alumniList,
  tracerSurveysList,
  majorsList,
  onRefresh
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'bkk' | 'pkl' | 'alumni' | 'tracer'>('bkk');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  // Selected Job for Application Modal
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Application Form
  const [applicantForm, setApplicantForm] = useState({
    name: '',
    email: '',
    phone: '',
    cvUrl: '',
    coverLetter: ''
  });

  // Selected Job Detail Modal
  const [viewingJob, setViewingJob] = useState<JobItem | null>(null);

  // Tracer Study Form State
  const [tracerForm, setTracerForm] = useState({
    alumniName: '',
    graduationYear: '2024',
    majorId: majorsList[0]?.id || '',
    answers: {} as Record<string, any>
  });
  const [isSubmittingTracer, setIsSubmittingTracer] = useState(false);
  const [tracerSubmitted, setTracerSubmitted] = useState(false);

  // Helper
  const getCompany = (id: string) => companiesList.find(c => c.id === id);
  const getMajor = (id: string) => majorsList.find(m => m.id === id);

  // Filtered Public Jobs (Only Published)
  const publishedJobs = useMemo(() => {
    return jobsList.filter(j => j.status === 'Published').filter(j => {
      const comp = getCompany(j.companyId);
      const matchSearch = `${j.position} ${comp?.name || ''} ${j.location}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !filterType || j.employmentType === filterType;
      return matchSearch && matchType;
    });
  }, [jobsList, companiesList, searchQuery, filterType]);

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    return companiesList.filter(c => c.status === 'Aktif').filter(c => {
      return `${c.name} ${c.industryType} ${c.city}`.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [companiesList, searchQuery]);

  // Filtered Alumni
  const filteredAlumni = useMemo(() => {
    return alumniList.filter(a => {
      const maj = getMajor(a.majorId);
      return `${a.name} ${a.currentCompany || ''} ${maj?.name || ''} ${a.graduationYear}`.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [alumniList, majorsList, searchQuery]);

  // Handlers
  const handleOpenApply = (job: JobItem) => {
    setSelectedJob(job);
    setApplicantForm({
      name: '',
      email: '',
      phone: '',
      cvUrl: '',
      coverLetter: ''
    });
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!applicantForm.name.trim() || !applicantForm.email.trim()) {
      error('Nama dan email wajib diisi.');
      return;
    }

    setIsApplying(true);
    try {
      await applyForJob({
        jobId: selectedJob.id,
        applicantName: applicantForm.name,
        applicantEmail: applicantForm.email,
        applicantPhone: applicantForm.phone,
        cvUrl: applicantForm.cvUrl || 'https://drive.google.com/sample-cv',
        coverLetter: applicantForm.coverLetter,
        status: 'Terdaftar'
      });
      success('Lamaran kerja Anda berhasil dikirim ke BKK Sekolah!');
      setIsApplyModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      error('Gagal mengirim lamaran kerja. Coba lagi nanti.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleTracerAnswerChange = (questionId: string, answer: any) => {
    setTracerForm(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const handleSubmitTracer = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeSurvey = tracerSurveysList.find(s => s.isActive) || tracerSurveysList[0];
    if (!activeSurvey) {
      error('Tidak ada survei tracer study yang aktif saat ini.');
      return;
    }
    if (!tracerForm.alumniName.trim()) {
      error('Mohon isi nama lengkap Anda.');
      return;
    }

    setIsSubmittingTracer(true);
    try {
      await submitTracerResponse({
        surveyId: activeSurvey.id,
        alumniName: tracerForm.alumniName,
        graduationYear: tracerForm.graduationYear,
        answers: tracerForm.answers
      });
      setTracerSubmitted(true);
      success('Terima kasih! Respon Tracer Study Anda telah berhasil tersimpan.');
      if (onRefresh) onRefresh();
    } catch (err) {
      error('Gagal mengirim respon survei tracer study.');
    } finally {
      setIsSubmittingTracer(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wider uppercase text-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Karir, Kemitraan Industri & Jaringan Alumni</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Gerbang Karir & Kolaborasi Industri Terdepan
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Temukan lowongan kerja resmi rekanan BKK, kemitraan Praktik Kerja Lapangan (PKL) berkualitas, serta direktori dan tracer study alumni vokasi berprestasi.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          {[
            { id: 'bkk', label: 'Lowongan Kerja BKK', icon: <Briefcase className="w-4 h-4" /> },
            { id: 'pkl', label: 'Mitra Industri PKL', icon: <Building2 className="w-4 h-4" /> },
            { id: 'alumni', label: 'Direktori & Kisah Alumni', icon: <GraduationCap className="w-4 h-4" /> },
            { id: 'tracer', label: 'Isi Tracer Study', icon: <FileCheck className="w-4 h-4" /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LOWONGAN KERJA BKK */}
        {/* ========================================================================= */}
        {activeTab === 'bkk' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari lowongan, posisi pekerjaan, atau perusahaan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden shrink-0"
              >
                <option value="">Semua Tipe Kontrak</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Kontrak">Kontrak</option>
                <option value="Magang">Magang Kerja</option>
              </select>
            </div>

            {/* Jobs Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedJobs.map(job => {
                const company = getCompany(job.companyId);

                return (
                  <div 
                    key={job.id} 
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all space-y-4"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0 border border-blue-100">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                              {job.position}
                            </h3>
                            <span className="text-xs font-bold text-blue-600 block mt-0.5">
                              {company?.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Status: <strong className="text-slate-800">{job.employmentType}</strong></span>
                        </div>
                        {job.salaryInfo && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-emerald-700">{job.salaryInfo}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="text-rose-600 font-bold">Batas: {job.deadline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setViewingJob(job)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center"
                      >
                        Detail Syarat
                      </button>
                      <button
                        onClick={() => handleOpenApply(job)}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs text-center"
                      >
                        Lamar Sekarang
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {publishedJobs.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">Belum ada lowongan pekerjaan sesuai pencarian</h4>
                <p className="text-xs text-slate-400">Silakan ubah kata kunci atau periksa kembali nanti.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MITRA INDUSTRI PKL */}
        {/* ========================================================================= */}
        {activeTab === 'pkl' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari mitra industri, bidang teknologi, manufaktur, otomotif..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map(company => (
                <div key={company.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">{company.name}</h4>
                        <span className="text-xs font-bold text-blue-600 block">{company.industryType}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {company.description || company.address}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{company.city}</span>
                      </div>
                      {company.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                            {company.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Kuota PKL per Periode:</span>
                    <span className="px-2.5 py-0.5 rounded-full font-black bg-blue-50 text-blue-700">
                      {company.quota || 5} Siswa
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DIREKTORI & KISAH ALUMNI */}
        {/* ========================================================================= */}
        {activeTab === 'alumni' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama alumni, profesi, perusahaan, angkatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map(alumni => {
                const major = getMajor(alumni.majorId);

                return (
                  <div key={alumni.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900">{alumni.name}</h4>
                          <span className="text-xs text-indigo-600 font-bold block">
                            Lulus {alumni.graduationYear} • {major?.shortName || major?.name}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          alumni.status === 'Bekerja' ? 'bg-emerald-100 text-emerald-700' :
                          alumni.status === 'Kuliah' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {alumni.status}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                        <div className="font-bold text-slate-800">{alumni.currentJob || 'Karier Profesional'}</div>
                        <div className="text-slate-500 font-medium">{alumni.currentCompany ? `@ ${alumni.currentCompany}` : ''} ({alumni.city})</div>
                      </div>

                      {alumni.testimonial && (
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          "{alumni.testimonial}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ISI TRACER STUDY KUESIONER */}
        {/* ========================================================================= */}
        {activeTab === 'tracer' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b pb-4 space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-blue-600" />
                <span>Kuesioner Tracer Study Alumni Vokasi</span>
              </h2>
              <p className="text-xs text-slate-500">
                Bantu kami meningkatkan kualitas pembelajaran sekolah dan relevansi kurikulum dengan mengisi formulir penelusuran lulusan di bawah ini.
              </p>
            </div>

            {tracerSubmitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-900">Respon Anda Berhasil Terkirim!</h3>
                <p className="text-xs text-emerald-700">Terima kasih atas partisipasi dan kontribusi berharga Anda bagi almamater tercinta.</p>
                <button
                  onClick={() => setTracerSubmitted(false)}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Isi Formulir Baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTracer} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Alumni *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap Anda..."
                      value={tracerForm.alumniName}
                      onChange={(e) => setTracerForm({ ...tracerForm, alumniName: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Program Keahlian (Jurusan) *</label>
                    <select
                      value={tracerForm.majorId || ''}
                      onChange={(e) => setTracerForm({ ...tracerForm, majorId: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-bold"
                    >
                      <option value="">Pilih Program Keahlian...</option>
                      {majorsList.filter(m => m.status === 'Aktif').map(m => (
                        <option key={m.id} value={m.id}>
                          {m.code} - {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tahun Lulus *</label>
                    <select
                      value={tracerForm.graduationYear}
                      onChange={(e) => setTracerForm({ ...tracerForm, graduationYear: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-bold"
                    >
                      {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map(y => (
                        <option key={y} value={y}>Lulus {y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Questions */}
                {(() => {
                  const activeSurvey = tracerSurveysList.find(s => s.isActive) || tracerSurveysList[0] || defaultTracerSurveysList[0];
                  const surveyQuestions = (activeSurvey?.questions && activeSurvey.questions.length > 0)
                    ? activeSurvey.questions
                    : defaultTracerSurveysList[0].questions;

                  return surveyQuestions.map((q, idx) => {
                    const defaultQ = defaultTracerSurveysList[0]?.questions[idx];
                    const questionText = q.question?.trim() || q.text?.trim() || defaultQ?.question || defaultQ?.text || `Pertanyaan ${idx + 1}`;
                    return (
                      <div key={q.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <label className="font-extrabold text-slate-800 block text-xs sm:text-sm">
                            {idx + 1}. {questionText} {q.required && <span className="text-rose-500">*</span>}
                          </label>
                          {(q.category || defaultQ?.category) && (
                            <span className="text-[10px] bg-blue-100/80 text-blue-800 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                              {q.category || defaultQ?.category}
                            </span>
                          )}
                        </div>

                      {q.type === 'single_choice' && q.options && (
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt: string) => (
                            <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-medium hover:text-slate-900 transition-colors">
                              <input
                                type="radio"
                                name={q.id}
                                required={q.required}
                                value={opt}
                                onChange={(e) => handleTracerAnswerChange(q.id, e.target.value)}
                                className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === 'multiple_choice' && q.options && (
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt: string) => (
                            <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-medium hover:text-slate-900 transition-colors">
                              <input
                                type="checkbox"
                                name={`${q.id}_${opt}`}
                                value={opt}
                                onChange={(e) => {
                                  const currentAnswers = (tracerForm.answers[q.id] as string[]) || [];
                                  const newAnswers = e.target.checked
                                    ? [...currentAnswers, opt]
                                    : currentAnswers.filter(a => a !== opt);
                                  handleTracerAnswerChange(q.id, newAnswers);
                                }}
                                className="text-blue-600 focus:ring-blue-500 rounded-sm w-4 h-4"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {(q.type === 'text' || q.type === 'number' || q.type === 'year') && (
                        <input
                          type={q.type === 'number' ? 'number' : 'text'}
                          required={q.required}
                          placeholder={q.type === 'year' ? 'Contoh: 2024' : 'Ketik jawaban Anda di sini...'}
                          onChange={(e) => handleTracerAnswerChange(q.id, e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                      )}

                      {q.type === 'rating' && (
                        <div className="flex items-center gap-4 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <label key={star} className="flex items-center gap-1 cursor-pointer font-bold text-slate-700">
                              <input
                                type="radio"
                                name={q.id}
                                required={q.required}
                                value={star}
                                onChange={(e) => handleTracerAnswerChange(q.id, star)}
                              />
                              <span>{star} ⭐</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

                <button
                  type="submit"
                  disabled={isSubmittingTracer}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-4"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingTracer ? 'Mengirimkan Respon...' : 'Kirim Respon Tracer Study'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: JOB DETAIL */}
      {/* ========================================================================= */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">{viewingJob.position}</h3>
                <span className="text-xs font-bold text-blue-600">{getCompany(viewingJob.companyId)?.name}</span>
              </div>
              <button onClick={() => setViewingJob(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Deskripsi Pekerjaan</h4>
                <p className="leading-relaxed whitespace-pre-line">{viewingJob.description}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Persyaratan & Kualifikasi</h4>
                <p className="leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {viewingJob.requirements}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-slate-500">
                <div>Lokasi: <strong className="text-slate-800">{viewingJob.location}</strong></div>
                <div>Tipe: <strong className="text-slate-800">{viewingJob.employmentType}</strong></div>
                {viewingJob.salaryInfo && <div>Gaji: <strong className="text-emerald-700">{viewingJob.salaryInfo}</strong></div>}
                <div>Deadline: <strong className="text-rose-600 font-mono">{viewingJob.deadline}</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setViewingJob(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const targetJob = viewingJob;
                  setViewingJob(null);
                  handleOpenApply(targetJob);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Lamar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPLY FOR JOB */}
      {/* ========================================================================= */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Formulir Lamaran Pekerjaan (BKK)</h3>
                <span className="text-xs text-blue-600 font-bold">Posisi: {selectedJob.position}</span>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Pelamar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={applicantForm.name}
                  onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Aktif *</label>
                  <input
                    type="email"
                    required
                    placeholder="budi@gmail.com"
                    value={applicantForm.email}
                    onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp / HP *</label>
                  <input
                    type="text"
                    required
                    placeholder="081234567890"
                    value={applicantForm.phone}
                    onChange={(e) => setApplicantForm({ ...applicantForm, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tautan Resume / CV (Google Drive / LinkedIn / PDF) *</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/your-cv-link"
                  value={applicantForm.cvUrl}
                  onChange={(e) => setApplicantForm({ ...applicantForm, cvUrl: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Surat Pengantar Singkat (Cover Letter)</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan secara singkat motivasi dan kesiapan kompetensi Anda..."
                  value={applicantForm.coverLetter}
                  onChange={(e) => setApplicantForm({ ...applicantForm, coverLetter: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  {isApplying ? 'Mengirimkan...' : 'Kirim Lamaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
