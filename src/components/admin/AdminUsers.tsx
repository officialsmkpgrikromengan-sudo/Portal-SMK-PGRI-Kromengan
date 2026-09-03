import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Key, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  BookOpen,
  School,
  Lock,
  Layers,
  ChevronRight,
  X,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { UserAccount, UserRole, TeacherItem, StudentItem } from '../../types';
import { getUsers, saveUser, deleteUser, updateUserStatus, logAuditEvent } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';

interface AdminUsersProps {
  teachersList: TeacherItem[];
  studentsList: StudentItem[];
  currentUserEmail?: string;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  teachersList = [],
  studentsList = [],
  currentUserEmail = ''
}) => {
  const { success, error, info } = useToast();
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Form State
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formInitialPassword, setFormInitialPassword] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('guru');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formPhone, setFormPhone] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Selected Student/Teacher helper
  const [selectedStudentIdentifier, setSelectedStudentIdentifier] = useState('');
  const [selectedTeacherNIP, setSelectedTeacherNIP] = useState('');

  // Auto-sync status feedback
  const [matchedStudentInfo, setMatchedStudentInfo] = useState<StudentItem | null>(null);
  const [matchedTeacherInfo, setMatchedTeacherInfo] = useState<TeacherItem | null>(null);

  // Bulk sync loading
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsersList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Quick count of students without login accounts
  const unprovisionedStudents = useMemo(() => {
    const existingStudentUserIds = new Set(
      usersList
        .filter(u => u.role === 'siswa')
        .map(u => u.studentId || u.username)
        .filter(Boolean)
    );
    const existingUsernames = new Set(
      usersList.map(u => (u.username || '').toLowerCase())
    );

    return studentsList.filter(s => {
      const nisnKey = (s.nisn || s.nis || '').toLowerCase();
      return !existingStudentUserIds.has(s.id) && !existingUsernames.has(nisnKey);
    });
  }, [studentsList, usersList]);

  const handleOpenAddRole = (presetRole: UserRole) => {
    setIsEditing(false);
    setSelectedUser(null);
    setFormRole(presetRole);
    setFormStatus('Aktif');
    setFormPhone('');
    setFormNotes('');
    setSelectedStudentIdentifier('');
    setSelectedTeacherNIP('');
    setMatchedStudentInfo(null);
    setMatchedTeacherInfo(null);

    if (presetRole === 'siswa') {
      const firstStudent = unprovisionedStudents[0] || studentsList[0];
      if (firstStudent) {
        const stdName = firstStudent.fullName || (firstStudent as any).name || 'Siswa';
        const stdNisn = firstStudent.nisn || firstStudent.nis || '';
        setFormDisplayName(stdName);
        setFormStudentId(firstStudent.id);
        setFormUsername(stdNisn);
        setFormEmail(firstStudent.email || `${stdNisn || 'siswa'}@siswa.smkpgri.sch.id`);
        setFormPhone(firstStudent.phone || '');
        setSelectedStudentIdentifier(stdNisn || firstStudent.id);
        setMatchedStudentInfo(firstStudent);
      } else {
        setFormDisplayName('');
        setFormStudentId('');
        setFormUsername('');
        setFormEmail('');
      }
      setFormInitialPassword('siswa123456');
      setFormTeacherId('');
    } else if (presetRole === 'guru') {
      const firstTeacher = teachersList[0];
      if (firstTeacher) {
        const tchName = firstTeacher.fullName || (firstTeacher as any).name || 'Guru';
        setFormDisplayName(tchName);
        setFormTeacherId(firstTeacher.id);
        setFormUsername(firstTeacher.nip || `guru${firstTeacher.id}`);
        setFormEmail(firstTeacher.email || `${firstTeacher.nip || 'guru'}@guru.smkpgri.sch.id`);
        setFormPhone(firstTeacher.phone || '');
        setSelectedTeacherNIP(firstTeacher.nip || '');
        setMatchedTeacherInfo(firstTeacher);
      } else {
        setFormDisplayName('');
        setFormTeacherId('');
        setFormUsername('');
        setFormEmail('');
      }
      setFormInitialPassword('guru123456');
      setFormStudentId('');
    } else if (presetRole === 'bkk') {
      setFormDisplayName('Koordinator BKK & Kemitraan DUDI');
      setFormUsername('bkk');
      setFormEmail('bkk@smkpgri.sch.id');
      setFormInitialPassword('bkk123456');
      setFormTeacherId('');
      setFormStudentId('');
    } else {
      setFormDisplayName('');
      setFormUsername('');
      setFormEmail('');
      setFormInitialPassword('admin123456');
      setFormTeacherId('');
      setFormStudentId('');
    }

    setShowModal(true);
  };

  // Synchronize when selecting student from dropdown
  const handleSelectStudent = (identifier: string) => {
    setSelectedStudentIdentifier(identifier);
    if (!identifier) {
      setMatchedStudentInfo(null);
      return;
    }

    const st = studentsList.find(s => 
      s.nisn === identifier || 
      s.id === identifier || 
      s.nis === identifier
    );

    if (st) {
      const stdName = st.fullName || (st as any).name || 'Siswa';
      const stdNisn = st.nisn || st.nis || '';
      setFormDisplayName(stdName);
      setFormStudentId(st.id);
      setFormUsername(stdNisn);
      setFormEmail(st.email || `${stdNisn || 'siswa'}@siswa.smkpgri.sch.id`);
      setFormPhone(st.phone || '');
      setMatchedStudentInfo(st);
    }
  };

  // Synchronize in real-time when user types or pastes an NISN in username field
  const handleUsernameChange = (val: string) => {
    setFormUsername(val);

    if (formRole === 'siswa') {
      const cleanVal = val.trim().toLowerCase();
      const matched = studentsList.find(s => 
        (s.nisn && s.nisn.toLowerCase() === cleanVal) || 
        (s.nis && s.nis.toLowerCase() === cleanVal) ||
        (s.id && s.id.toLowerCase() === cleanVal)
      );

      if (matched) {
        const stdName = matched.fullName || (matched as any).name || 'Siswa';
        setFormDisplayName(stdName);
        setFormStudentId(matched.id);
        if (!formEmail || formEmail.includes('@siswa.smkpgri.sch.id')) {
          setFormEmail(matched.email || `${matched.nisn || matched.nis}@siswa.smkpgri.sch.id`);
        }
        if (matched.phone) {
          setFormPhone(matched.phone);
        }
        setSelectedStudentIdentifier(matched.nisn || matched.id);
        setMatchedStudentInfo(matched);
      } else {
        setMatchedStudentInfo(null);
      }
    } else if (formRole === 'guru') {
      const cleanVal = val.trim().toLowerCase();
      const matched = teachersList.find(t => 
        (t.nip && t.nip.toLowerCase() === cleanVal) || 
        (t.id && t.id.toLowerCase() === cleanVal)
      );

      if (matched) {
        const tchName = matched.fullName || (matched as any).name || 'Guru';
        setFormDisplayName(tchName);
        setFormTeacherId(matched.id);
        if (!formEmail || formEmail.includes('@guru.smkpgri.sch.id')) {
          setFormEmail(matched.email || `${matched.nip}@guru.smkpgri.sch.id`);
        }
        if (matched.phone) {
          setFormPhone(matched.phone);
        }
        setSelectedTeacherNIP(matched.nip || '');
        setMatchedTeacherInfo(matched);
      } else {
        setMatchedTeacherInfo(null);
      }
    }
  };

  const handleSelectTeacher = (nip: string) => {
    setSelectedTeacherNIP(nip);
    if (!nip) {
      setMatchedTeacherInfo(null);
      return;
    }

    const tc = teachersList.find(t => t.nip === nip || t.id === nip);
    if (tc) {
      const tchName = tc.fullName || (tc as any).name || 'Guru';
      setFormDisplayName(tchName);
      setFormTeacherId(tc.id);
      setFormUsername(tc.nip || `guru${tc.id}`);
      setFormEmail(tc.email || `${tc.nip || 'guru'}@guru.smkpgri.sch.id`);
      setFormPhone(tc.phone || '');
      setMatchedTeacherInfo(tc);
    }
  };

  const handleOpenEdit = (user: UserAccount) => {
    setIsEditing(true);
    setSelectedUser(user);
    setFormDisplayName(user.displayName);
    setFormUsername(user.username || '');
    setFormInitialPassword(user.initialPassword || '');
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPhone(user.phone || '');
    setFormTeacherId(user.teacherId || '');
    setFormStudentId(user.studentId || '');
    setFormNotes(user.notes || '');

    if (user.role === 'siswa') {
      const matched = studentsList.find(s => s.id === user.studentId || s.nisn === user.username);
      setMatchedStudentInfo(matched || null);
    } else if (user.role === 'guru') {
      const matched = teachersList.find(t => t.id === user.teacherId || t.nip === user.username);
      setMatchedTeacherInfo(matched || null);
    }

    setShowModal(true);
  };

  // Bulk Synchronize All Student Accounts based on NISN
  const handleBulkSyncAllStudents = async () => {
    if (unprovisionedStudents.length === 0) {
      info('Semua data siswa sudah memiliki akun login portal!');
      return;
    }

    const confirmMsg = `Ditemukan ${unprovisionedStudents.length} siswa yang belum memiliki akun login.\n\nApakah Anda ingin membuatkan akun login otomatis untuk semua siswa ini berdasarkan NISN mereka dengan password default 'siswa123456'?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsBulkSyncing(true);
      const now = new Date().toISOString();
      let createdCount = 0;

      for (const std of unprovisionedStudents) {
        const stdNisn = std.nisn || std.nis;
        if (!stdNisn) continue;

        const stdName = std.fullName || (std as any).name || 'Siswa';
        const userToCreate: UserAccount = {
          id: `usr-std-${std.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          displayName: stdName,
          username: stdNisn.toLowerCase(),
          initialPassword: 'siswa123456',
          email: std.email || `${stdNisn}@siswa.smkpgri.sch.id`,
          role: 'siswa',
          status: 'Aktif',
          studentId: std.id,
          phone: std.phone || undefined,
          notes: `Akun dibuat otomatis via Sinkronisasi NISN Massal (${std.classId})`,
          createdAt: now,
          updatedAt: now
        };

        await saveUser(userToCreate);
        createdCount++;
      }

      await logAuditEvent(
        'CREATE',
        'Auth',
        'bulk-sync-students',
        `Menyinkronkan ${createdCount} akun login siswa baru secara massal berdasarkan NISN`,
        'Admin Utama'
      );

      success(`Berhasil menyinkronkan ${createdCount} akun login siswa baru berdasarkan NISN!`);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      error('Terjadi kesalahan saat menyinkronkan akun siswa.');
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDisplayName.trim() || !formEmail.trim()) {
      error('Nama lengkap dan alamat email wajib diisi.');
      return;
    }

    if (!formUsername.trim()) {
      error(formRole === 'siswa' ? 'NISN wajib diisi sebagai Username login siswa.' : 'Username / Login ID wajib diisi.');
      return;
    }

    try {
      const id = isEditing && selectedUser ? selectedUser.id : `user-${Date.now()}`;
      const now = new Date().toISOString();

      const userToSave: UserAccount = {
        id,
        displayName: formDisplayName.trim(),
        username: formUsername.trim().toLowerCase() || undefined,
        initialPassword: formInitialPassword.trim() || undefined,
        email: formEmail.trim().toLowerCase(),
        role: formRole,
        status: formStatus,
        phone: formPhone.trim() || undefined,
        teacherId: formRole === 'guru' || formRole === 'kepala_sekolah' || formRole === 'bkk' ? formTeacherId || undefined : undefined,
        studentId: formRole === 'siswa' ? formStudentId || undefined : undefined,
        notes: formNotes.trim() || undefined,
        createdAt: isEditing && selectedUser ? selectedUser.createdAt : now,
        updatedAt: now
      };

      await saveUser(userToSave);
      await logAuditEvent(
        isEditing ? 'UPDATE' : 'CREATE',
        'Auth',
        userToSave.id,
        `${isEditing ? 'Memperbarui' : 'Menambahkan'} akun pengguna: ${userToSave.displayName} (${userToSave.role}) - Login: ${userToSave.username}`,
        userToSave.displayName
      );

      success(`Akun "${userToSave.displayName}" berhasil disimpan.`);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      error('Gagal menyimpan data pengguna.');
    }
  };

  const handleCopyCredentials = (user: UserAccount) => {
    const credText = `Portal Login ${user.displayName}\nUsername: ${user.username || user.email}\nPassword: ${user.initialPassword || 'admin123456'}\nPeran: ${user.role.toUpperCase()}`;
    navigator.clipboard.writeText(credText);
    setCopiedId(user.id);
    success(`Info login untuk ${user.displayName} telah disalin!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleStatus = async (user: UserAccount) => {
    const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    try {
      await updateUserStatus(user.id, newStatus);
      await logAuditEvent(
        'UPDATE',
        'Auth',
        user.id,
        `Mengubah status akun ${user.displayName} menjadi ${newStatus}`,
        user.displayName
      );
      success(`Status akun ${user.displayName} diubah menjadi ${newStatus}.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      error('Gagal memperbarui status akun.');
    }
  };

  const handleDeleteUser = async (user: UserAccount) => {
    if (user.email === currentUserEmail) {
      error('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus akun pengguna "${user.displayName}"?`)) {
      try {
        await deleteUser(user.id);
        await logAuditEvent(
          'DELETE',
          'Auth',
          user.id,
          `Menghapus akun pengguna: ${user.displayName} (${user.email})`,
          user.displayName
        );
        success(`Akun pengguna "${user.displayName}" berhasil dihapus.`);
        fetchUsers();
      } catch (err) {
        console.error(err);
        error('Gagal menghapus pengguna.');
      }
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      return (
        u.displayName.toLowerCase().includes(kw) || 
        u.email.toLowerCase().includes(kw) || 
        (u.username && u.username.toLowerCase().includes(kw)) ||
        (u.phone && u.phone.includes(kw))
      );
    }
    return true;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Admin Utama</span>;
      case 'kepala_sekolah':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Kepala Sekolah</span>;
      case 'guru':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Dewan Guru</span>;
      case 'bkk':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Koordinator BKK</span>;
      case 'tu':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Tata Usaha (TU)</span>;
      case 'siswa':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Siswa (NISN)</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{role}</span>;
    }
  };

  return (
    <div id="admin-users-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manajemen Akun & Hak Akses
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1">
            Buat akun login untuk Siswa (berdasarkan NISN), Guru, BKK, dan Staff. NISN siswa langsung tersinkronisasi otomatis dengan nama siswa tanpa perlu input manual satu per satu.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="btn-quick-add-siswa"
            onClick={() => handleOpenAddRole('siswa')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>+ Akun Siswa (NISN)</span>
          </button>

          {unprovisionedStudents.length > 0 && (
            <button
              id="btn-bulk-sync-students"
              onClick={handleBulkSyncAllStudents}
              disabled={isBulkSyncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer animate-pulse"
              title="Sinkronkan akun login untuk semua data siswa yang belum memiliki akun"
            >
              <Zap className="w-4 h-4" />
              <span>{isBulkSyncing ? 'Menyinkronkan...' : `⚡ Sinkronkan (${unprovisionedStudents.length}) Siswa`}</span>
            </button>
          )}

          <button
            id="btn-quick-add-guru"
            onClick={() => handleOpenAddRole('guru')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>+ Akun Guru</span>
          </button>

          <button
            id="btn-quick-add-bkk"
            onClick={() => handleOpenAddRole('bkk')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>+ Akun BKK</span>
          </button>

          <button
            id="btn-quick-add-admin"
            onClick={() => handleOpenAddRole('admin')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Admin</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Akun Pengguna ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriks Hak Akses (Permissions)</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Cari nama, NISN, NIP, username, email..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              >
                <option value="all">Semua Role</option>
                <option value="siswa">Siswa (NISN)</option>
                <option value="guru">Dewan Guru</option>
                <option value="bkk">Koordinator BKK</option>
                <option value="admin">Administrator Utama</option>
                <option value="kepala_sekolah">Kepala Sekolah</option>
                <option value="tu">Tata Usaha (TU)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Total <strong>{filteredUsers.length}</strong> akun terdaftar</span>
              <button 
                onClick={fetchUsers} 
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                title="Refresh Data Akun"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Nama & Profil</th>
                    <th className="p-3.5">Username / Login (NISN/NIP)</th>
                    <th className="p-3.5">Email Akun</th>
                    <th className="p-3.5">Peran / Role</th>
                    <th className="p-3.5">Password Awal</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada akun pengguna yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.displayName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{u.displayName}</div>
                              <div className="text-[10px] text-slate-400">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-1 bg-slate-100 text-slate-800 font-mono font-bold rounded-md text-[11px] border border-slate-200">
                            {u.username || u.email.split('@')[0]}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          {getRoleBadge(u.role)}
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono text-slate-500 text-[11px]">
                            {u.initialPassword || '••••••••'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              u.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {u.status === 'Aktif' ? (
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            )}
                            <span>{u.status}</span>
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopyCredentials(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                              title="Salin Info Login (Username & Password)"
                            >
                              {copiedId === u.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                              title="Edit Pengguna"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Hapus Pengguna"
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
        </div>
      )}

      {/* Permissions Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Matriks Hak Akses Modul Portal Berdasarkan Role
            </h3>
            <p className="text-xs text-slate-500">
              Setiap role memiliki akses ke modul dan portal masing-masing secara otomatis saat login.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-bold text-slate-700">Fitur & Modul Portal</th>
                  <th className="p-3 font-bold text-center text-purple-700">Admin Utama</th>
                  <th className="p-3 font-bold text-center text-blue-700">Portal Siswa</th>
                  <th className="p-3 font-bold text-center text-emerald-700">Portal Guru</th>
                  <th className="p-3 font-bold text-center text-amber-700">Portal BKK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-semibold">Dashboard & Profil Pribadi</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Admin CMS</td>
                  <td className="p-3 text-center text-blue-600 font-bold">Portal Siswa</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Portal Guru</td>
                  <td className="p-3 text-center text-amber-600 font-bold">Portal BKK</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Jadwal Pelajaran & Kalender</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Full Access</td>
                  <td className="p-3 text-center text-blue-600 font-bold">Jadwal Kelas Saya</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Jadwal Mengajar</td>
                  <td className="p-3 text-center text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Absensi / Kehadiran</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Rekapitulasi</td>
                  <td className="p-3 text-center text-blue-600 font-bold">Presensi Mandiri</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Input Absensi Kelas</td>
                  <td className="p-3 text-center text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Input & Monitoring Nilai Rapor</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Full Access</td>
                  <td className="p-3 text-center text-blue-600 font-bold">Lihat Nilai & Rapor</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Input Nilai Mapel</td>
                  <td className="p-3 text-center text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Jurnal PKL & Monitoring</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Full Access</td>
                  <td className="p-3 text-center text-blue-600 font-bold">Isi Logbook & Jurnal</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Bimbingan & Verifikasi</td>
                  <td className="p-3 text-center text-amber-600 font-bold">Pantau DUDI Mitra</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">BKK: Lowongan Kerja & Rekrutmen</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">Full Access</td>
                  <td className="p-3 text-center text-blue-600 font-bold">Lamar Lowongan BKK</td>
                  <td className="p-3 text-center text-slate-400">-</td>
                  <td className="p-3 text-center text-amber-600 font-bold">Kelola Lowongan & Pelamar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formRole === 'siswa' ? <GraduationCap className="w-5 h-5 text-blue-400" /> :
                 formRole === 'guru' ? <BookOpen className="w-5 h-5 text-emerald-400" /> :
                 formRole === 'bkk' ? <Briefcase className="w-5 h-5 text-amber-400" /> :
                 <Users className="w-5 h-5 text-purple-400" />}
                <div>
                  <h3 className="text-sm font-bold">
                    {isEditing ? 'Perbarui Akun Pengguna' : `Tambah Akun ${formRole === 'siswa' ? 'Siswa (Berdasarkan NISN)' : formRole.toUpperCase()}`}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {formRole === 'siswa' ? 'NISN akan otomatis tersinkronisasi dengan nama siswa' : 'Isi form kredensial login portal'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              {/* If creating Siswa account, allow selecting from studentsList */}
              {!isEditing && formRole === 'siswa' && studentsList.length > 0 && (
                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-blue-900 font-bold">Pilih Siswa dari Data Master:</label>
                    <span className="text-[10px] text-blue-600 font-semibold">Tersedia {studentsList.length} siswa</span>
                  </div>
                  <select
                    value={selectedStudentIdentifier}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-semibold text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Siswa (NISN & Nama) --</option>
                    {studentsList.map(s => {
                      const sName = s.fullName || (s as any).name;
                      const sNisn = s.nisn || s.nis;
                      return (
                        <option key={s.id} value={sNisn || s.id}>
                          {sNisn ? `[${sNisn}] ` : ''}{sName} ({s.classId || 'Reguler'})
                        </option>
                      );
                    })}
                  </select>

                  {matchedStudentInfo && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Siswa Ditemukan & Tersinkron:</div>
                        <div className="text-emerald-700">
                          {matchedStudentInfo.fullName || (matchedStudentInfo as any).name} • NISN: <span className="font-mono font-bold">{matchedStudentInfo.nisn || matchedStudentInfo.nis}</span> • Kelas: {matchedStudentInfo.classId}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* If creating Guru account, allow selecting from teachersList */}
              {!isEditing && formRole === 'guru' && teachersList.length > 0 && (
                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                  <label className="block text-emerald-900 font-bold">Pilih Guru dari Data Master:</label>
                  <select
                    value={selectedTeacherNIP}
                    onChange={(e) => handleSelectTeacher(e.target.value)}
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Pilih Guru untuk Auto-Fill --</option>
                    {teachersList.map(t => {
                      const tName = t.fullName || (t as any).name;
                      return (
                        <option key={t.id} value={t.nip || t.id}>
                          {tName} {t.nip ? `(NIP: ${t.nip})` : ''}
                        </option>
                      );
                    })}
                  </select>

                  {matchedTeacherInfo && (
                    <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-[11px] flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">{matchedTeacherInfo.fullName || (matchedTeacherInfo as any).name}</span>
                        {matchedTeacherInfo.nip && <span> • NIP: <span className="font-mono font-bold">{matchedTeacherInfo.nip}</span></span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Username field (NISN for Siswa) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {formRole === 'siswa' ? 'NISN (Nomor Induk Siswa Nasional) *' : 'Username / Login ID *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder={formRole === 'siswa' ? 'Masukkan 10 digit NISN siswa...' : 'NIP / Username login...'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-blue-700 text-sm"
                  />
                  {formRole === 'siswa' && matchedStudentInfo && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Tersinkron
                    </span>
                  )}
                </div>
                {formRole === 'siswa' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ketik atau pilih NISN siswa, nama siswa di bawah akan otomatis terisi dari master data.
                  </p>
                )}
              </div>

              {/* Display Name (Auto-synced) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    {formRole === 'siswa' ? 'Nama Siswa (Tersinkron Otomatis) *' : 'Nama Lengkap & Gelar *'}
                  </label>
                  {formRole === 'siswa' && (
                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      Auto-sync dari NISN
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder={formRole === 'siswa' ? 'Nama otomatis terisi saat NISN dipilih...' : 'Contoh: Budi Santoso / Siti Rahma, S.Pd'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Password Awal *</label>
                  <input
                    type="text"
                    required
                    value={formInitialPassword}
                    onChange={(e) => setFormInitialPassword(e.target.value)}
                    placeholder="Password login"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Alamat Email Resmi *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="nama@smkpgri.sch.id"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role / Hak Akses *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold"
                  >
                    <option value="siswa">Siswa (NISN)</option>
                    <option value="guru">Dewan Guru</option>
                    <option value="bkk">Koordinator BKK</option>
                    <option value="admin">Administrator Utama</option>
                    <option value="kepala_sekolah">Kepala Sekolah</option>
                    <option value="tu">Tata Usaha (TU)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Keaktifan *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Buat Akun Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
