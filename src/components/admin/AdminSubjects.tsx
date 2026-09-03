import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  BookOpen, 
  X, 
  Save, 
  CheckCircle2, 
  XCircle,
  Filter,
  RefreshCw,
  Layers,
  GraduationCap
} from 'lucide-react';
import { SubjectItem, SubjectGroup, SubjectStatus, MajorItem } from '../../types';
import { createSubject, updateSubject, deleteSubject } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminSubjectsProps {
  subjectsList: SubjectItem[];
  majorsList: MajorItem[];
  onRefresh: () => void;
}

export const AdminSubjects: React.FC<AdminSubjectsProps> = ({
  subjectsList = [],
  majorsList = [],
  onRefresh
}) => {
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubjectItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<SubjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    group: SubjectGroup;
    majorId: string;
    status: SubjectStatus;
  }>({
    code: '',
    name: '',
    group: 'Umum',
    majorId: '',
    status: 'Aktif'
  });

  const subjectGroups: SubjectGroup[] = ['Umum', 'Kejuruan', 'Muatan Lokal', 'Pilihan'];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      group: 'Umum',
      majorId: '',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SubjectItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      group: item.group,
      majorId: item.majorId || '',
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
    if (!formData.code.trim() || !formData.name.trim()) {
      error('Kode dan Nama Mata Pelajaran wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        group: formData.group,
        majorId: (formData.group === 'Kejuruan' || formData.group === 'Pilihan') ? formData.majorId : undefined,
        status: formData.status
      };

      if (editingItem) {
        await updateSubject(editingItem.id, payload);
        success('Mata Pelajaran berhasil diperbarui!');
      } else {
        await createSubject(payload);
        success('Mata Pelajaran baru berhasil ditambahkan!');
      }
      handleCloseModal();
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan Mata Pelajaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: SubjectItem) => {
    const nextStatus: SubjectStatus = item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    try {
      await updateSubject(item.id, { status: nextStatus });
      success(`Status ${item.name} diubah menjadi ${nextStatus}`);
      onRefresh();
    } catch (err) {
      error('Gagal mengubah status mata pelajaran.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteSubject(deleteTarget.id);
      success(`Mata Pelajaran ${deleteTarget.name} berhasil dihapus.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menghapus Mata Pelajaran.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to get major details
  const getMajorName = (majorId?: string) => {
    if (!majorId) return null;
    const m = (majorsList || []).find(item => item.id === majorId);
    return m ? `${m.code} - ${m.name}` : majorId;
  };

  // Filter & Search
  const filteredSubjects = (subjectsList || []).filter(item => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGroup = filterGroup === 'all' || item.group === filterGroup;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  const getGroupBadgeColor = (group: SubjectGroup) => {
    switch (group) {
      case 'Umum': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Kejuruan': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Muatan Lokal': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pilihan': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="admin-subjects-section" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Data Mata Pelajaran</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {subjectsList.length} Mata Pelajaran
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola kurikulum mata pelajaran umum, kejuruan, muatan lokal, dan mata pelajaran pilihan.
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
            id="btn-add-subject"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Pelajaran</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode atau nama mata pelajaran..."
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
          {/* Group Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Kelompok:</span>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-transparent border-0 font-bold text-blue-700 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">Semua Kelompok</option>
              {subjectGroups.map(g => (
                <option key={g} value={g}>{g}</option>
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

      {/* Subjects Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kode Mapel</th>
                <th className="px-6 py-4">Nama Mata Pelajaran</th>
                <th className="px-6 py-4">Kelompok Mapel</th>
                <th className="px-6 py-4">Program Keahlian</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">Tidak ada mata pelajaran ditemukan</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Sesuaikan kata kunci pencarian atau buat mata pelajaran baru.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">ID: {item.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getGroupBadgeColor(item.group)}`}>
                        {item.group}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.majorId ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                          <span className="truncate max-w-[200px]">{getMajorName(item.majorId)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Semua Jurusan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        title="Klik untuk mengubah status"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                          item.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {item.status === 'Aktif' ? (
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
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit Mata Pelajaran"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Hapus Mata Pelajaran"
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
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
                    Kode Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MP-TJKT-01"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm uppercase rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelompok Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value as SubjectGroup }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white font-semibold"
                  >
                    {subjectGroups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Administrasi Infrastruktur Jaringan"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {(formData.group === 'Kejuruan' || formData.group === 'Pilihan') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Program Keahlian Terkait
                  </label>
                  <select
                    value={formData.majorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, majorId: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                  >
                    <option value="">-- Pilih Program Keahlian --</option>
                    {majorsList.filter(m => m.status === 'Aktif').map(m => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400">Mapel kejuruan akan dikhususkan bagi siswa jurusan ini</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SubjectStatus }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="Aktif">Aktif (Diajarkan)</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Mapel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Mata Pelajaran"
        message={`Apakah Anda yakin ingin menghapus mata pelajaran "${deleteTarget?.name}" (${deleteTarget?.code})?`}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
