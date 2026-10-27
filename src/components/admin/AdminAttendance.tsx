import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Calendar, 
  Search, 
  Filter, 
  UserCheck, 
  Building, 
  BookOpen, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Edit, 
  Trash2, 
  FileText,
  Users,
  Percent
} from 'lucide-react';
import { 
  AttendanceRecord, 
  AttendanceStatus, 
  AttendanceStudentItem, 
  AcademicYearItem, 
  ClassItem, 
  TeacherItem, 
  SubjectItem, 
  StudentItem,
  StudentAttendanceSummary
} from '../../types';
import { 
  saveAttendanceRecord, 
  deleteAttendanceRecord, 
  calculateStudentAttendanceSummary 
} from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminAttendanceProps {
  attendanceList: AttendanceRecord[];
  academicYearsList: AcademicYearItem[];
  classesList: ClassItem[];
  teachersList: TeacherItem[];
  subjectsList: SubjectItem[];
  studentsList: StudentItem[];
  onRefresh: () => Promise<void>;
}

export const AdminAttendance: React.FC<AdminAttendanceProps> = ({
  attendanceList = [],
  academicYearsList = [],
  classesList = [],
  teachersList = [],
  subjectsList = [],
  studentsList = [],
  onRefresh
}) => {
  const { success, error } = useToast();

  const activeYear = useMemo(() => 
    academicYearsList.find(ay => ay.isActive) || academicYearsList[0],
    [academicYearsList]
  );

  // Tabs: 'records' | 'recap'
  const [activeTab, setActiveTab] = useState<'records' | 'recap'>('records');

  // Filters
  const [selectedYearId, setSelectedYearId] = useState<string>(activeYear?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(classesList[0]?.id || 'ALL');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal / Input State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttendanceRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AttendanceRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formYearId, setFormYearId] = useState(activeYear?.id || '');
  const [formClassId, setFormClassId] = useState(classesList[0]?.id || '');
  const [formSubjectId, setFormSubjectId] = useState(subjectsList[0]?.id || '');
  const [formTeacherId, setFormTeacherId] = useState(teachersList[0]?.id || '');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTopic, setFormTopic] = useState('');
  const [studentAttendances, setStudentAttendances] = useState<AttendanceStudentItem[]>([]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingItem(null);
    const targetClassId = selectedClassId !== 'ALL' ? selectedClassId : (classesList[0]?.id || '');
    setFormYearId(selectedYearId || activeYear?.id || '');
    setFormClassId(targetClassId);
    setFormSubjectId(selectedSubjectId !== 'ALL' ? selectedSubjectId : (subjectsList[0]?.id || ''));
    setFormTeacherId(teachersList[0]?.id || '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTopic('');

    // Initialize students for the selected class
    const classStudents = (studentsList || []).filter(s => s.classId === targetClassId && s.status === 'Aktif');
    const initialItems: AttendanceStudentItem[] = classStudents.map(s => ({
      studentId: s.id,
      status: 'Hadir',
      notes: ''
    }));
    setStudentAttendances(initialItems);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (rec: AttendanceRecord) => {
    setEditingItem(rec);
    setFormYearId(rec.academicYearId);
    setFormClassId(rec.classId);
    setFormSubjectId(rec.subjectId);
    setFormTeacherId(rec.teacherId);
    setFormDate(rec.date);
    setFormTopic(rec.topicOrMaterial || '');

    const classStudents = (studentsList || []).filter(s => s.classId === rec.classId && s.status === 'Aktif');
    const mergedItems: AttendanceStudentItem[] = classStudents.map(s => {
      const existing = rec.items?.find(i => i.studentId === s.id);
      return existing || { studentId: s.id, status: 'Hadir', notes: '' };
    });
    setStudentAttendances(mergedItems);
    setIsModalOpen(true);
  };

  // Handle changing class inside form
  const handleFormClassChange = (newClassId: string) => {
    setFormClassId(newClassId);
    const classStudents = (studentsList || []).filter(s => s.classId === newClassId && s.status === 'Aktif');
    const initialItems: AttendanceStudentItem[] = classStudents.map(s => ({
      studentId: s.id,
      status: 'Hadir',
      notes: ''
    }));
    setStudentAttendances(initialItems);
  };

  // Quick mark all as Hadir
  const handleMarkAll = (status: AttendanceStatus) => {
    setStudentAttendances(prev => prev.map(item => ({ ...item, status })));
  };

  // Change single student status
  const handleStudentStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendances(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, status } : item
    ));
  };

  const handleStudentNotesChange = (studentId: string, notes: string) => {
    setStudentAttendances(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, notes } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassId || !formSubjectId || !formTeacherId || !formDate) {
      error('Mohon lengkapi data kelas, mata pelajaran, guru, dan tanggal absensi.');
      return;
    }

    if (studentAttendances.length === 0) {
      error('Tidak ada siswa aktif dalam kelas yang dipilih.');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveAttendanceRecord({
        id: editingItem?.id,
        academicYearId: formYearId,
        date: formDate,
        classId: formClassId,
        subjectId: formSubjectId,
        teacherId: formTeacherId,
        topicOrMaterial: formTopic.trim(),
        items: studentAttendances,
        createdAt: editingItem?.createdAt
      });
      success('Data absensi presensi siswa berhasil disimpan.');
      setIsModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      error(err.message || 'Gagal menyimpan absensi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsSubmitting(true);
      await deleteAttendanceRecord(itemToDelete.id);
      success('Catatan absensi berhasil dihapus.');
      setItemToDelete(null);
      await onRefresh();
    } catch (err: any) {
      error(err.message || 'Gagal menghapus absensi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Attendance Records
  const filteredRecords = useMemo(() => {
    return (attendanceList || []).filter(rec => {
      if (selectedYearId && rec.academicYearId !== selectedYearId) return false;
      if (selectedClassId !== 'ALL' && rec.classId !== selectedClassId) return false;
      if (selectedSubjectId !== 'ALL' && rec.subjectId !== selectedSubjectId) return false;
      if (selectedDate && rec.date !== selectedDate) return false;
      return true;
    });
  }, [attendanceList, selectedYearId, selectedClassId, selectedSubjectId, selectedDate]);

  // Attendance Recap per Student for selected class
  const classStudents = useMemo(() => {
    const targetClass = selectedClassId !== 'ALL' ? selectedClassId : (classesList[0]?.id || '');
    return (studentsList || []).filter(s => s.classId === targetClass && s.status === 'Aktif');
  }, [studentsList, selectedClassId, classesList]);

  const attendanceRecap: StudentAttendanceSummary[] = useMemo(() => {
    const relevantRecords = (attendanceList || []).filter(r => {
      if (selectedYearId && r.academicYearId !== selectedYearId) return false;
      if (selectedClassId !== 'ALL' && r.classId !== selectedClassId) return false;
      if (selectedSubjectId !== 'ALL' && r.subjectId !== selectedSubjectId) return false;
      return true;
    });

    return calculateStudentAttendanceSummary(
      classStudents,
      relevantRecords,
      selectedSubjectId !== 'ALL' ? selectedSubjectId : undefined
    );
  }, [classStudents, attendanceList, selectedYearId, selectedClassId, selectedSubjectId]);

  const getClassName = (id: string) => classesList.find(c => c.id === id)?.name || id;
  const getTeacherName = (id: string) => teachersList.find(t => t.id === id)?.fullName || id;
  const getSubjectName = (id: string) => subjectsList.find(s => s.id === id)?.name || id;
  const getStudent = (id: string) => studentsList.find(s => s.id === id);

  return (
    <div id="admin-attendance-page" className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Presensi & Absensi Siswa
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {filteredRecords.length} Pertemuan Tercatat
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau kehadiran siswa harian (Hadir, Sakit, Izin, Alpa), rekap akumulasi kehadiran, dan persentase kehadiran per mata pelajaran.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'records' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Daftar Presensi</span>
            </button>
            <button
              onClick={() => setActiveTab('recap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'recap' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Rekapitulasi Siswa</span>
            </button>
          </div>

          <button
            id="btn-input-attendance"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Input Presensi Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Tahun Ajaran */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran</label>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800"
            >
              {academicYearsList.map(ay => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} ({ay.semester}) {ay.isActive ? '★ (Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Kelas */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kelas</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              {activeTab === 'records' && <option value="ALL">Semua Kelas</option>}
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="ALL">Semua Mata Pelajaran</option>
              {subjectsList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Tanggal (Only for records tab) */}
          {activeTab === 'records' ? (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Filter Tanggal</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
          ) : (
            <div className="flex items-end">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-[11px] font-semibold w-full">
                Bobot Kehadiran dalam Nilai Akhir: <span className="font-bold text-blue-700">45%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: DAFTAR PRESENSI PER PERTEMUAN */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Mata Pelajaran</th>
                  <th className="py-3.5 px-4">Guru</th>
                  <th className="py-3.5 px-4">Ringkasan Kehadiran</th>
                  <th className="py-3.5 px-4">Topik / Materi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Belum ada catatan presensi untuk filter ini. Klik "Input Presensi Baru".
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const totalStudents = rec.items?.length || 0;
                    const hadirCount = rec.items?.filter(i => i.status === 'Hadir').length || 0;
                    const sakitCount = rec.items?.filter(i => i.status === 'Sakit').length || 0;
                    const izinCount = rec.items?.filter(i => i.status === 'Izin').length || 0;
                    const alpaCount = rec.items?.filter(i => i.status === 'Alpa').length || 0;

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>{rec.date}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {getClassName(rec.classId)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 font-medium">
                          {getSubjectName(rec.subjectId)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {getTeacherName(rec.teacherId)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800" title="Hadir">
                              H: {hadirCount}
                            </span>
                            {sakitCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800" title="Sakit">
                                S: {sakitCount}
                              </span>
                            )}
                            {izinCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800" title="Izin">
                                I: {izinCount}
                              </span>
                            )}
                            {alpaCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800" title="Alpa">
                                A: {alpaCount}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">({totalStudents} siswa)</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {rec.topicOrMaterial || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(rec)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Presensi"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setItemToDelete(rec)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Presensi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REKAPITULASI KEHADIRAN SISWA */}
      {activeTab === 'recap' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Rekap Kehadiran: Kelas {getClassName(selectedClassId !== 'ALL' ? selectedClassId : classesList[0]?.id || '')}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedSubjectId !== 'ALL' ? `Mata Pelajaran: ${getSubjectName(selectedSubjectId)}` : 'Akumulasi Seluruh Mata Pelajaran'}
              </p>
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              Total Siswa: <span className="text-slate-900 font-bold">{classStudents.length} Siswa</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">NIS</th>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4 text-center">Total Pertemuan</th>
                  <th className="py-3.5 px-4 text-center text-emerald-700">Hadir (H)</th>
                  <th className="py-3.5 px-4 text-center text-blue-700">Sakit (S)</th>
                  <th className="py-3.5 px-4 text-center text-amber-700">Izin (I)</th>
                  <th className="py-3.5 px-4 text-center text-rose-700">Alpa (A)</th>
                  <th className="py-3.5 px-4 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceRecap.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada data siswa atau catatan absensi untuk kelas ini.
                    </td>
                  </tr>
                ) : (
                  attendanceRecap.map((summary, idx) => (
                    <tr key={summary.studentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{summary.studentNis}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{summary.studentName}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">{summary.totalMeetings} kali</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">{summary.hadir}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-700">{summary.sakit}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-700">{summary.izin}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-700">{summary.alpa}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                          summary.percentage >= 85 
                            ? 'bg-emerald-100 text-emerald-800'
                            : summary.percentage >= 75
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          <Percent className="w-3 h-3" />
                          {summary.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Input/Edit Presensi Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                {editingItem ? 'Edit Data Presensi' : 'Form Input Presensi Siswa'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Top Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                  <select
                    value={formYearId}
                    onChange={(e) => setFormYearId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-900 bg-white"
                  >
                    {academicYearsList.map(ay => (
                      <option key={ay.id} value={ay.id}>{ay.name} ({ay.semester})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={formClassId}
                    onChange={(e) => handleFormClassChange(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-900 bg-white"
                  >
                    {classesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-900 bg-white"
                  >
                    {subjectsList.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guru Pengabsen</label>
                  <select
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-900 bg-white"
                  >
                    {teachersList.map(t => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tanggal & Topik */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Presensi</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Topik / Materi Pelajaran Hari Ini</label>
                  <input
                    type="text"
                    placeholder="Misal: Praktikum Perakitan Komponen Jaringan & Routing..."
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Action bar: Set All */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="font-bold text-slate-800 text-xs">
                  Daftar Siswa ({studentAttendances.length} Orang)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 mr-1">Tandai Cepat:</span>
                  <button
                    type="button"
                    onClick={() => handleMarkAll('Hadir')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                  >
                    Semua Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll('Izin')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
                  >
                    Semua Izin
                  </button>
                </div>
              </div>

              {/* Student Attendance List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {studentAttendances.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    Tidak ada siswa aktif terdaftar pada kelas ini.
                  </div>
                ) : (
                  studentAttendances.map((item, idx) => {
                    const student = getStudent(item.studentId);
                    return (
                      <div key={item.studentId} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 text-center font-bold text-slate-400">{idx + 1}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {student?.fullName || item.studentId}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              NIS: {student?.nis || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Radio Group for Status */}
                          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                            {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as AttendanceStatus[]).map(status => {
                              const isSelected = item.status === status;
                              const getStatusColor = () => {
                                if (!isSelected) return 'text-slate-600 hover:text-slate-900';
                                if (status === 'Hadir') return 'bg-emerald-600 text-white shadow-xs';
                                if (status === 'Sakit') return 'bg-blue-600 text-white shadow-xs';
                                if (status === 'Izin') return 'bg-amber-600 text-white shadow-xs';
                                return 'bg-rose-600 text-white shadow-xs';
                              };

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleStudentStatusChange(item.studentId, status)}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${getStatusColor()}`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>

                          <input
                            type="text"
                            placeholder="Catatan..."
                            value={item.notes || ''}
                            onChange={(e) => handleStudentNotesChange(item.studentId, e.target.value)}
                            className="w-28 sm:w-36 px-2 py-1 rounded-md border border-slate-200 text-[11px] text-slate-800"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || studentAttendances.length === 0}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Presensi')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Hapus Catatan Presensi"
        message={`Apakah Anda yakin ingin menghapus data presensi tanggal "${itemToDelete?.date}" untuk mata pelajaran "${itemToDelete ? getSubjectName(itemToDelete.subjectId) : ''}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
