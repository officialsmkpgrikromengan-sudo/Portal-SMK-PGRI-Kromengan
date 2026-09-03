import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Building, 
  UserCheck, 
  BookOpen, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Grid3X3, 
  List,
  MapPin
} from 'lucide-react';
import { 
  ScheduleItem, 
  AcademicYearItem, 
  ClassItem, 
  TeacherItem, 
  SubjectItem, 
  DayOfWeek 
} from '../../types';
import { 
  createSchedule, 
  updateSchedule, 
  deleteSchedule, 
  checkScheduleConflict 
} from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminSchedulesProps {
  schedulesList: ScheduleItem[];
  academicYearsList: AcademicYearItem[];
  classesList: ClassItem[];
  teachersList: TeacherItem[];
  subjectsList: SubjectItem[];
  onRefresh: () => Promise<void>;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const AdminSchedules: React.FC<AdminSchedulesProps> = ({
  schedulesList = [],
  academicYearsList = [],
  classesList = [],
  teachersList = [],
  subjectsList = [],
  onRefresh
}) => {
  const { success, error } = useToast();

  const activeYear = useMemo(() => 
    academicYearsList.find(ay => ay.isActive) || academicYearsList[0],
    [academicYearsList]
  );

  // Filters State
  const [selectedYearId, setSelectedYearId] = useState<string>(activeYear?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'day_columns' | 'table'>('day_columns');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ScheduleItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formYearId, setFormYearId] = useState(activeYear?.id || '');
  const [formClassId, setFormClassId] = useState(classesList[0]?.id || '');
  const [formSubjectId, setFormSubjectId] = useState(subjectsList[0]?.id || '');
  const [formTeacherId, setFormTeacherId] = useState(teachersList[0]?.id || '');
  const [formDay, setFormDay] = useState<DayOfWeek>('Senin');
  const [formStartTime, setFormStartTime] = useState('07:00');
  const [formEndTime, setFormEndTime] = useState('08:30');
  const [formRoom, setFormRoom] = useState('');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  // Conflict state on form
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormYearId(selectedYearId || activeYear?.id || academicYearsList[0]?.id || '');
    setFormClassId(selectedClassId !== 'ALL' ? selectedClassId : (classesList[0]?.id || ''));
    setFormTeacherId(selectedTeacherId !== 'ALL' ? selectedTeacherId : (teachersList[0]?.id || ''));
    setFormSubjectId(subjectsList[0]?.id || '');
    setFormDay(selectedDay !== 'ALL' ? (selectedDay as DayOfWeek) : 'Senin');
    setFormStartTime('07:00');
    setFormEndTime('08:30');
    setFormRoom('Ruang Teori 101');
    setFormStatus('Aktif');
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormYearId(item.academicYearId);
    setFormClassId(item.classId);
    setFormSubjectId(item.subjectId);
    setFormTeacherId(item.teacherId);
    setFormDay(item.day);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormRoom(item.room || '');
    setFormStatus(item.status);
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  // Check conflict on field change
  const validateCurrentForm = () => {
    const candidate: Omit<ScheduleItem, 'id'> = {
      academicYearId: formYearId,
      classId: formClassId,
      subjectId: formSubjectId,
      teacherId: formTeacherId,
      day: formDay,
      startTime: formStartTime,
      endTime: formEndTime,
      room: formRoom,
      status: formStatus,
      createdAt: ''
    };

    const conflict = checkScheduleConflict(candidate, schedulesList, editingItem?.id);
    if (conflict.hasConflict) {
      setConflictWarning(conflict.conflictMessage || 'Jadwal bertabrakan dengan jadwal lain.');
      return false;
    } else {
      setConflictWarning(null);
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formYearId || !formClassId || !formSubjectId || !formTeacherId) {
      error('Mohon lengkapi seluruh data Tahun Ajaran, Kelas, Mata Pelajaran, dan Guru.');
      return;
    }

    const isValid = validateCurrentForm();
    if (!isValid) {
      error(conflictWarning || 'Jadwal mengalami bentrok waktu.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateSchedule(editingItem.id, {
          academicYearId: formYearId,
          classId: formClassId,
          subjectId: formSubjectId,
          teacherId: formTeacherId,
          day: formDay,
          startTime: formStartTime,
          endTime: formEndTime,
          room: formRoom.trim(),
          status: formStatus
        });
        success('Jadwal pelajaran berhasil diperbarui.');
      } else {
        await createSchedule({
          academicYearId: formYearId,
          classId: formClassId,
          subjectId: formSubjectId,
          teacherId: formTeacherId,
          day: formDay,
          startTime: formStartTime,
          endTime: formEndTime,
          room: formRoom.trim(),
          status: formStatus,
          createdAt: new Date().toISOString()
        });
        success('Jadwal pelajaran baru berhasil dibuat.');
      }
      setIsModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      error(err.message || 'Gagal menyimpan jadwal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsSubmitting(true);
      await deleteSchedule(itemToDelete.id);
      success('Jadwal pelajaran berhasil dihapus.');
      setItemToDelete(null);
      await onRefresh();
    } catch (err: any) {
      error(err.message || 'Gagal menghapus jadwal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered List
  const filteredSchedules = useMemo(() => {
    return (schedulesList || []).filter(item => {
      // Academic year filter
      if (selectedYearId && item.academicYearId !== selectedYearId) return false;
      // Class filter
      if (selectedClassId !== 'ALL' && item.classId !== selectedClassId) return false;
      // Teacher filter
      if (selectedTeacherId !== 'ALL' && item.teacherId !== selectedTeacherId) return false;
      // Day filter
      if (selectedDay !== 'ALL' && item.day !== selectedDay) return false;

      // Text search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const className = classesList.find(c => c.id === item.classId)?.name.toLowerCase() || '';
        const teacherName = teachersList.find(t => t.id === item.teacherId)?.fullName.toLowerCase() || '';
        const subjectName = subjectsList.find(s => s.id === item.subjectId)?.name.toLowerCase() || '';
        const roomName = (item.room || '').toLowerCase();
        if (!className.includes(term) && !teacherName.includes(term) && !subjectName.includes(term) && !roomName.includes(term)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const dayOrder = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [schedulesList, selectedYearId, selectedClassId, selectedTeacherId, selectedDay, searchTerm, classesList, teachersList, subjectsList]);

  const getClassName = (id: string) => classesList.find(c => c.id === id)?.name || id;
  const getTeacherName = (id: string) => teachersList.find(t => t.id === id)?.fullName || id;
  const getSubjectName = (id: string) => subjectsList.find(s => s.id === id)?.name || id;
  const getYearName = (id: string) => {
    const y = academicYearsList.find(a => a.id === id);
    return y ? `${y.name} (${y.semester})` : id;
  };

  return (
    <div id="admin-schedules-page" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Jadwal Pelajaran
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {filteredSchedules.length} Sesi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Atur plotting jam pelajaran, alokasi guru pengampu, ruang kelas, dan validasi bentrok jadwal real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('day_columns')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'day_columns' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Per Hari</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>

          <button
            id="btn-create-schedule"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Filter Tahun Ajaran */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran</label>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800"
            >
              {academicYearsList.map(ay => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} - Sem. {ay.semester} {ay.isActive ? '★ (Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kelas</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="ALL">Semua Kelas</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Guru */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Guru Pengampu</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="ALL">Semua Guru</option>
              {teachersList.map(t => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </div>

          {/* Filter Hari */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Hari</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="ALL">Semua Hari (Senin - Sabtu)</option>
              {DAYS_OF_WEEK.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pencarian Cepat</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari mapel / ruang..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* VIEW: DAY COLUMNS / GRID */}
      {viewMode === 'day_columns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DAYS_OF_WEEK.filter(d => selectedDay === 'ALL' || selectedDay === d).map(day => {
            const daySchedules = filteredSchedules.filter(s => s.day === day);
            return (
              <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                {/* Column Header */}
                <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-sm tracking-wide">{day}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-blue-300">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                {/* Schedule Items in Day */}
                <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                  {daySchedules.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      Tidak ada jadwal di hari {day}.
                    </div>
                  ) : (
                    daySchedules.map((sch) => (
                      <div 
                        key={sch.id}
                        id={`sch-card-${sch.id}`}
                        className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 transition-all space-y-2 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white">
                            <Clock className="w-3 h-3" />
                            {sch.startTime} - {sch.endTime}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800">
                            {getClassName(sch.classId)}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                            {getSubjectName(sch.subjectId)}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{getTeacherName(sch.teacherId)}</span>
                          </div>
                          {sch.room && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{sch.room}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons on card hover */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(sch)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                            title="Edit Jadwal"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(sch)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3.5 px-4">Hari & Jam</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Mata Pelajaran</th>
                  <th className="py-3.5 px-4">Guru Pengampu</th>
                  <th className="py-3.5 px-4">Ruang</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada jadwal yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-slate-900 text-white">
                            {item.day}
                          </span>
                          <span className="text-blue-700 font-bold">{item.startTime} - {item.endTime}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {getClassName(item.classId)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-medium">
                        {getSubjectName(item.subjectId)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {getTeacherName(item.teacherId)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.room || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                {editingItem ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Conflict Alert if any */}
              {conflictWarning && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs">Peringatan Bentrok Waktu:</p>
                    <p className="text-[11px] leading-relaxed">{conflictWarning}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Tahun Ajaran */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tahun Ajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formYearId}
                    onChange={(e) => {
                      setFormYearId(e.target.value);
                      setTimeout(validateCurrentForm, 50);
                    }}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900"
                  >
                    {academicYearsList.map(ay => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name} ({ay.semester}) {ay.isActive ? '★ Aktif' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hari */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hari <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => {
                      setFormDay(e.target.value as DayOfWeek);
                      setTimeout(validateCurrentForm, 50);
                    }}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Kelas */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => {
                      setFormClassId(e.target.value);
                      setTimeout(validateCurrentForm, 50);
                    }}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900"
                  >
                    {classesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Mata Pelajaran */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => {
                      setFormSubjectId(e.target.value);
                      setTimeout(validateCurrentForm, 50);
                    }}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900"
                  >
                    {subjectsList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guru Pengampu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Guru Pengampu <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formTeacherId}
                  onChange={(e) => {
                    setFormTeacherId(e.target.value);
                    setTimeout(validateCurrentForm, 50);
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900"
                >
                  {teachersList.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} (NIP: {t.nip})</option>
                  ))}
                </select>
              </div>

              {/* Jam Mulai & Selesai & Ruangan */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => {
                      setFormStartTime(e.target.value);
                      setTimeout(validateCurrentForm, 50);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => {
                      setFormEndTime(e.target.value);
                      setTimeout(validateCurrentForm, 50);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ruangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Lab RPL 1"
                    value={formRoom}
                    onChange={(e) => {
                      setFormRoom(e.target.value);
                      setTimeout(validateCurrentForm, 50);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4 pt-1">
                <span className="font-bold text-slate-700">Status:</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Aktif"
                    checked={formStatus === 'Aktif'}
                    onChange={() => setFormStatus('Aktif')}
                    className="text-blue-600"
                  />
                  <span className="font-semibold text-slate-800">Aktif</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Nonaktif"
                    checked={formStatus === 'Nonaktif'}
                    onChange={() => setFormStatus('Nonaktif')}
                    className="text-slate-600"
                  />
                  <span className="font-semibold text-slate-800">Nonaktif</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
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
                  {isSubmitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Jadwal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Hapus Jadwal Pelajaran"
        message={`Apakah Anda yakin ingin menghapus jadwal mata pelajaran "${itemToDelete ? getSubjectName(itemToDelete.subjectId) : ''}" pada hari ${itemToDelete?.day}?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
