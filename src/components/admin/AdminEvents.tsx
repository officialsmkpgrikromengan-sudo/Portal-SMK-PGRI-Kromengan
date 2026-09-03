import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  X, 
  Save, 
  CheckCircle2, 
  Link as LinkIcon 
} from 'lucide-react';
import { EventItem, ContentStatus } from '../../types';
import { createEvent, updateEvent, deleteEvent } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminEventsProps {
  eventsList: EventItem[];
  onRefresh: () => void;
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
}

export const AdminEvents: React.FC<AdminEventsProps> = ({
  eventsList,
  onRefresh,
  isCreateModalOpen = false,
  onCloseCreateModal
}) => {
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(isCreateModalOpen);
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Agenda Sekolah',
    date: new Date().toISOString().split('T')[0],
    time: '08:00 - 15:00 WIB',
    location: 'Aula Utama Kampus',
    description: '',
    status: 'published' as ContentStatus,
    posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    registrationLink: ''
  });

  const categories = [
    'Agenda Sekolah',
    'Seminar & Workshop',
    'Bursa Kerja (Job Fair)',
    'Kompetisi & Lomba',
    'Pentas Seni & Budaya',
    'Ujian & Sertifikasi'
  ];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Agenda Sekolah',
      date: new Date().toISOString().split('T')[0],
      time: '08:00 - 15:00 WIB',
      location: 'Aula Utama Kampus',
      description: '',
      status: 'published',
      posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      registrationLink: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EventItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category || 'Agenda Sekolah',
      date: item.date,
      time: item.time,
      location: item.location,
      description: item.description,
      status: item.status,
      posterUrl: item.posterUrl,
      registrationLink: item.registrationLink || ''
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
    if (!formData.title.trim() || !formData.date.trim() || !formData.location.trim()) {
      error('Judul, tanggal, dan lokasi event wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateEvent(editingItem.id, formData);
        success('Event berhasil diperbarui!');
      } else {
        await createEvent({
          ...formData,
          createdAt: new Date().toISOString()
        });
        success('Event baru berhasil ditambahkan!');
      }

      handleCloseModal();
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan agenda event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteEvent(deleteTarget.id);
      success(`Event "${deleteTarget.title}" berhasil dihapus.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menghapus event.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = eventsList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="admin-events-view" className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kelola Event & Agenda Sekolah</h2>
          <p className="text-xs text-slate-500">Atur kalender kegiatan resmi, seminar kejuruan, dan agenda akademik.</p>
        </div>

        <button
          id="btn-admin-add-event"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Event Baru</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul event atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
          >
            <option value="all">Semua Status ({eventsList.length})</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-4">Poster & Judul Event</th>
                <th className="p-4">Tanggal & Waktu</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tidak ada agenda event yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={item.posterUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-indigo-600 font-semibold">
                            {item.category || 'Event'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          {item.date}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1 max-w-xs truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Event"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Event"
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
                {editingItem ? 'Edit Agenda Event' : 'Tambah Agenda Event Baru'}
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
                  Nama / Judul Event <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Job Fair & Career Expo 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Category, Date, Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Kategori Event</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Waktu / Jam</label>
                  <input
                    type="text"
                    required
                    placeholder="08:00 - 15:00 WIB"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Lokasi / Tempat Acara <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gedung Serbaguna Kampus Barat"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Poster Image Input */}
              <ImageUploadInput
                label="Poster / Banner Event"
                value={formData.posterUrl}
                onChange={(url) => setFormData({ ...formData, posterUrl: url })}
                required
                presetImages={[
                  { label: 'Pameran / Expo', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80' },
                  { label: 'Seminar & Workshop', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
                  { label: 'Festival Seni Siswa', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80' }
                ]}
              />

              {/* Registration Link */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tautan Pendaftaran / Google Form (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://forms.gle/..."
                  value={formData.registrationLink}
                  onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Deskripsi Lengkap Event <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan detail susunan acara, target peserta, dan benefit yang didapatkan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'published' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      formData.status === 'published'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Published
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'draft' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      formData.status === 'draft'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Draft
                  </button>
                </div>
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Agenda Event"
        message={`Apakah Anda yakin ingin menghapus event "${deleteTarget?.title}"?`}
        confirmLabel="Ya, Hapus Event"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
