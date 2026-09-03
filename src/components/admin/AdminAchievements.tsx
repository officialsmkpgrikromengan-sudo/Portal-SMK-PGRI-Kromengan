import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Award, 
  Trophy, 
  User, 
  Calendar, 
  X, 
  Save 
} from 'lucide-react';
import { AchievementItem, AchievementLevel } from '../../types';
import { createAchievement, updateAchievement, deleteAchievement } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminAchievementsProps {
  achievementsList: AchievementItem[];
  onRefresh: () => void;
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
}

export const AdminAchievements: React.FC<AdminAchievementsProps> = ({
  achievementsList,
  onRefresh,
  isCreateModalOpen = false,
  onCloseCreateModal
}) => {
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(isCreateModalOpen);
  const [editingItem, setEditingItem] = useState<AchievementItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<AchievementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    studentName: '',
    level: 'Nasional' as AchievementLevel,
    rank: 'Juara 1 (Medali Emas)',
    year: new Date().getFullYear().toString(),
    category: 'Vokasi & Kejuruan',
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
    description: ''
  });

  const levels: AchievementLevel[] = ['Internasional', 'Nasional', 'Provinsi', 'Kota/Kabupaten', 'Kecamatan', 'Sekolah'];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      studentName: '',
      level: 'Nasional',
      rank: 'Juara 1 (Medali Emas)',
      year: new Date().getFullYear().toString(),
      category: 'Vokasi & Kejuruan',
      imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AchievementItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      studentName: item.studentName,
      level: item.level,
      rank: item.rank,
      year: item.year,
      category: item.category || 'Vokasi & Kejuruan',
      imageUrl: item.imageUrl || '',
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    if (onCloseCreateModal) onCloseCreateModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.studentName.trim() || !formData.rank.trim()) {
      error('Nama kejuaraan, nama siswa/tim, dan peringkat wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateAchievement(editingItem.id, formData);
        success('Data prestasi berhasil diperbarui!');
      } else {
        await createAchievement({
          ...formData,
          createdAt: new Date().toISOString()
        });
        success('Prestasi baru berhasil ditambahkan!');
      }

      handleCloseModal();
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan data prestasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteAchievement(deleteTarget.id);
      success(`Prestasi "${deleteTarget.title}" berhasil dihapus.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menghapus prestasi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = achievementsList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rank.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || item.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div id="admin-achievements-view" className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kelola Prestasi Sekolah & Siswa</h2>
          <p className="text-xs text-slate-500">Catat dan tampilkan jejak keberhasilan siswa dalam kompetisi kejuruan, sains, seni, dan olahraga.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Prestasi Baru</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari lomba atau nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400">Tingkat:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
          >
            <option value="all">Semua Tingkat ({achievementsList.length})</option>
            {levels.map(lvl => (
              <option key={lvl} value={lvl}>Tingkat {lvl}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Achievements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-4">Foto & Kejuaraan</th>
                <th className="p-4">Siswa / Tim</th>
                <th className="p-4">Peringkat & Tingkat</th>
                <th className="p-4">Tahun</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tidak ada data prestasi yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-500 bg-amber-50">
                              <Trophy className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-800 font-semibold">{item.studentName}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 inline-block">
                          {item.rank}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Tingkat {item.level}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-bold">{item.year}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Prestasi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Prestasi"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Data Prestasi' : 'Tambah Prestasi Baru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nama Kejuaraan / Kompetisi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lomba Kompetensi Siswa (LKS) SMK Bidang Web Technologies"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nama Siswa / Tim Peraih Prestasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Farhan & Tim Robotik"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Rank, Level, Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Peringkat / Juara</label>
                  <input
                    type="text"
                    required
                    placeholder="Juara 1 / Medali Emas"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Tingkat Lomba</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as AchievementLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Tahun Perolehan</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <ImageUploadInput
                label="Foto / Dokumentasi Penyerahan Piala (Opsional)"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                presetImages={[
                  { label: 'Piala & Medali', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80' },
                  { label: 'Sertifikat & Tim', url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80' }
                ]}
              />

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Keterangan Tambahan (Opsional)</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan singkat mengenai penyelenggara atau apresiasi yang diraih..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Prestasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Data Prestasi"
        message={`Apakah Anda yakin ingin menghapus catatan prestasi "${deleteTarget?.title}"?`}
        confirmLabel="Ya, Hapus"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
