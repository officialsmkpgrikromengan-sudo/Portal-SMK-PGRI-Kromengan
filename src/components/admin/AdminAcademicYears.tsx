import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Search, 
  CalendarDays,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { AcademicYearItem, SemesterType } from '../../types';
import { 
  createAcademicYear, 
  updateAcademicYear, 
  setActiveAcademicYear, 
  deleteAcademicYear 
} from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminAcademicYearsProps {
  academicYearsList: AcademicYearItem[];
  onRefresh: () => Promise<void>;
}

export const AdminAcademicYears: React.FC<AdminAcademicYearsProps> = ({
  academicYearsList = [],
  onRefresh
}) => {
  const { success, error } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYearItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AcademicYearItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('2026/2027');
  const [semester, setSemester] = useState<SemesterType>('Ganjil');
  const [isActive, setIsActive] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingItem(null);
    setName('2026/2027');
    setSemester('Ganjil');
    setIsActive(academicYearsList.length === 0);
    setStartDate('');
    setEndDate('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: AcademicYearItem) => {
    setEditingItem(item);
    setName(item.name);
    setSemester(item.semester);
    setIsActive(item.isActive);
    setStartDate(item.startDate || '');
    setEndDate(item.endDate || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleActivate = async (item: AcademicYearItem) => {
    try {
      setIsSubmitting(true);
      await setActiveAcademicYear(item.id);
      await onRefresh();
      success(`Tahun Ajaran ${item.name} (${item.semester}) berhasil diaktifkan sebagai periode utama.`);
    } catch (err: any) {
      error(err.message || 'Gagal mengaktifkan tahun ajaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Nama tahun ajaran wajib diisi (misal: 2026/2027).');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateAcademicYear(editingItem.id, {
          name: name.trim(),
          semester,
          isActive,
          startDate,
          endDate,
          notes: notes.trim()
        });
        success('Tahun ajaran berhasil diperbarui.');
      } else {
        await createAcademicYear({
          name: name.trim(),
          semester,
          isActive,
          startDate,
          endDate,
          notes: notes.trim(),
          createdAt: new Date().toISOString()
        });
        success('Tahun ajaran baru berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      error(err.message || 'Gagal menyimpan data tahun ajaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.isActive) {
      error('Tahun ajaran yang sedang aktif tidak dapat dihapus. Aktifkan tahun ajaran lain terlebih dahulu.');
      setItemToDelete(null);
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteAcademicYear(itemToDelete.id);
      success('Tahun ajaran berhasil dihapus.');
      setItemToDelete(null);
      await onRefresh();
    } catch (err: any) {
      error(err.message || 'Gagal menghapus data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = (academicYearsList || []).filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeYear = (academicYearsList || []).find(ay => ay.isActive);

  return (
    <div id="admin-academic-years-page" className="space-y-6 animate-in fade-in duration-300">
      {/* Banner Periode Aktif */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <CalendarDays className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Periode Akademik Aktif Saat Ini</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {activeYear ? `${activeYear.name} — Semester ${activeYear.semester}` : 'Belum Ada Periode Aktif'}
            </h2>
            <p className="text-blue-100 text-xs max-w-xl">
              Semua jadwal pelajaran, absensi harian, dan penginputan nilai secara default terhubung ke periode aktif ini.
            </p>
          </div>
          <button
            id="btn-add-academic-year"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all shrink-0 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tahun Ajaran</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-academic-year"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tahun ajaran atau semester..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Periode: <span className="font-bold text-slate-800">{academicYearsList.length}</span> (Hanya 1 Aktif)
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3.5 px-4">Tahun Ajaran</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Rentang Waktu</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data tahun ajaran ditemukan.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr 
                    key={item.id} 
                    id={`ay-row-${item.id}`}
                    className={`hover:bg-slate-50/80 transition-colors ${item.isActive ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.semester === 'Ganjil' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Semester {item.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktif (Berjalan)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivate(item)}
                          disabled={isSubmitting}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors border border-slate-200"
                          title="Jadikan tahun ajaran aktif"
                        >
                          Set Aktifkan
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.startDate && item.endDate ? (
                        <span>{item.startDate} s/d {item.endDate}</span>
                      ) : (
                        <span className="text-slate-400 italic">Belum diatur</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {item.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Tahun Ajaran"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Tahun Ajaran"
                          disabled={item.isActive}
                        >
                          <Trash2 className={`w-4 h-4 ${item.isActive ? 'opacity-30 cursor-not-allowed' : ''}`} />
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

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                {editingItem ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Tahun Ajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2026/2027"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSemester('Ganjil')}
                    className={`py-2.5 rounded-xl font-bold border text-center transition-all ${
                      semester === 'Ganjil'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Semester Ganjil
                  </button>
                  <button
                    type="button"
                    onClick={() => setSemester('Genap')}
                    className={`py-2.5 rounded-xl font-bold border text-center transition-all ${
                      semester === 'Genap'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Semester Genap
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Berakhir</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan periode..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  id="chk-is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="chk-is-active" className="text-xs font-bold text-blue-900 cursor-pointer">
                  Jadikan periode ini sebagai Periode Aktif Utama
                </label>
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
                  {isSubmitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Tambah Periode')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Hapus Tahun Ajaran"
        message={`Apakah Anda yakin ingin menghapus data tahun ajaran "${itemToDelete?.name} (${itemToDelete?.semester})"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
