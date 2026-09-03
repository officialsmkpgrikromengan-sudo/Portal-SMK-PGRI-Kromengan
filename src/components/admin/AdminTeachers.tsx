import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  UserCheck, 
  X, 
  Save, 
  CheckCircle2, 
  XCircle,
  Filter,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  BookOpen,
  User,
  ShieldCheck,
  Award
} from 'lucide-react';
import { TeacherItem, TeacherStatus, GenderType, SubjectItem, ClassItem } from '../../types';
import { createTeacher, updateTeacher, deleteTeacher } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminTeachersProps {
  teachersList: TeacherItem[];
  subjectsList: SubjectItem[];
  classesList: ClassItem[];
  onRefresh: () => void;
}

export const AdminTeachers: React.FC<AdminTeachersProps> = ({
  teachersList = [],
  subjectsList = [],
  classesList = [],
  onRefresh
}) => {
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeacherItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal State
  const [viewDetailItem, setViewDetailItem] = useState<TeacherItem | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<TeacherItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    nip: string;
    fullName: string;
    gender: GenderType;
    email: string;
    phone: string;
    photoUrl: string;
    subjectIds: string[];
    status: TeacherStatus;
  }>({
    nip: '',
    fullName: '',
    gender: 'Laki-laki',
    email: '',
    phone: '',
    photoUrl: '',
    subjectIds: [],
    status: 'Aktif'
  });

  const teacherAvatarPresets = [
    { label: 'Pria 1', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
    { label: 'Pria 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
    { label: 'Pria 3', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80' },
    { label: 'Wanita 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
    { label: 'Wanita 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80' },
    { label: 'Wanita 3', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      nip: '',
      fullName: '',
      gender: 'Laki-laki',
      email: '',
      phone: '',
      photoUrl: '',
      subjectIds: [],
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TeacherItem) => {
    setEditingItem(item);
    setFormData({
      nip: item.nip,
      fullName: item.fullName,
      gender: item.gender,
      email: item.email || '',
      phone: item.phone || '',
      photoUrl: item.photoUrl || '',
      subjectIds: item.subjectIds || [],
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleToggleSubjectSelection = (subjectId: string) => {
    setFormData(prev => {
      const exists = prev.subjectIds.includes(subjectId);
      if (exists) {
        return { ...prev, subjectIds: prev.subjectIds.filter(id => id !== subjectId) };
      } else {
        return { ...prev, subjectIds: [...prev.subjectIds, subjectId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nip.trim() || !formData.fullName.trim()) {
      error('NIP/NUPTK dan Nama Lengkap Guru wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const fallbackPhoto = formData.gender === 'Perempuan'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80';

      const payload = {
        nip: formData.nip.trim(),
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        photoUrl: formData.photoUrl || fallbackPhoto,
        subjectIds: formData.subjectIds,
        status: formData.status
      };

      if (editingItem) {
        await updateTeacher(editingItem.id, payload);
        success('Data Guru berhasil diperbarui!');
      } else {
        await createTeacher(payload);
        success('Data Guru baru berhasil ditambahkan!');
      }
      handleCloseModal();
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan Data Guru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteTeacher(deleteTarget.id);
      success(`Data guru ${deleteTarget.fullName} berhasil dihapus.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menghapus Data Guru.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to get subjects names
  const getSubjectNames = (subjectIds: string[]) => {
    if (!subjectIds || subjectIds.length === 0) return [];
    return subjectIds
      .map(id => (subjectsList || []).find(s => s.id === id))
      .filter((s): s is SubjectItem => !!s);
  };

  // Helper to find homeroom classes
  const getHomeroomClass = (teacherId: string) => {
    return (classesList || []).find(c => c.homeroomTeacherId === teacherId);
  };

  // Filter & Search
  const filteredTeachers = teachersList.filter(item => {
    const matchesSearch = 
      item.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.phone && item.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesGender = filterGender === 'all' || item.gender === filterGender;

    return matchesSearch && matchesStatus && matchesGender;
  });

  return (
    <div id="admin-teachers-section" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Data Guru & Tenaga Pendidik</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {teachersList.length} Guru
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola identitas, NIP, kontak, mata pelajaran yang diampu, serta penugasan wali kelas.
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
            id="btn-add-teacher"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Guru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIP, nama lengkap, atau email guru..."
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
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <span>Gender:</span>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="bg-transparent border-0 font-bold text-blue-700 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">Semua</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
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
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Guru / Pendidik</th>
                <th className="px-6 py-4">NIP / NUPTK</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Mata Pelajaran Diampu</th>
                <th className="px-6 py-4">Wali Kelas</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">Tidak ada data guru ditemukan</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Coba periksa kata kunci pencarian atau tambahkan guru baru.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const taughtSubjects = getSubjectNames(teacher.subjectIds || []);
                  const homeroomClass = getHomeroomClass(teacher.id);

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Teacher Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img
                              src={teacher.photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'}
                              alt={teacher.fullName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{teacher.fullName}</div>
                            <span className="inline-block text-[11px] font-semibold text-slate-500">
                              {teacher.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NIP */}
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {teacher.nip || '-'}
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        {teacher.email && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{teacher.email}</span>
                          </div>
                        )}
                        {teacher.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{teacher.phone}</span>
                          </div>
                        )}
                        {!teacher.email && !teacher.phone && (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Subjects */}
                      <td className="px-6 py-4 max-w-xs">
                        {taughtSubjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {taughtSubjects.map((s) => (
                              <span
                                key={s.id}
                                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum ditentukan</span>
                        )}
                      </td>

                      {/* Homeroom */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {homeroomClass ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {homeroomClass.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            teacher.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {teacher.status === 'Aktif' ? (
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
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewDetailItem(teacher)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Lihat Profil Guru"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(teacher)}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                            title="Edit Data Guru"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(teacher)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Hapus Data Guru"
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
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Edit Data Guru' : 'Tambah Guru & Tenaga Pendidik'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / NUPTK <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 198502182010012015"
                    value={formData.nip}
                    onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as GenderType }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama, S.Kom., M.T."
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    placeholder="nama.guru@smkpgri-teladan.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <ImageUploadInput
                id="teacher-photo-upload"
                label="Foto Profil Guru"
                value={formData.photoUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, photoUrl: url }))}
                presetImages={teacherAvatarPresets}
                helperText="Format JPG, PNG, WEBP (Maksimal 2MB). Foto formal latar biru/merah direkomendasikan."
              />

              {/* Mata Pelajaran yang Diampu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mata Pelajaran yang Diampu
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-44 overflow-y-auto space-y-1.5">
                  {subjectsList.length === 0 ? (
                    <p className="text-xs text-slate-500">Belum ada mata pelajaran. Buat mata pelajaran terlebih dahulu.</p>
                  ) : (
                    subjectsList.map((subj) => {
                      const isSelected = formData.subjectIds.includes(subj.id);
                      return (
                        <label
                          key={subj.id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 border border-blue-200'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSubjectSelection(subj.id)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-semibold">{subj.name}</span>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {subj.code} • {subj.group}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                <span className="text-[11px] text-slate-400">Pilih satu atau beberapa mata pelajaran yang diajar</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Kepegawaian
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TeacherStatus }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="Aktif">Aktif (Mengajar)</option>
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Guru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {viewDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setViewDetailItem(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/20 shrink-0">
                  <img
                    src={viewDetailItem.photoUrl}
                    alt={viewDetailItem.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{viewDetailItem.fullName}</h3>
                  <p className="text-xs text-blue-400 font-mono mt-0.5">NIP: {viewDetailItem.nip}</p>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    viewDetailItem.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    Status: {viewDetailItem.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">Jenis Kelamin</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{viewDetailItem.gender}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Wali Kelas</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {getHomeroomClass(viewDetailItem.id)?.name || 'Tidak menjadi wali kelas'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Kontak & Komunikasi</span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{viewDetailItem.email || 'Email belum diisi'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{viewDetailItem.phone || 'Nomor telepon belum diisi'}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1.5">Mata Pelajaran yang Diampu</span>
                <div className="flex flex-wrap gap-1.5">
                  {getSubjectNames(viewDetailItem.subjectIds || []).map(s => (
                    <span key={s.id} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold">
                      {s.name} ({s.code})
                    </span>
                  ))}
                  {(viewDetailItem.subjectIds || []).length === 0 && (
                    <span className="text-slate-400 italic">Belum ada mata pelajaran yang ditugaskan</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewDetailItem(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Data Guru"
        message={`Apakah Anda yakin ingin menghapus data guru "${deleteTarget?.fullName}" (NIP: ${deleteTarget?.nip})?`}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
