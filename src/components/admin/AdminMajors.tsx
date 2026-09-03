import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  GraduationCap, 
  X, 
  Save, 
  CheckCircle2, 
  XCircle,
  BookOpen,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import { MajorItem, MajorStatus } from '../../types';
import { createMajor, updateMajor, deleteMajor } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminMajorsProps {
  majorsList: MajorItem[];
  onRefresh: () => void;
}

export const AdminMajors: React.FC<AdminMajorsProps> = ({
  majorsList,
  onRefresh
}) => {
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MajorItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<MajorItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    shortName: string;
    description: string;
    status: MajorStatus;
  }>({
    code: '',
    name: '',
    shortName: '',
    description: '',
    status: 'Aktif'
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      shortName: '',
      description: '',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MajorItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      shortName: item.shortName || item.code,
      description: item.description || '',
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
      error('Kode dan Nama Program Keahlian wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateMajor(editingItem.id, {
          code: formData.code.toUpperCase().trim(),
          name: formData.name.trim(),
          shortName: formData.shortName.toUpperCase().trim() || formData.code.toUpperCase().trim(),
          description: formData.description.trim(),
          status: formData.status
        });
        success('Data Program Keahlian berhasil diperbarui!');
      } else {
        await createMajor({
          code: formData.code.toUpperCase().trim(),
          name: formData.name.trim(),
          shortName: formData.shortName.toUpperCase().trim() || formData.code.toUpperCase().trim(),
          description: formData.description.trim(),
          status: formData.status
        });
        success('Program Keahlian baru berhasil ditambahkan!');
      }
      handleCloseModal();
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan Program Keahlian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: MajorItem) => {
    const nextStatus: MajorStatus = item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    try {
      await updateMajor(item.id, { status: nextStatus });
      success(`Status jurusan ${item.code} diubah menjadi ${nextStatus}`);
      onRefresh();
    } catch (err) {
      error('Gagal mengubah status jurusan.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteMajor(deleteTarget.id);
      success(`Program Keahlian ${deleteTarget.name} berhasil dihapus.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menghapus Program Keahlian.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search
  const filteredMajors = majorsList.filter(item => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const activeCount = majorsList.filter(m => m.status === 'Aktif').length;
  const inactiveCount = majorsList.filter(m => m.status === 'Nonaktif').length;

  return (
    <div id="admin-majors-section" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Data Program Keahlian</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {majorsList.length} Jurusan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data master jurusan / program keahlian vokasi sebagai fondasi kelas dan mata pelajaran.
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
            id="btn-add-major"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Program Keahlian</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Program Keahlian</span>
            <div className="text-2xl font-black text-slate-900">{majorsList.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500">Jurusan Aktif</span>
            <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500">Jurusan Nonaktif</span>
            <div className="text-2xl font-black text-slate-500">{inactiveCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode atau nama program keahlian..."
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

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border-0 font-bold text-blue-700 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Majors Table List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kode & Singkatan</th>
                <th className="px-6 py-4">Nama Program Keahlian</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMajors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">Tidak ada program keahlian ditemukan</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {searchQuery || filterStatus !== 'all'
                          ? 'Coba sesuaikan kata kunci pencarian atau filter status.'
                          : 'Belum ada data program keahlian. Klik tombol Tambah untuk membuat baru.'}
                      </p>
                      <button
                        onClick={handleOpenCreate}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        + Tambah Program Keahlian
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMajors.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg tracking-wider">
                          {item.code}
                        </span>
                        {item.shortName && item.shortName !== item.code && (
                          <span className="text-xs text-slate-500">({item.shortName})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">ID: {item.id}</div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description || 'Tidak ada deskripsi singkat.'}
                      </p>
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
                          title="Edit Jurusan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Hapus Jurusan"
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
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Edit Program Keahlian' : 'Tambah Program Keahlian Baru'}
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
                    Kode Jurusan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: TJKT, RPL, DKV"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm uppercase rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <span className="text-[11px] text-slate-400">Kode unik singkatan baku</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Singkatan / Alias
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: TJKT"
                    value={formData.shortName}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm uppercase rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Program Keahlian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Teknik Jaringan Komputer dan Telekomunikasi"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Singkat Kejuruan
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan secara singkat fokus kompetensi keahlian jurusan ini..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Program Keahlian
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as MajorStatus }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="Aktif">Aktif (Dapat dipilih pada data siswa & kelas)</option>
                  <option value="Nonaktif">Nonaktif (Diarsipkan)</option>
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Jurusan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Program Keahlian"
        message={`Apakah Anda yakin ingin menghapus program keahlian "${deleteTarget?.name}" (${deleteTarget?.code})? Kelas atau siswa yang terhubung mungkin akan terdampak.`}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
