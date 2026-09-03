import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  X, 
  Save, 
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { NewsItem, ContentStatus } from '../../types';
import { createNews, updateNews, deleteNews } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminNewsProps {
  newsList: NewsItem[];
  onRefresh: () => void;
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
}

export const AdminNews: React.FC<AdminNewsProps> = ({
  newsList,
  onRefresh,
  isCreateModalOpen = false,
  onCloseCreateModal
}) => {
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(isCreateModalOpen);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    category: 'Kegiatan Sekolah',
    excerpt: '',
    content: '',
    author: 'Tim Humas & Publikasi',
    publishedAt: new Date().toISOString().split('T')[0],
    status: 'published' as ContentStatus,
    thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
  });

  const categories = [
    'Kegiatan Sekolah',
    'Prestasi',
    'Kerjasama DUDI',
    'Akademik',
    'Pengumuman',
    'Ekstrakurikuler'
  ];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Kegiatan Sekolah',
      excerpt: '',
      content: '',
      author: 'Tim Humas & Publikasi',
      publishedAt: new Date().toISOString().split('T')[0],
      status: 'published',
      thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category || 'Kegiatan Sekolah',
      excerpt: item.excerpt || '',
      content: item.content,
      author: item.author,
      publishedAt: item.publishedAt || new Date().toISOString().split('T')[0],
      status: item.status,
      thumbnailUrl: item.thumbnailUrl
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
    if (!formData.title.trim() || !formData.content.trim()) {
      error('Judul dan isi berita wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      if (editingItem) {
        await updateNews(editingItem.id, {
          ...formData,
          slug,
          excerpt: formData.excerpt || formData.content.slice(0, 160) + '...'
        });
        success('Berita berhasil diperbarui!');
      } else {
        await createNews({
          ...formData,
          slug,
          excerpt: formData.excerpt || formData.content.slice(0, 160) + '...',
          views: 0,
          createdAt: new Date().toISOString()
        });
        success('Berita baru berhasil diterbitkan!');
      }

      handleCloseModal();
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan berita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteNews(deleteTarget.id);
      success(`Berita "${deleteTarget.title}" berhasil dihapus.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menghapus berita.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = newsList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="admin-news-view" className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kelola Berita & Pengumuman</h2>
          <p className="text-xs text-slate-500">Buat, sunting, arsipkan, dan publikasikan artikel ke website resmi sekolah.</p>
        </div>

        <button
          id="btn-admin-add-news"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Berita Baru</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul atau penulis berita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
          >
            <option value="all">Semua Status ({newsList.length})</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-4">Thumbnail & Judul</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Penulis</th>
                <th className="p-4">Tanggal Publikasi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada berita yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={item.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                        </div>
                        <span className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{item.author}</td>
                    <td className="p-4 text-slate-600">{item.publishedAt}</td>
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
                          id={`btn-edit-news-${item.id}`}
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Berita"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-news-${item.id}`}
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Berita"
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
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Berita Sekolah' : 'Buat Berita Baru'}
                </h3>
                <span className="text-xs text-slate-500">Isi formulir berita untuk ditayangkan di portal publik.</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Judul Berita <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siswa Raih Prestasi Gemilang di Ajang Nasional..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Grid 3 cols: Category, Author, Published Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Penulis</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Tanggal Publikasi</label>
                  <input
                    type="date"
                    required
                    value={formData.publishedAt}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Status Switch (Published vs Draft) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Status Publikasi</label>
                <div className="flex gap-3">
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    formData.status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-200'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={() => setFormData({ ...formData, status: 'published' })}
                      className="hidden"
                    />
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Published (Tampil di Website)</span>
                  </label>

                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    formData.status === 'draft'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-200'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={() => setFormData({ ...formData, status: 'draft' })}
                      className="hidden"
                    />
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Draft (Simpan Sementara)</span>
                  </label>
                </div>
              </div>

              {/* Thumbnail Image Input (Upload / URL Preview) */}
              <ImageUploadInput
                label="Foto Sampul / Thumbnail Berita"
                value={formData.thumbnailUrl}
                onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                required
                presetImages={[
                  { label: 'Pendidikan / Siswa', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80' },
                  { label: 'Kerjasama Industri', url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80' },
                  { label: 'Lab & Teknologi', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80' }
                ]}
              />

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Ringkasan Berita (Opsional)</label>
                <input
                  type="text"
                  placeholder="Ringkasan singkat untuk pratinjau kartu berita..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Rich Content textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Isi Lengkap Berita <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Tuliskan isi berita secara lengkap di sini. Gunakan baris baru untuk paragraf..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-normal leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Terbitkan Berita'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Berita"
        message={`Apakah Anda yakin ingin menghapus berita "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Berita"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
