import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  UserCheck, 
  Building, 
  Calculator, 
  Save, 
  Edit, 
  Trash2, 
  FileSpreadsheet, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { 
  GradeRecord, 
  AcademicYearItem, 
  ClassItem, 
  TeacherItem, 
  SubjectItem, 
  StudentItem, 
  AttendanceRecord,
  SemesterType,
  SystemSettings
} from '../../types';
import { 
  saveGradeRecord, 
  saveGradesBatch, 
  deleteGradeRecord, 
  calculateFinalGrade,
  calculateStudentAttendanceSummary
} from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface BatchRow {
  attendanceScore: number;
  assignmentScore: number;
  utsScore: number;
  uasScore: number;
  notes: string;
  existingId?: string;
}

interface AdminGradesProps {
  gradesList: GradeRecord[];
  academicYearsList: AcademicYearItem[];
  classesList: ClassItem[];
  teachersList: TeacherItem[];
  subjectsList: SubjectItem[];
  studentsList: StudentItem[];
  attendanceList?: AttendanceRecord[];
  systemSettings?: SystemSettings;
  onRefresh: () => Promise<void>;
}

export const AdminGrades: React.FC<AdminGradesProps> = ({
  gradesList = [],
  academicYearsList = [],
  classesList = [],
  teachersList = [],
  subjectsList = [],
  studentsList = [],
  attendanceList = [],
  systemSettings,
  onRefresh
}) => {
  const { success, error } = useToast();

  const currentWeights = useMemo(() => {
    return systemSettings?.academicWeights || { attendance: 45, assignment: 20, uts: 15, uas: 20 };
  }, [systemSettings]);

  const currentKkm = systemSettings?.kkmStandard || 75;

  const activeYear = useMemo(() => 
    academicYearsList.find(ay => ay.isActive) || academicYearsList[0],
    [academicYearsList]
  );

  // Filters State
  const [selectedYearId, setSelectedYearId] = useState<string>(activeYear?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(classesList[0]?.id || 'ALL');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjectsList[0]?.id || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Mode: 'list' | 'batch_input'
  const [mode, setMode] = useState<'list' | 'batch_input'>('list');

  // Single Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GradeRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields (Single)
  const [formStudentId, setFormStudentId] = useState(studentsList[0]?.id || '');
  const [formYearId, setFormYearId] = useState(activeYear?.id || '');
  const [formClassId, setFormClassId] = useState(classesList[0]?.id || '');
  const [formSubjectId, setFormSubjectId] = useState(subjectsList[0]?.id || '');
  const [formTeacherId, setFormTeacherId] = useState(teachersList[0]?.id || '');
  const [formSemester, setFormSemester] = useState<SemesterType>('Ganjil');
  const [formAttendanceScore, setFormAttendanceScore] = useState<number>(90);
  const [formAssignmentScore, setFormAssignmentScore] = useState<number>(85);
  const [formUtsScore, setFormUtsScore] = useState<number>(80);
  const [formUasScore, setFormUasScore] = useState<number>(85);
  const [formNotes, setFormNotes] = useState('');

  // Batch Form State: Map of studentId -> BatchRow
  const [batchRows, setBatchRows] = useState<Record<string, BatchRow>>({});

  // Active Class Students
  const classStudents = useMemo(() => {
    const targetClass = selectedClassId !== 'ALL' ? selectedClassId : (classesList[0]?.id || '');
    return (studentsList || []).filter(s => s.classId === targetClass && s.status === 'Aktif');
  }, [studentsList, selectedClassId, classesList]);

  // Initialize Batch State when entering batch mode or changing class/subject
  const initBatchMode = () => {
    const targetClass = selectedClassId !== 'ALL' ? selectedClassId : (classesList[0]?.id || '');
    const targetSubject = selectedSubjectId !== 'ALL' ? selectedSubjectId : (subjectsList[0]?.id || '');
    const targetYear = selectedYearId || activeYear?.id || '';

    const newBatch: Record<string, BatchRow> = {};
    const students = (studentsList || []).filter(s => s.classId === targetClass && s.status === 'Aktif');

    // Calculate attendance percentages from attendance records for auto-fill suggestion
    const attRecap = calculateStudentAttendanceSummary(students, attendanceList, targetSubject);

    students.forEach(s => {
      const existing = (gradesList || []).find(g => 
        g.studentId === s.id && 
        g.subjectId === targetSubject && 
        g.academicYearId === targetYear
      );

      const recap = attRecap.find(r => r.studentId === s.id);
      const defaultAttScore = recap ? recap.percentage : 90;

      if (existing) {
        newBatch[s.id] = {
          attendanceScore: existing.attendanceScore,
          assignmentScore: existing.assignmentScore,
          utsScore: existing.utsScore,
          uasScore: existing.uasScore,
          notes: existing.notes || '',
          existingId: existing.id
        };
      } else {
        newBatch[s.id] = {
          attendanceScore: defaultAttScore,
          assignmentScore: 80,
          utsScore: 80,
          uasScore: 80,
          notes: ''
        };
      }
    });

    setBatchRows(newBatch);
    setMode('batch_input');
  };

  const handleBatchRowChange = (studentId: string, field: keyof BatchRow, value: any) => {
    setBatchRows(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveBatch = async () => {
    const targetClass = selectedClassId !== 'ALL' ? selectedClassId : (classesList[0]?.id || '');
    const targetSubject = selectedSubjectId !== 'ALL' ? selectedSubjectId : (subjectsList[0]?.id || '');
    const targetYear = selectedYearId || activeYear?.id || '';
    const activeYearObj = academicYearsList.find(a => a.id === targetYear);
    const teacherId = teachersList[0]?.id || '';

    if (!targetClass || !targetSubject || !targetYear) {
      error('Mohon pilih kelas, mata pelajaran, dan tahun ajaran yang valid.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = (Object.entries(batchRows) as [string, BatchRow][]).map(([studentId, data]) => ({
        id: data.existingId,
        studentId,
        subjectId: targetSubject,
        teacherId,
        classId: targetClass,
        academicYearId: targetYear,
        semester: (activeYearObj?.semester || 'Ganjil') as SemesterType,
        attendanceScore: Number(data.attendanceScore) || 0,
        assignmentScore: Number(data.assignmentScore) || 0,
        utsScore: Number(data.utsScore) || 0,
        uasScore: Number(data.uasScore) || 0,
        finalScore: 0, // will be auto calculated
        letterGrade: 'A' as const,
        predicate: '',
        notes: data.notes || ''
      }));

      await saveGradesBatch(payload, currentWeights);
      success(`Berhasil menyimpan nilai untuk ${payload.length} siswa secara serentak.`);
      setMode('list');
      await onRefresh();
    } catch (err: any) {
      error(err.message || 'Gagal menyimpan batch nilai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Single Modal Handlers
  const openSingleCreateModal = () => {
    setEditingGrade(null);
    setFormYearId(selectedYearId || activeYear?.id || '');
    const targetClass = selectedClassId !== 'ALL' ? selectedClassId : (classesList[0]?.id || '');
    setFormClassId(targetClass);
    const classStds = (studentsList || []).filter(s => s.classId === targetClass);
    setFormStudentId(classStds[0]?.id || (studentsList[0]?.id || ''));
    setFormSubjectId(selectedSubjectId !== 'ALL' ? selectedSubjectId : (subjectsList[0]?.id || ''));
    setFormTeacherId(teachersList[0]?.id || '');
    setFormSemester('Ganjil');
    setFormAttendanceScore(90);
    setFormAssignmentScore(85);
    setFormUtsScore(80);
    setFormUasScore(85);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openSingleEditModal = (grade: GradeRecord) => {
    setEditingGrade(grade);
    setFormStudentId(grade.studentId);
    setFormYearId(grade.academicYearId);
    setFormClassId(grade.classId);
    setFormSubjectId(grade.subjectId);
    setFormTeacherId(grade.teacherId);
    setFormSemester(grade.semester);
    setFormAttendanceScore(grade.attendanceScore);
    setFormAssignmentScore(grade.assignmentScore);
    setFormUtsScore(grade.utsScore);
    setFormUasScore(grade.uasScore);
    setFormNotes(grade.notes || '');
    setIsModalOpen(true);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await saveGradeRecord({
        id: editingGrade?.id,
        studentId: formStudentId,
        subjectId: formSubjectId,
        teacherId: formTeacherId,
        classId: formClassId,
        academicYearId: formYearId,
        semester: formSemester,
        attendanceScore: Number(formAttendanceScore) || 0,
        assignmentScore: Number(formAssignmentScore) || 0,
        utsScore: Number(formUtsScore) || 0,
        uasScore: Number(formUasScore) || 0,
        finalScore: 0, // Auto calculated
        letterGrade: 'A',
        predicate: '',
        notes: formNotes.trim()
      }, currentWeights);
      success('Nilai siswa berhasil disimpan.');
      setIsModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      error(err.message || 'Gagal menyimpan nilai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsSubmitting(true);
      await deleteGradeRecord(itemToDelete.id);
      success('Nilai siswa berhasil dihapus.');
      setItemToDelete(null);
      await onRefresh();
    } catch (err: any) {
      error(err.message || 'Gagal menghapus nilai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Grade Records
  const filteredGrades = useMemo(() => {
    return (gradesList || []).filter(g => {
      if (selectedYearId && g.academicYearId !== selectedYearId) return false;
      if (selectedClassId !== 'ALL' && g.classId !== selectedClassId) return false;
      if (selectedSubjectId !== 'ALL' && g.subjectId !== selectedSubjectId) return false;

      if (searchTerm) {
        const student = studentsList.find(s => s.id === g.studentId);
        const name = student?.fullName.toLowerCase() || '';
        const nis = student?.nis || '';
        const term = searchTerm.toLowerCase();
        if (!name.includes(term) && !nis.includes(term)) return false;
      }
      return true;
    });
  }, [gradesList, selectedYearId, selectedClassId, selectedSubjectId, searchTerm, studentsList]);

  const getClassName = (id: string) => classesList.find(c => c.id === id)?.name || id;
  const getTeacherName = (id: string) => teachersList.find(t => t.id === id)?.fullName || id;
  const getSubjectName = (id: string) => subjectsList.find(s => s.id === id)?.name || id;
  const getStudent = (id: string) => studentsList.find(s => s.id === id);

  // Realtime calculated preview for single modal
  const previewCalculation = calculateFinalGrade(
    Number(formAttendanceScore) || 0,
    Number(formAssignmentScore) || 0,
    Number(formUtsScore) || 0,
    Number(formUasScore) || 0,
    currentWeights
  );

  return (
    <div id="admin-grades-page" className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Nilai & Rapor Siswa
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {filteredGrades.length} Data Nilai
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penilaian akademik terstandar dengan bobot: Kehadiran {currentWeights.attendance}%, Tugas {currentWeights.assignment}%, UTS {currentWeights.uts}%, dan UAS {currentWeights.uas}%. Standar KKM: {currentKkm}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {mode === 'list' ? (
            <>
              <button
                id="btn-batch-input-grades"
                onClick={initBatchMode}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Input Nilai Serentak (Matriks)</span>
              </button>
              <button
                id="btn-add-single-grade"
                onClick={openSingleCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Input Satuan</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setMode('list')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Kembali ke Daftar Tabel
            </button>
          )}
        </div>
      </div>

      {/* Formula Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-blue-950">
                Formula Pembobotan Nilai Akhir
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                KKM: {currentKkm}
              </span>
            </div>
            <p className="text-[11px] text-blue-800 mt-0.5">
              Nilai Akhir = <span className="font-bold text-blue-900">(Kehadiran × {currentWeights.attendance}%)</span> + <span className="font-bold text-blue-900">(Tugas × {currentWeights.assignment}%)</span> + <span className="font-bold text-blue-900">(UTS × {currentWeights.uts}%)</span> + <span className="font-bold text-blue-900">(UAS × {currentWeights.uas}%)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold">
          <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800">A (85-100)</span>
          <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-800">B (75-84)</span>
          <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800">C (60-74)</span>
          <span className="px-2 py-1 rounded-md bg-orange-100 text-orange-800">D (50-59)</span>
          <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-800">E (&lt;50)</span>
        </div>
      </div>

      {/* Filter Bar */}
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
              {mode === 'list' && <option value="ALL">Semua Kelas</option>}
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
              {mode === 'list' && <option value="ALL">Semua Mata Pelajaran</option>}
              {subjectsList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Pencarian */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Cari Siswa</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nama atau NIS siswa..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODE 1: LIST TABLE */}
      {mode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3.5 px-4">Siswa</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Mata Pelajaran</th>
                  <th className="py-3.5 px-4 text-center">Kehadiran (45%)</th>
                  <th className="py-3.5 px-4 text-center">Tugas (20%)</th>
                  <th className="py-3.5 px-4 text-center">UTS (15%)</th>
                  <th className="py-3.5 px-4 text-center">UAS (20%)</th>
                  <th className="py-3.5 px-4 text-center font-black text-slate-900">Nilai Akhir</th>
                  <th className="py-3.5 px-4 text-center">Predikat</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrades.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      Belum ada data nilai untuk filter ini. Klik "Input Nilai Serentak" atau "Input Satuan".
                    </td>
                  </tr>
                ) : (
                  filteredGrades.map((g) => {
                    const student = getStudent(g.studentId);
                    return (
                      <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900">{student?.fullName || g.studentId}</p>
                            <p className="text-[10px] text-slate-500 font-mono">NIS: {student?.nis || '-'}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {getClassName(g.classId)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {getSubjectName(g.subjectId)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {g.attendanceScore}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {g.assignmentScore}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {g.utsScore}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {g.uasScore}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-sm text-blue-700">
                              {g.finalScore.toFixed(2)}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                              g.finalScore >= currentKkm 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {g.finalScore >= currentKkm ? 'Tuntas' : 'Remidi'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                              g.letterGrade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                              g.letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                              g.letterGrade === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {g.letterGrade}
                            </span>
                            <span className="text-[10px] text-slate-500 hidden sm:inline">
                              ({g.predicate})
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openSingleEditModal(g)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Nilai"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setItemToDelete(g)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Nilai"
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

      {/* MODE 2: BATCH MATRIX INPUT */}
      {mode === 'batch_input' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Input Penilaian Kelas: {getClassName(selectedClassId !== 'ALL' ? selectedClassId : classesList[0]?.id || '')}
              </h3>
              <p className="text-xs text-slate-500">
                Mata Pelajaran: <span className="font-bold text-slate-700">{getSubjectName(selectedSubjectId !== 'ALL' ? selectedSubjectId : subjectsList[0]?.id || '')}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBatch}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Semua Nilai'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3 min-w-[180px]">Nama Siswa</th>
                  <th className="py-3 px-2 w-28 text-center bg-blue-50/50">Kehadiran (45%)</th>
                  <th className="py-3 px-2 w-28 text-center bg-amber-50/50">Tugas (20%)</th>
                  <th className="py-3 px-2 w-28 text-center bg-purple-50/50">UTS (15%)</th>
                  <th className="py-3 px-2 w-28 text-center bg-emerald-50/50">UAS (20%)</th>
                  <th className="py-3 px-3 w-28 text-center font-black">Nilai Akhir</th>
                  <th className="py-3 px-3 w-24 text-center">Predikat</th>
                  <th className="py-3 px-3 min-w-[140px]">Catatan Perkembangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada siswa aktif di kelas ini.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((s, idx) => {
                    const row = batchRows[s.id] || {
                      attendanceScore: 90,
                      assignmentScore: 80,
                      utsScore: 80,
                      uasScore: 80,
                      notes: ''
                    };

                    const final = calculateFinalGrade(
                      row.attendanceScore,
                      row.assignmentScore,
                      row.utsScore,
                      row.uasScore
                    );

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{s.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</p>
                        </td>
                        {/* Attendance Score */}
                        <td className="py-2.5 px-2 bg-blue-50/30">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={row.attendanceScore}
                            onChange={(e) => handleBatchRowChange(s.id, 'attendanceScore', Number(e.target.value))}
                            className="w-full text-center py-1.5 rounded-lg border border-blue-200 bg-white font-bold text-slate-900"
                          />
                        </td>
                        {/* Assignment Score */}
                        <td className="py-2.5 px-2 bg-amber-50/30">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={row.assignmentScore}
                            onChange={(e) => handleBatchRowChange(s.id, 'assignmentScore', Number(e.target.value))}
                            className="w-full text-center py-1.5 rounded-lg border border-amber-200 bg-white font-bold text-slate-900"
                          />
                        </td>
                        {/* UTS Score */}
                        <td className="py-2.5 px-2 bg-purple-50/30">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={row.utsScore}
                            onChange={(e) => handleBatchRowChange(s.id, 'utsScore', Number(e.target.value))}
                            className="w-full text-center py-1.5 rounded-lg border border-purple-200 bg-white font-bold text-slate-900"
                          />
                        </td>
                        {/* UAS Score */}
                        <td className="py-2.5 px-2 bg-emerald-50/30">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={row.uasScore}
                            onChange={(e) => handleBatchRowChange(s.id, 'uasScore', Number(e.target.value))}
                            className="w-full text-center py-1.5 rounded-lg border border-emerald-200 bg-white font-bold text-slate-900"
                          />
                        </td>
                        {/* Final Score Output */}
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-black text-sm text-blue-700">
                            {final.finalScore.toFixed(2)}
                          </span>
                        </td>
                        {/* Letter Grade */}
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            final.letterGrade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                            final.letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                            final.letterGrade === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {final.letterGrade}
                          </span>
                        </td>
                        {/* Notes */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="Catatan..."
                            value={row.notes}
                            onChange={(e) => handleBatchRowChange(s.id, 'notes', e.target.value)}
                            className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-slate-800 text-[11px]"
                          />
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

      {/* Modal Single Input / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                {editingGrade ? 'Edit Nilai Siswa' : 'Input Nilai Siswa'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                  <select
                    value={formYearId}
                    onChange={(e) => setFormYearId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
                  >
                    {academicYearsList.map(ay => (
                      <option key={ay.id} value={ay.id}>{ay.name} ({ay.semester})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value as SemesterType)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={formClassId}
                    onChange={(e) => {
                      setFormClassId(e.target.value);
                      const classStds = studentsList.filter(s => s.classId === e.target.value);
                      if (classStds[0]) setFormStudentId(classStds[0].id);
                    }}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
                  >
                    {subjectsList.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Siswa</label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                >
                  {studentsList
                    .filter(s => !formClassId || s.classId === formClassId)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} (NIS: {s.nis})</option>
                    ))}
                </select>
              </div>

              {/* 4 Score Components */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    Kehadiran <span className="text-blue-600">(45%)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formAttendanceScore}
                    onChange={(e) => setFormAttendanceScore(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-center rounded-lg border border-slate-200 font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    Tugas/UH <span className="text-amber-600">(20%)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formAssignmentScore}
                    onChange={(e) => setFormAssignmentScore(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-center rounded-lg border border-slate-200 font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    UTS <span className="text-purple-600">(15%)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formUtsScore}
                    onChange={(e) => setFormUtsScore(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-center rounded-lg border border-slate-200 font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    UAS <span className="text-emerald-600">(20%)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formUasScore}
                    onChange={(e) => setFormUasScore(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-center rounded-lg border border-slate-200 font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Realtime Calculated Outcome Preview */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-900 block">Kalkulasi Otomatis:</span>
                  <span className="text-xs text-blue-700 font-medium">Predikat: {previewCalculation.predicate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-blue-900">
                    {previewCalculation.finalScore.toFixed(2)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                    previewCalculation.letterGrade === 'A' ? 'bg-emerald-600 text-white' :
                    previewCalculation.letterGrade === 'B' ? 'bg-blue-600 text-white' :
                    previewCalculation.letterGrade === 'C' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    Grade {previewCalculation.letterGrade}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Guru / Pembimbing</label>
                <textarea
                  rows={2}
                  placeholder="Catatan perkembangan belajar siswa..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : (editingGrade ? 'Simpan Perubahan' : 'Simpan Nilai')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Hapus Nilai Siswa"
        message={`Apakah Anda yakin ingin menghapus data nilai siswa "${itemToDelete ? getStudent(itemToDelete.studentId)?.fullName : ''}" untuk mata pelajaran "${itemToDelete ? getSubjectName(itemToDelete.subjectId) : ''}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
