import React, { useState, useMemo } from 'react';
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
  Filter, 
  RefreshCw, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  User, 
  Users, 
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { StudentItem, StudentStatus, GenderType, ClassItem, MajorItem, TeacherItem } from '../../types';
import { createStudent, updateStudent, deleteStudent } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { BulkStudentImportModal } from './BulkStudentImportModal';

interface AdminStudentsProps {
  studentsList: StudentItem[];
  classesList: ClassItem[];
  majorsList: MajorItem[];
  teachersList: TeacherItem[];
  onRefresh: () => void;
}

export const AdminStudents: React.FC<AdminStudentsProps> = ({
  studentsList = [],
  classesList = [],
  majorsList = [],
  teachersList = [],
  onRefresh
}) => {
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterMajor, setFilterMajor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal State
  const [viewDetailItem, setViewDetailItem] = useState<StudentItem | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<StudentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    nis: string;
    nisn: string;
    fullName: string;
    gender: GenderType;
    birthPlace: string;
    birthDate: string;
    address: string;
    phone: string;
    email: string;
    photoUrl: string;
    classId: string;
    majorId: string;
    enrollmentYear: string;
    status: StudentStatus;
  }>({
    nis: '',
    nisn: '',
    fullName: '',
    gender: 'Laki-laki',
    birthPlace: 'Bandung',
    birthDate: '2008-01-15',
    address: '',
    phone: '',
    email: '',
    photoUrl: '',
    classId: '',
    majorId: '',
    enrollmentYear: '2024',
    status: 'Aktif'
  });

  const studentAvatarPresets = [
    { label: 'Siswa 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80' },
    { label: 'Siswa 2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
    { label: 'Siswa 3', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80' },
    { label: 'Siswi 1', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
    { label: 'Siswi 2', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' },
    { label: 'Siswi 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleOpenCreate = () => {
    setEditingItem(null);
    const initialClass = (classesList || []).find(c => c.status === 'Aktif') || (classesList || [])[0];
    setFormData({
      nis: '',
      nisn: '',
      fullName: '',
      gender: 'Laki-laki',
      birthPlace: 'Bandung',
      birthDate: '2008-01-15',
      address: '',
      phone: '',
      email: '',
      photoUrl: '',
      classId: initialClass ? initialClass.id : '',
      majorId: initialClass ? initialClass.majorId : (majorsList[0]?.id || ''),
      enrollmentYear: '2024',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StudentItem) => {
    setEditingItem(item);
    setFormData({
      nis: item.nis,
      nisn: item.nisn,
      fullName: item.fullName,
      gender: item.gender,
      birthPlace: item.birthPlace || '',
      birthDate: item.birthDate || '',
      address: item.address || '',
      phone: item.phone || '',
      email: item.email || '',
      photoUrl: item.photoUrl || '',
      classId: item.classId,
      majorId: item.majorId,
      enrollmentYear: item.enrollmentYear || '2024',
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // When class changes in form, auto-sync majorId if class has major defined
  const handleClassChange = (selectedClassId: string) => {
    const matchedClass = classesList.find(c => c.id === selectedClassId);
    setFormData(prev => ({
      ...prev,
      classId: selectedClassId,
      majorId: matchedClass?.majorId ? matchedClass.majorId : prev.majorId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nisn.trim() || !formData.fullName.trim() || !formData.classId) {
      error('NISN, Nama Lengkap, dan Kelas wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const fallbackPhoto = formData.gender === 'Perempuan'
        ? 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80';

      const cleanNisn = formData.nisn.trim();
      const cleanNis = formData.nis.trim() || cleanNisn;

      const payload = {
        nis: cleanNis,
        nisn: cleanNisn,
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        birthPlace: formData.birthPlace.trim(),
        birthDate: formData.birthDate,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${cleanNisn}@siswa.smkpgri.sch.id`,
        photoUrl: formData.photoUrl || fallbackPhoto,
        classId: formData.classId,
        majorId: formData.majorId,
        enrollmentYear: formData.enrollmentYear.trim() || '2024',
        status: formData.status
      };

      if (editingItem) {
        await updateStudent(editingItem.id, payload);
        success('Data Siswa berhasil diperbarui!');
      } else {
        await createStudent(payload);
        success('Data Siswa baru berhasil ditambahkan!');
      }
      handleCloseModal();
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan Data Siswa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteStudent(deleteTarget.id);
      success(`Data siswa ${deleteTarget.fullName} berhasil dihapus.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      error('Gagal menghapus Data Siswa.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper lookups
  const getClass = (classId: string) => (classesList || []).find(c => c.id === classId);
  const getMajor = (majorId: string) => (majorsList || []).find(m => m.id === majorId);
  const getTeacher = (teacherId?: string) => (teachersList || []).find(t => t.id === teacherId);

  // Filter & Search
  const filteredStudents = useMemo(() => {
    return (studentsList || []).filter(item => {
      const cls = getClass(item.classId);
      const major = getMajor(item.majorId);

      const matchesSearch = 
        item.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls && cls.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (major && major.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesClass = filterClass === 'all' || item.classId === filterClass;
      const matchesMajor = filterMajor === 'all' || item.majorId === filterMajor;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesGender = filterGender === 'all' || item.gender === filterGender;

      return matchesSearch && matchesClass && matchesMajor && matchesStatus && matchesGender;
    });
  }, [studentsList, searchQuery, filterClass, filterMajor, filterStatus, filterGender, classesList, majorsList]);

  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'Aktif':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aktif</span>;
      case 'Lulus':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><GraduationCap className="w-3 h-3 text-blue-600" /> Lulus</span>;
      case 'Pindah':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pindah</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600"><XCircle className="w-3 h-3 text-slate-400" /> Nonaktif</span>;
    }
  };

  return (
    <div id="admin-students-section" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Data Siswa / Peserta Didik</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {studentsList.length} Siswa Terdata
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola master data siswa, nomor induk (NIS/NISN), penempatan kelas, jurusan, serta biodata lengkap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            id="btn-import-excel-students"
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
            title="Impor Massal dengan Template Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Impor Excel (.xlsx)</span>
          </button>

          <button
            id="btn-add-student"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIS, NISN, atau Nama Siswa..."
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
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <span>Kelas:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-transparent border-0 font-bold text-blue-700 focus:outline-hidden text-xs cursor-pointer max-w-[130px] truncate"
            >
              <option value="all">Semua Kelas</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Major Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <span>Jurusan:</span>
            <select
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="bg-transparent border-0 font-bold text-blue-700 focus:outline-hidden text-xs cursor-pointer max-w-[130px] truncate"
            >
              <option value="all">Semua Jurusan</option>
              {majorsList.map(m => (
                <option key={m.id} value={m.id}>{m.code}</option>
              ))}
            </select>
          </div>

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
              <option value="Lulus">Lulus</option>
              <option value="Pindah">Pindah</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">NIS / NISN</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Program Keahlian</th>
                <th className="px-6 py-4">Angkatan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">Tidak ada data siswa ditemukan</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Sesuaikan kata kunci pencarian atau buat data siswa baru.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentClass = getClass(student.classId);
                  const studentMajor = getMajor(student.majorId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img
                              src={student.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'}
                              alt={student.fullName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{student.fullName}</div>
                            <span className="inline-block text-[11px] font-semibold text-slate-500">
                              {student.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NIS / NISN */}
                      <td className="px-6 py-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{student.nis}</div>
                        <div className="text-[11px] text-slate-400">NISN: {student.nisn}</div>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {studentClass ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {studentClass.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum ditentukan</span>
                        )}
                      </td>

                      {/* Major */}
                      <td className="px-6 py-4">
                        {studentMajor ? (
                          <div className="text-xs text-slate-800 font-semibold truncate max-w-[180px]" title={studentMajor.name}>
                            {studentMajor.code} - {studentMajor.name}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Enrollment Year */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-700">
                        {student.enrollmentYear || '-'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {getStatusBadge(student.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewDetailItem(student)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Lihat Biodata Siswa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                            title="Edit Data Siswa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(student)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Hapus Data Siswa"
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
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Edit Data Siswa' : 'Tambah Data Siswa Baru'}
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
                    NISN (Nomor Induk Siswa Nasional) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh 10 Digit: 0081234567"
                    value={formData.nisn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nisn: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold text-blue-700 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-blue-50/30"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Digunakan sebagai ID Login utama siswa.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIS (Nomor Induk Siswa Lokal)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 24250101 (Opsional)"
                    value={formData.nis}
                    onChange={(e) => setFormData(prev => ({ ...prev, nis: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Otomatis menggunakan NISN jika dikosongkan.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Rizky Ramadhan"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bandung"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas / Rombel <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white font-semibold"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classesList.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.academicYear})
                      </option>
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
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                  >
                    <option value="">-- Pilih Jurusan --</option>
                    {majorsList.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Masuk (Angkatan)
                  </label>
                  <input
                    type="text"
                    placeholder="2024"
                    value={formData.enrollmentYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, enrollmentYear: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / Telp
                  </label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Siswa
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as StudentStatus }))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Pindah">Pindah</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Tempat Tinggal
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan, Kota"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Photo Upload */}
              <ImageUploadInput
                id="student-photo-upload"
                label="Foto Siswa / Pasfoto Resmi"
                value={formData.photoUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, photoUrl: url }))}
                presetImages={studentAvatarPresets}
                helperText="Format JPG, PNG, WEBP (Maksimal 2MB)."
              />

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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Siswa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL BIODATA MODAL */}
      {viewDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
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
                  <div className="text-xs text-blue-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>NIS: {viewDetailItem.nis}</span>
                    <span>•</span>
                    <span>NISN: {viewDetailItem.nisn}</span>
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(viewDetailItem.status)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">Kelas</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {getClass(viewDetailItem.classId)?.name || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Program Keahlian</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {getMajor(viewDetailItem.majorId)?.name || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Wali Kelas</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {getTeacher(getClass(viewDetailItem.classId)?.homeroomTeacherId)?.fullName || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Tahun Angkatan</span>
                  <p className="font-semibold text-slate-800 mt-0.5 font-mono">
                    {viewDetailItem.enrollmentYear || '-'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Biodata Pribadi</span>
                <div className="space-y-1.5 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jenis Kelamin:</span>
                    <span className="font-semibold">{viewDetailItem.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tempat, Tgl Lahir:</span>
                    <span className="font-semibold">
                      {viewDetailItem.birthPlace ? `${viewDetailItem.birthPlace}, ` : ''}{viewDetailItem.birthDate || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alamat:</span>
                    <span className="font-medium text-right max-w-[220px]">{viewDetailItem.address || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Telepon / WA:</span>
                    <span className="font-mono font-semibold">{viewDetailItem.phone || '-'}</span>
                  </div>
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
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa "${deleteTarget?.fullName}" (NIS: ${deleteTarget?.nis})?`}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* BULK EXCEL IMPORT MODAL */}
      <BulkStudentImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        classesList={classesList}
        majorsList={majorsList}
        existingStudents={studentsList}
        onSuccess={() => {
          onRefresh();
        }}
      />
    </div>
  );
};
