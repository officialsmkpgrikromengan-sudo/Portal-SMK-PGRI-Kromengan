import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Users, 
  FileCheck2, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  ExternalLink,
  ChevronRight,
  Download,
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { 
  AlumniItem, 
  TracerSurvey, 
  TracerResponse, 
  MajorItem, 
  AdminSection 
} from '../../types';
import { 
  addAlumni, 
  updateAlumni, 
  deleteAlumni,
  saveTracerSurvey,
  submitTracerResponse
} from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminAlumniProps {
  initialSubSection?: AdminSection;
  alumniList: AlumniItem[];
  tracerSurveysList: TracerSurvey[];
  tracerResponsesList: TracerResponse[];
  majorsList: MajorItem[];
  onRefresh: () => void;
  onNavigateSubSection?: (sub: AdminSection) => void;
}

export const AdminAlumni: React.FC<AdminAlumniProps> = ({
  initialSubSection = 'alumni_list',
  alumniList,
  tracerSurveysList,
  tracerResponsesList,
  majorsList,
  onRefresh,
  onNavigateSubSection
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<AdminSection>(initialSubSection);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [isAlumniModalOpen, setIsAlumniModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniItem | null>(null);

  const [isTracerDetailModalOpen, setIsTracerDetailModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<TracerResponse | null>(null);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  // Form State
  const [alumniForm, setAlumniForm] = useState({
    name: '',
    graduationYear: '2024',
    majorId: majorsList[0]?.id || '',
    email: '',
    phone: '',
    city: 'Malang',
    status: 'Bekerja' as AlumniItem['status'],
    currentJob: '',
    currentCompany: '',
    notes: '',
    testimonial: ''
  });

  // Calculate Statistics
  const stats = useMemo(() => {
    const totalAlumni = alumniList.length;
    const working = alumniList.filter(a => a.status === 'Bekerja').length;
    const studying = alumniList.filter(a => a.status === 'Kuliah').length;
    const entrepreneur = alumniList.filter(a => a.status === 'Wirausaha').length;
    const jobSeeking = alumniList.filter(a => a.status === 'Mencari Kerja').length;
    const totalResponses = tracerResponsesList.length;

    const workingPct = totalAlumni > 0 ? ((working / totalAlumni) * 100).toFixed(1) : '0';
    const studyingPct = totalAlumni > 0 ? ((studying / totalAlumni) * 100).toFixed(1) : '0';
    const entrepreneurPct = totalAlumni > 0 ? ((entrepreneur / totalAlumni) * 100).toFixed(1) : '0';

    return {
      totalAlumni,
      working,
      studying,
      entrepreneur,
      jobSeeking,
      totalResponses,
      workingPct,
      studyingPct,
      entrepreneurPct
    };
  }, [alumniList, tracerResponsesList]);

  // Helpers
  const getMajor = (id: string) => majorsList.find(m => m.id === id);

  // Filtered Alumni
  const filteredAlumni = useMemo(() => {
    return alumniList.filter(a => {
      const maj = getMajor(a.majorId);
      const searchStr = `${a.name} ${a.currentCompany || ''} ${a.currentJob || ''} ${maj?.name || ''} ${a.city}`.toLowerCase();
      const matchSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchYear = !filterYear || a.graduationYear === filterYear;
      const matchMajor = !filterMajor || a.majorId === filterMajor;
      const matchStatus = !filterStatus || a.status === filterStatus;
      return matchSearch && matchYear && matchMajor && matchStatus;
    });
  }, [alumniList, majorsList, searchQuery, filterYear, filterMajor, filterStatus]);

  // Distinct Years
  const distinctYears = useMemo(() => {
    const years = Array.from(new Set(alumniList.map(a => a.graduationYear))).sort().reverse();
    return years.length > 0 ? years : ['2025', '2024', '2023', '2022', '2021'];
  }, [alumniList]);

  // Handlers for Alumni
  const handleOpenAddAlumni = () => {
    setEditingAlumni(null);
    setAlumniForm({
      name: '',
      graduationYear: '2024',
      majorId: majorsList[0]?.id || '',
      email: '',
      phone: '',
      city: 'Malang',
      status: 'Bekerja',
      currentJob: '',
      currentCompany: '',
      notes: '',
      testimonial: ''
    });
    setIsAlumniModalOpen(true);
  };

  const handleOpenEditAlumni = (alumni: AlumniItem) => {
    setEditingAlumni(alumni);
    setAlumniForm({
      name: alumni.name,
      graduationYear: alumni.graduationYear,
      majorId: alumni.majorId,
      email: alumni.email,
      phone: alumni.phone || '',
      city: alumni.city,
      status: alumni.status,
      currentJob: alumni.currentJob || '',
      currentCompany: alumni.currentCompany || '',
      notes: alumni.notes || '',
      testimonial: alumni.testimonial || ''
    });
    setIsAlumniModalOpen(true);
  };

  const handleSaveAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumniForm.name.trim() || !alumniForm.majorId) {
      error('Nama alumni dan program keahlian wajib diisi.');
      return;
    }
    try {
      if (editingAlumni) {
        await updateAlumni(editingAlumni.id, alumniForm);
        success('Data alumni berhasil diperbarui.');
      } else {
        await addAlumni(alumniForm);
        success('Data alumni baru berhasil ditambahkan.');
      }
      setIsAlumniModalOpen(false);
      onRefresh();
    } catch (err) {
      error('Gagal menyimpan data alumni.');
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAlumni(deleteTarget.id);
      success(`Alumni ${deleteTarget.name} berhasil dihapus.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      error('Gagal menghapus alumni.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Nama', 'Tahun Lulus', 'Jurusan', 'Status', 'Pekerjaan', 'Instansi/Perusahaan', 'Kota', 'Email', 'No Telp'];
    const rows = filteredAlumni.map(a => [
      `"${a.name}"`,
      `"${a.graduationYear}"`,
      `"${getMajor(a.majorId)?.name || ''}"`,
      `"${a.status}"`,
      `"${a.currentJob || '-'}"`,
      `"${a.currentCompany || '-'}"`,
      `"${a.city}"`,
      `"${a.email}"`,
      `"${a.phone || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_alumni_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Data alumni berhasil diekspor ke CSV.');
  };

  return (
    <div id="admin-alumni-module" className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Modul Alumni & Tracer Study
            </h2>
            <p className="text-xs text-slate-500">
              Database direktori alumni, kuesioner tracer study kelulusan, dan analitik BMW (Bekerja, Melanjutkan, Wirausaha).
            </p>
          </div>
        </div>

        {/* Sub-menu Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-2 pt-2 scrollbar-thin">
          {[
            { id: 'alumni_list', label: 'Data Direktori Alumni', icon: <Users className="w-4 h-4" />, badge: stats.totalAlumni },
            { id: 'alumni_tracer', label: 'Tracer Study', icon: <FileCheck2 className="w-4 h-4" />, badge: stats.totalResponses },
            { id: 'alumni_stats', label: 'Statistik & Analitik BMW', icon: <BarChart3 className="w-4 h-4" /> }
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
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-indigo-800 text-white' : 'bg-indigo-100 text-indigo-800'
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
      {/* 1. DATA DIREKTORI ALUMNI */}
      {/* ========================================================================= */}
      {activeTab === 'alumni_list' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap flex-1 items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, perusahaan, kota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
              >
                <option value="">Semua Angkatan</option>
                {distinctYears.map(y => (
                  <option key={y} value={y}>Lulus {y}</option>
                ))}
              </select>

              <select
                value={filterMajor}
                onChange={(e) => setFilterMajor(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
              >
                <option value="">Semua Jurusan</option>
                {majorsList.map(m => (
                  <option key={m.id} value={m.id}>{m.shortName || m.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
              >
                <option value="">Semua Status</option>
                <option value="Bekerja">Bekerja</option>
                <option value="Kuliah">Kuliah</option>
                <option value="Wirausaha">Wirausaha</option>
                <option value="Mencari Kerja">Mencari Kerja</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs"
                title="Ekspor ke Excel/CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={handleOpenAddAlumni}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Alumni</span>
              </button>
            </div>
          </div>

          {/* Alumni Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="p-3.5">Nama Alumni</th>
                    <th className="p-3.5">Angkatan & Jurusan</th>
                    <th className="p-3.5">Status & Karir Terkini</th>
                    <th className="p-3.5">Kontak</th>
                    <th className="p-3.5">Kota</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAlumni.map(alumni => {
                    const major = getMajor(alumni.majorId);

                    return (
                      <tr key={alumni.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div>{alumni.name}</div>
                          {alumni.testimonial && (
                            <span className="text-[10px] text-slate-400 font-normal italic block truncate max-w-xs">
                              "{alumni.testimonial}"
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">Lulus {alumni.graduationYear}</div>
                          <div className="text-[11px] text-indigo-600 font-semibold">{major?.shortName || major?.name}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              alumni.status === 'Bekerja' ? 'bg-emerald-100 text-emerald-700' :
                              alumni.status === 'Kuliah' ? 'bg-blue-100 text-blue-700' :
                              alumni.status === 'Wirausaha' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {alumni.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-700 font-medium">
                            {alumni.currentJob || '-'} {alumni.currentCompany ? `@ ${alumni.currentCompany}` : ''}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <div>{alumni.email}</div>
                          <div className="text-[10px] text-slate-400">{alumni.phone || '-'}</div>
                        </td>
                        <td className="p-3.5 text-slate-600">{alumni.city}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditAlumni(alumni)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="Edit Data Alumni"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'alumni', id: alumni.id, name: alumni.name })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus Alumni"
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
      {/* 2. TRACER STUDY */}
      {/* ========================================================================= */}
      {activeTab === 'alumni_tracer' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Survey Card */}
          {tracerSurveysList.map(survey => (
            <div key={survey.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{survey.title}</h3>
                  <p className="text-xs text-slate-500">{survey.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                  survey.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {survey.isActive ? 'Kuesioner Aktif' : 'Nonaktif'}
                </span>
              </div>

              {/* Questions preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Daftar Pertanyaan Kuesioner:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {survey.questions.map((q, idx) => (
                    <div key={q.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800 block">
                          {idx + 1}. {q.question || q.text || `Pertanyaan ${idx + 1}`}
                          {q.required && <span className="text-rose-500 ml-1">*</span>}
                        </span>
                        {q.category && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold whitespace-nowrap">
                            {q.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="text-indigo-600 font-semibold">Tipe: {q.type}</span>
                        {q.options && q.options.length > 0 && (
                          <span className="text-slate-400">{q.options.length} Pilihan Opsi</span>
                        )}
                      </div>
                      {q.options && q.options.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Tracer Responses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Hasil Respon Kuesioner Tracer Study</h3>
              <span className="text-xs font-bold text-slate-500">{tracerResponsesList.length} Respon Masuk</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="p-3">Nama Alumni</th>
                    <th className="p-3">Angkatan</th>
                    <th className="p-3">Waktu Respon</th>
                    <th className="p-3">Detail Jawaban</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tracerResponsesList.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">{res.alumniName}</td>
                      <td className="p-3 text-slate-600">Lulus {res.graduationYear}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{res.submittedAt.split('T')[0]}</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedResponse(res);
                            setIsTracerDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px]"
                        >
                          Lihat Jawaban
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STATISTIK ALUMNI */}
      {/* ========================================================================= */}
      {activeTab === 'alumni_stats' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">Bekerja (DUDI)</span>
              <div className="text-3xl font-black text-emerald-600">{stats.workingPct}%</div>
              <span className="text-[11px] text-slate-400">{stats.working} Alumni</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">Melanjutkan Kuliah</span>
              <div className="text-3xl font-black text-blue-600">{stats.studyingPct}%</div>
              <span className="text-[11px] text-slate-400">{stats.studying} Alumni</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">Wirausaha Mandiri</span>
              <div className="text-3xl font-black text-purple-600">{stats.entrepreneurPct}%</div>
              <span className="text-[11px] text-slate-400">{stats.entrepreneur} Alumni</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">Masa Tunggu Kerja Rata-rata</span>
              <div className="text-3xl font-black text-slate-800">1.8</div>
              <span className="text-[11px] text-slate-400">Bulan Pasca Kelulusan</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Distribusi Keterserapan Lulusan per Jurusan (BMW)</h3>
            
            <div className="space-y-4">
              {majorsList.map(major => {
                const majorAlumni = alumniList.filter(a => a.majorId === major.id);
                const total = majorAlumni.length || 1;
                const bCount = majorAlumni.filter(a => a.status === 'Bekerja').length;
                const mCount = majorAlumni.filter(a => a.status === 'Kuliah').length;
                const wCount = majorAlumni.filter(a => a.status === 'Wirausaha').length;

                const bPct = Math.round((bCount / total) * 100);
                const mPct = Math.round((mCount / total) * 100);
                const wPct = Math.round((wCount / total) * 100);

                return (
                  <div key={major.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{major.name}</span>
                      <span className="text-slate-500 font-semibold">{majorAlumni.length} Alumni Terlacak</span>
                    </div>

                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                      <div style={{ width: `${bPct}%` }} className="bg-emerald-500 h-full" title={`Bekerja: ${bPct}%`} />
                      <div style={{ width: `${mPct}%` }} className="bg-blue-500 h-full" title={`Kuliah: ${mPct}%`} />
                      <div style={{ width: `${wPct}%` }} className="bg-purple-500 h-full" title={`Wirausaha: ${wPct}%`} />
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Bekerja: {bPct}%</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Kuliah: {mPct}%</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Wirausaha: {wPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ALUMNI FORM */}
      {/* ========================================================================= */}
      {isAlumniModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingAlumni ? 'Edit Data Alumni' : 'Tambah Data Alumni Baru'}
              </h3>
              <button onClick={() => setIsAlumniModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlumni} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Alumni *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Anggara, S.Kom."
                  value={alumniForm.name}
                  onChange={(e) => setAlumniForm({ ...alumniForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tahun Kelulusan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2024"
                    value={alumniForm.graduationYear}
                    onChange={(e) => setAlumniForm({ ...alumniForm, graduationYear: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Program Keahlian / Jurusan *</label>
                  <select
                    required
                    value={alumniForm.majorId}
                    onChange={(e) => setAlumniForm({ ...alumniForm, majorId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    <option value="">-- Pilih Jurusan --</option>
                    {majorsList.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Aktivitas Saat Ini *</label>
                  <select
                    value={alumniForm.status}
                    onChange={(e) => setAlumniForm({ ...alumniForm, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    <option value="Bekerja">Bekerja</option>
                    <option value="Kuliah">Melanjutkan Kuliah</option>
                    <option value="Wirausaha">Wirausaha Mandiri</option>
                    <option value="Mencari Kerja">Mencari Kerja</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota Domisili</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jakarta / Malang"
                    value={alumniForm.city}
                    onChange={(e) => setAlumniForm({ ...alumniForm, city: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan / Posisi Pekerjaan / Prodi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Cloud Architect / Teknik Informatika"
                    value={alumniForm.currentJob}
                    onChange={(e) => setAlumniForm({ ...alumniForm, currentJob: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Perusahaan / Universitas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Google Indonesia / UB Malang"
                    value={alumniForm.currentCompany}
                    onChange={(e) => setAlumniForm({ ...alumniForm, currentCompany: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="alumni@gmail.com"
                    value={alumniForm.email}
                    onChange={(e) => setAlumniForm({ ...alumniForm, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp / Telp</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={alumniForm.phone}
                    onChange={(e) => setAlumniForm({ ...alumniForm, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Testimoni / Kesan untuk Sekolah</label>
                <textarea
                  rows={2}
                  placeholder="Kesan dan pesan berharga selama bersekolah..."
                  value={alumniForm.testimonial}
                  onChange={(e) => setAlumniForm({ ...alumniForm, testimonial: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAlumniModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Simpan Alumni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRACER STUDY DETAIL */}
      {/* ========================================================================= */}
      {isTracerDetailModalOpen && selectedResponse && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Respon Tracer Study Alumni</h3>
              <button onClick={() => setIsTracerDetailModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                <div className="font-bold text-slate-900">{selectedResponse.alumniName}</div>
                <div className="text-slate-500">Angkatan {selectedResponse.graduationYear} • Dikirim: {selectedResponse.submittedAt}</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Jawaban Kuesioner:</h4>
                <div className="space-y-2">
                  {Object.entries(selectedResponse.answers).map(([key, val]) => (
                    <div key={key} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-500 block text-[11px]">{key}</span>
                      <strong className="text-slate-800 text-xs">{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setIsTracerDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Konfirmasi Hapus Alumni"
        message={`Apakah Anda yakin ingin menghapus data alumni "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Data"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
