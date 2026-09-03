import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Building, 
  X, 
  Save, 
  CheckCircle2, 
  XCircle,
  Filter,
  RefreshCw,
  GraduationCap,
  UserCheck,
  Users,
  Calendar
} from 'lucide-react';
import { ClassItem, ClassGrade, ClassStatus, MajorItem, TeacherItem, StudentItem } from '../../types';
import { createClass, updateClass, deleteClass } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminClassesProps {
  classesList: ClassItem[];
  majorsList: MajorItem[];
  teachersList: TeacherItem[];
  studentsList: StudentItem[];
  onRefresh: () => void;
}

export const AdminClasses: React.FC<AdminClassesProps> = ({
  classesList = [],
  majorsList = [],
  teachersList = [],
  studentsList = [],
  onRefresh
}) => {
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterMajor, setFilterMajor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    grade: ClassGrade;
    majorId: string;
    homeroomTeacherId: string;
    academicYear: string;
    status: ClassStatus;
  }>({
    name: '',
    grade: 'X',
    majorId: '',
    homeroomTeacherId: '',
    academicYear: '2024/2025',
    status: 'Aktif'
  });

  const classGrades: ClassGrade[] = ['X', 'XI', 'XII'];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      grade: 'X',
      majorId: majorsList[0]?.id || '',
      homeroomTeacherId: '',
      academicYear: '2024/2025',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ClassItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      grade: item.grade,
      majorId: item.majorId,
      homeroomTeacherId: item.homeroomTeacherId || '',
      academicYear: item.academicYear,
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.majorId) {
      error('Nama Kelas dan Program Keahlian wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        grade: formData.grade,
        majorId: formData.majorId,
        homeroomTeacherId: formData.homeroomTeacherId || undefined,
        academicYear: formData.academicYear.trim() || '2024/2025',
        status: formData.status
      };

      if (editingItem) {
        await updateClass(editingItem.id, payload);
        success('Data Kelas berhasil diperbarui!');
      } else {
        await createClass(payload);
        success('Kelas baru berhasil ditambahkan!');
      }
      handleCloseModal();
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan Data Kelas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: ClassItem) => {
    const nextStatus: ClassStatus = item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    try {
      await updateClass(item.id, { status: nextStatus });
      success(`Status kelas ${item.name} diubah menjadi ${nextStatus}`);
      onRefresh();
    } catch (err) {
      error('Gagal mengubah status kelas.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteClass(deleteTarget.id);
      success(`Kelas ${deleteTarget.name} berhasil dihapus.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menghapus Kelas.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper resolvers
  const getMajor = (majorId: string) => {
    return (majorsList || []).find(m => m.id === majorId);
  };

  const getTeacher = (teacherId?: string) => {
    if (!teacherId) return null;
    return (teachersList || []).find(t => t.id === teacherId);
  };

  const getStudentCount = (classId: string) => {
    return (studentsList || []).filter(s => s.classId === classId && s.status === 'Aktif').length;
  };

  // Filter & Search
  const filteredClasses = (classesList || []).filter(item => {
    const major = getMajor(item.majorId);
    const teacher = getTeacher(item.homeroomTeacherId);

    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.academicYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (major && (major.name.toLowerCase().includes(searchQuery.toLowerCase()) || major.code.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (teacher && teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGrade = filterGrade === 'all' || item.grade === filterGrade;
    const matchesMajor = filterMajor === 'all' || item.majorId === filterMajor;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesGrade && matchesMajor && matchesStatus;
  });

  return (
    <div id="admin-classes-section" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Data Rombongan Belajar (Kelas)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {classesList.length} Rombel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data kelas tingkat X, XI, XII, alokasi program keahlian, dan penugasan wali kelas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-add-class"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kelas, wali kelas, atau tahun ajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Grade Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <span>Tingkat:</span>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="bg-transparent border-0 font-bold text-blue-700 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">Semua</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
          </div>

          {/* Major Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <span>Jurusan:</span>
            <select
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="bg-transparent border-0 font-bold text-blue-700 focus:outline-hidden text-xs cursor-pointer max-w-[140px] truncate"
            >
              <option value="all">Semua Jurusan</option>
              {majorsList.map(m => (
                <option key={m.id} value={m.id}>{m.code}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border-0 font-bold text-blue-700 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Rombel / Kelas</th>
                <th className="px-6 py-4">Tingkat</th>
                <th className="px-6 py-4">Program Keahlian</th>
                <th className="px-6 py-4">Wali Kelas</th>
                <th className="px-6 py-4 text-center">Tahun Ajaran</th>
                <th className="px-6 py-4 text-center">Siswa Aktif</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <Building className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">Tidak ada data kelas ditemukan</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Coba sesuaikan filter atau tambahkan kelas baru.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => {
                  const major = getMajor(cls.majorId);
                  const teacher = getTeacher(cls.homeroomTeacherId);
                  const studentCount = getStudentCount(cls.id);

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          {cls.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">ID: {cls.id}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-900 text-white font-mono">
                          {cls.grade}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {major ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>{major.code} - {major.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Tidak terikat</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {teacher ? (
                          <div className="flex items-center gap-2 text-xs text-slate-800">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                              <img src={teacher.photoUrl} alt={teacher.fullName} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-semibold">{teacher.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum ditentukan</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap font-mono text-xs text-slate-700">
                        {cls.academicYear}
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Users className="w-3 h-3 text-blue-600" />
                          {studentCount} Siswa
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cls)}
                          title="Klik untuk mengubah status"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                            cls.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cls.status === 'Aktif' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(cls)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit Kelas"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cls)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Hapus Kelas"
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Edit Rombel Kelas' : 'Tambah Kelas Baru'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkat Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value as ClassGrade }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white font-bold"
                  >
                    {classGrades.map(g => (
                      <option key={g} value={g}>Kelas {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Program Keahlian <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.majorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, majorId: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white font-semibold"
                  >
                    <option value="">-- Pilih Jurusan --</option>
                    {majorsList.filter(m => m.status === 'Aktif').map(m => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: X TJKT 1, XI RPL 2, XII DKV"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Wali Kelas
                </label>
                <select
                  value={formData.homeroomTeacherId}
                  onChange={(e) => setFormData(prev => ({ ...prev, homeroomTeacherId: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="">-- Belum Ada Wali Kelas --</option>
                  {teachersList.filter(t => t.status === 'Aktif').map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} (NIP: {t.nip})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Ajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2024/2025"
                    value={formData.academicYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Kelas
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ClassStatus }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                  >
                    <option value="Aktif">Aktif (Berjalan)</option>
                    <option value="Nonaktif">Nonaktif (Arsip)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Kelas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Rombongan Belajar"
        message={`Apakah Anda yakin ingin menghapus kelas "${deleteTarget?.name}"? Siswa di kelas ini mungkin perlu dialokasikan ulang.`}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
