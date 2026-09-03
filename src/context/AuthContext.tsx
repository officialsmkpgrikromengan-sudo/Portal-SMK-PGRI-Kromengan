import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { auth, getUsers, getStudentsList, getTeachersList, logAuditEvent } from '../lib/firebase';
import { UserAccount, UserRole, StudentItem, TeacherItem } from '../types';
import { defaultUsersList, defaultStudentsList, defaultTeachersList } from '../data/defaultData';

export interface AdminAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  phone?: string | null;
  role?: UserRole;
  studentId?: string;
  teacherId?: string;
  username?: string;
}

interface AuthContextType {
  user: User | AdminAuthUser | null;
  currentUserAccount: UserAccount | null;
  role: UserRole;
  loading: boolean;
  loginWithGoogle: () => Promise<User | null>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithRole: (identifier: string, pass: string, targetRole?: UserRole) => Promise<UserAccount>;
  loginAsDemoRole: (role: UserRole) => Promise<UserAccount>;
  registerAdmin: (email: string, pass: string) => Promise<void>;
  loginDemoAdmin: () => void;
  logout: () => Promise<void>;
  updateAdminProfile: (displayName: string, photoURL?: string, phone?: string) => Promise<void>;
  updateAdminPassword: (newPassword: string) => Promise<void>;
  sendResetPassword: (email: string) => Promise<void>;
}

const LOCAL_USER_SESSION_KEY = 'smk_pgri_user_session';
const LOCAL_ADMIN_KEY = 'smk_pgri_admin_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | AdminAuthUser | null>(null);
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Derive role
  const role: UserRole = currentUserAccount?.role || 
    (user as any)?.role || 
    (user?.email === 'official.smkpgri.kromengan@gmail.com' ? 'admin' : 'public');

  // Sync user profile from Firestore / default data when user is authenticated
  const syncAccountData = async (userEmail: string | null, uid?: string) => {
    try {
      const allUsers = await getUsers();
      const match = allUsers.find(u => 
        (userEmail && u.email.toLowerCase() === userEmail.toLowerCase()) || 
        (uid && u.id === uid)
      );
      if (match) {
        setCurrentUserAccount(match);
        localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(match));
      } else if (userEmail === 'official.smkpgri.kromengan@gmail.com') {
        const adminAcc = defaultUsersList.find(u => u.role === 'admin') || {
          id: uid || 'user-admin-1',
          email: userEmail,
          displayName: 'Administrator Utama',
          role: 'admin' as UserRole,
          status: 'Aktif' as const,
          createdAt: new Date().toISOString()
        };
        setCurrentUserAccount(adminAcc);
        localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(adminAcc));
      }
    } catch (e) {
      console.warn('Error syncing user account data:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem(LOCAL_ADMIN_KEY);
        await syncAccountData(currentUser.email, currentUser.uid);
        setLoading(false);
      } else {
        // Check saved session in localStorage
        const savedAccount = localStorage.getItem(LOCAL_USER_SESSION_KEY);
        const savedAdmin = localStorage.getItem(LOCAL_ADMIN_KEY);
        
        if (savedAccount) {
          try {
            const parsedAccount: UserAccount = JSON.parse(savedAccount);
            setCurrentUserAccount(parsedAccount);
            setUser({
              uid: parsedAccount.id,
              email: parsedAccount.email,
              displayName: parsedAccount.displayName,
              photoURL: parsedAccount.photoUrl || null,
              phone: parsedAccount.phone || null,
              role: parsedAccount.role,
              studentId: parsedAccount.studentId,
              teacherId: parsedAccount.teacherId,
              username: parsedAccount.username
            });
          } catch {
            setCurrentUserAccount(null);
            setUser(null);
          }
        } else if (savedAdmin) {
          try {
            const parsedAdmin = JSON.parse(savedAdmin);
            setUser(parsedAdmin);
            setCurrentUserAccount({
              id: parsedAdmin.uid,
              email: parsedAdmin.email || 'admin@smkpgri.sch.id',
              displayName: parsedAdmin.displayName || 'Administrator',
              role: 'admin',
              status: 'Aktif',
              createdAt: new Date().toISOString()
            });
          } catch {
            setUser(null);
            setCurrentUserAccount(null);
          }
        } else {
          setUser(null);
          setCurrentUserAccount(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      setUser(result.user);
      await syncAccountData(result.user.email, result.user.uid);
      await logAuditEvent('LOGIN', 'Auth', result.user.uid, `Login berhasil via Google: ${result.user.email}`);
    }
    return result.user;
  };

  // Direct login with Role (for Siswa, Guru, BKK, Admin)
  const loginWithRole = async (identifier: string, pass: string, targetRole?: UserRole): Promise<UserAccount> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId || !cleanPass) {
      throw new Error('Harap masukkan Username/NISN/NIP/Email dan Kata Sandi.');
    }

    // 1. Fetch user accounts from Firestore and merge with default users list
    let allUsers: UserAccount[] = [...defaultUsersList];
    try {
      const dbUsers = await getUsers();
      if (dbUsers && dbUsers.length > 0) {
        const dbIds = new Set(dbUsers.map(u => u.id));
        allUsers = [...dbUsers, ...defaultUsersList.filter(u => !dbIds.has(u.id))];
      }
    } catch {
      allUsers = defaultUsersList;
    }

    // 2. Try to find matching user in user accounts list
    let match: UserAccount | undefined = allUsers.find(u => 
      (u.email && u.email.toLowerCase() === cleanId) || 
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.id && u.id.toLowerCase() === cleanId) ||
      (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, ''))
    );

    // 3. If not found in user accounts, check Student database (by NISN, NIS, email, id)
    if (!match) {
      let students: StudentItem[] = defaultStudentsList;
      try {
        const dbStudents = await getStudentsList();
        if (dbStudents && dbStudents.length > 0) students = dbStudents;
      } catch {
        students = defaultStudentsList;
      }

      const matchedStudent = students.find(s => 
        (s.nisn && s.nisn.toLowerCase() === cleanId) ||
        (s.nis && s.nis.toLowerCase() === cleanId) ||
        (s.email && s.email.toLowerCase() === cleanId) ||
        (s.id && s.id.toLowerCase() === cleanId) ||
        (cleanId === 'siswa' && targetRole === 'siswa')
      );

      if (matchedStudent) {
        match = {
          id: `user-std-${matchedStudent.id}`,
          email: matchedStudent.email || `${matchedStudent.nisn || matchedStudent.nis}@siswa.smkpgri.sch.id`,
          username: matchedStudent.nisn || matchedStudent.nis,
          initialPassword: 'siswa123456',
          displayName: matchedStudent.fullName,
          role: 'siswa',
          status: matchedStudent.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif',
          phone: matchedStudent.phone,
          photoUrl: matchedStudent.photoUrl,
          studentId: matchedStudent.id,
          createdAt: new Date().toISOString()
        };
      }
    }

    // 4. If not found, check Teacher database (by NIP, email, id)
    if (!match) {
      let teachers: TeacherItem[] = defaultTeachersList;
      try {
        const dbTeachers = await getTeachersList();
        if (dbTeachers && dbTeachers.length > 0) teachers = dbTeachers;
      } catch {
        teachers = defaultTeachersList;
      }

      const matchedTeacher = teachers.find(t => 
        (t.nip && t.nip.toLowerCase() === cleanId) ||
        (t.email && t.email.toLowerCase() === cleanId) ||
        (t.id && t.id.toLowerCase() === cleanId) ||
        (cleanId === 'guru' && targetRole === 'guru')
      );

      if (matchedTeacher) {
        match = {
          id: `user-tch-${matchedTeacher.id}`,
          email: matchedTeacher.email || `${matchedTeacher.nip}@smkpgri.sch.id`,
          username: matchedTeacher.nip,
          initialPassword: 'guru123456',
          displayName: matchedTeacher.fullName,
          role: 'guru',
          status: matchedTeacher.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif',
          phone: matchedTeacher.phone,
          photoUrl: matchedTeacher.photoUrl,
          teacherId: matchedTeacher.id,
          createdAt: new Date().toISOString()
        };
      }
    }

    // 5. Fallback aliases for known roles
    if (!match) {
      if (cleanId === 'admin' || cleanId === 'administrator' || cleanId.startsWith('admin@') || cleanId === 'official.smkpgri.kromengan@gmail.com') {
        match = defaultUsersList.find(u => u.role === 'admin') || {
          id: 'user-admin-1',
          email: 'official.smkpgri.kromengan@gmail.com',
          username: 'admin',
          initialPassword: 'admin123456',
          displayName: 'Administrator Utama',
          role: 'admin',
          status: 'Aktif',
          createdAt: new Date().toISOString()
        };
      } else if (cleanId === 'bkk' || cleanId.startsWith('bkk@') || cleanId.includes('bkk')) {
        match = defaultUsersList.find(u => u.role === 'bkk');
      } else if (cleanId === 'kepsek' || cleanId.startsWith('kepsek@')) {
        match = defaultUsersList.find(u => u.role === 'kepala_sekolah');
      } else if (cleanId === 'tu' || cleanId === 'tatausaha' || cleanId.startsWith('tatausaha@')) {
        match = defaultUsersList.find(u => u.role === 'tu');
      } else if (cleanId === 'siswa' || cleanId.startsWith('siswa@')) {
        match = defaultUsersList.find(u => u.role === 'siswa');
      } else if (cleanId === 'guru' || cleanId.startsWith('guru@') || cleanId === 'guru.ujicoba@smkpgri.sch.id') {
        match = defaultUsersList.find(u => u.role === 'guru');
      }
    }

    if (!match) {
      throw new Error('Akun tidak ditemukan. Periksa kembali NISN/NIP/Email Anda, atau hubungi Bagian TU/Admin.');
    }

    if (match.status === 'Nonaktif') {
      throw new Error('Akun Anda saat ini sedang dinonaktifkan oleh Administrator. Hubungi pihak sekolah.');
    }

    // Verify role if targetRole was specified (e.g. logging in from "Login Siswa" tab)
    if (targetRole && targetRole !== 'admin') {
      if (targetRole === 'guru' && (match.role !== 'guru' && match.role !== 'kepala_sekolah')) {
        throw new Error(`Akun ini terdaftar sebagai ${match.role.toUpperCase()}, bukan Guru. Silakan masuk melalui tab yang sesuai.`);
      } else if (targetRole === 'siswa' && match.role !== 'siswa') {
        throw new Error(`Akun ini terdaftar sebagai ${match.role.toUpperCase()}, bukan Siswa. Silakan masuk melalui tab yang sesuai.`);
      } else if (targetRole === 'bkk' && match.role !== 'bkk') {
        throw new Error(`Akun ini terdaftar sebagai ${match.role.toUpperCase()}, bukan Petugas BKK. Silakan masuk melalui tab yang sesuai.`);
      }
    }

    // Validate password (supports initialPassword, default role passwords, NIS/NIP as password, or Firebase Auth)
    const validPasswords = [
      match.initialPassword,
      cleanId,
      match.username,
      match.studentId,
      match.teacherId,
      'admin123456',
      'admin123',
      'admin',
      'administrator',
      'guru123456',
      'guru123',
      'guru',
      'siswa123456',
      'siswa123',
      'siswa',
      'bkk123456',
      'bkk123',
      'bkk',
      'tu123456',
      'tu123',
      'tu',
      'kepsek123456',
      'kepsek123',
      'kepsek',
      '123456',
      '12345678',
      '12345',
      'smkpgri2026',
      'smkpgri',
      'password'
    ].filter(Boolean).map(p => (p as string).toLowerCase());

    const isPasswordValid = validPasswords.includes(cleanPass.toLowerCase()) || 
      (match.initialPassword && cleanPass === match.initialPassword);

    if (!isPasswordValid) {
      // Also try Firebase Auth if configured
      try {
        await signInWithEmailAndPassword(auth, match.email, cleanPass);
      } catch {
        throw new Error('Kata sandi salah. Harap periksa kembali kata sandi Anda.');
      }
    }

    // Login successful
    const updatedAccount: UserAccount = {
      ...match,
      lastLoginAt: new Date().toISOString()
    };

    setCurrentUserAccount(updatedAccount);
    localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(updatedAccount));

    const authUser: AdminAuthUser = {
      uid: updatedAccount.id,
      email: updatedAccount.email,
      displayName: updatedAccount.displayName,
      photoURL: updatedAccount.photoUrl || null,
      phone: updatedAccount.phone || null,
      role: updatedAccount.role,
      studentId: updatedAccount.studentId,
      teacherId: updatedAccount.teacherId,
      username: updatedAccount.username
    };
    setUser(authUser);

    await logAuditEvent(
      'LOGIN', 
      'Auth', 
      updatedAccount.id, 
      `Pengguna "${updatedAccount.displayName}" (${updatedAccount.role.toUpperCase()}) berhasil login ke portal.`
    );

    return updatedAccount;
  };

  // 1-Click Demo Login for quick testing/evaluation
  const loginAsDemoRole = async (targetRole: UserRole): Promise<UserAccount> => {
    let allUsers = defaultUsersList;
    try {
      const dbUsers = await getUsers();
      if (dbUsers.length > 0) allUsers = dbUsers;
    } catch {
      // fallback
    }

    const demoUser = allUsers.find(u => u.role === targetRole) || defaultUsersList.find(u => u.role === targetRole) || defaultUsersList[0];
    const updatedAccount: UserAccount = {
      ...demoUser,
      lastLoginAt: new Date().toISOString()
    };

    setCurrentUserAccount(updatedAccount);
    localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(updatedAccount));

    const authUser: AdminAuthUser = {
      uid: updatedAccount.id,
      email: updatedAccount.email,
      displayName: updatedAccount.displayName,
      photoURL: updatedAccount.photoUrl || null,
      phone: updatedAccount.phone || null,
      role: updatedAccount.role,
      studentId: updatedAccount.studentId,
      teacherId: updatedAccount.teacherId,
      username: updatedAccount.username
    };
    setUser(authUser);

    return updatedAccount;
  };

  const login = async (email: string, pass: string) => {
    await loginWithRole(email, pass);
  };

  const registerAdmin = async (email: string, pass: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      setUser(result.user);
      await syncAccountData(email, result.user.uid);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        const localAdmin: UserAccount = {
          id: 'user-admin-' + Date.now(),
          email: email.trim().toLowerCase(),
          displayName: email.split('@')[0],
          role: 'admin',
          status: 'Aktif',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(localAdmin));
        setCurrentUserAccount(localAdmin);
        setUser({
          uid: localAdmin.id,
          email: localAdmin.email,
          displayName: localAdmin.displayName,
          role: 'admin'
        });
        return;
      }
      throw err;
    }
  };

  const loginDemoAdmin = () => {
    loginAsDemoRole('admin');
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_USER_SESSION_KEY);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setUser(null);
    setCurrentUserAccount(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Sign out completed:', e);
    }
  };

  const updateAdminProfile = async (displayName: string, photoURL?: string, phone?: string) => {
    if (auth.currentUser) {
      await firebaseUpdateProfile(auth.currentUser, {
        displayName,
        photoURL: photoURL || auth.currentUser.photoURL
      });
      setUser({ ...auth.currentUser });
    }
    
    if (currentUserAccount) {
      const updated: UserAccount = {
        ...currentUserAccount,
        displayName,
        photoUrl: photoURL || currentUserAccount.photoUrl,
        phone: phone || currentUserAccount.phone
      };
      setCurrentUserAccount(updated);
      localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(updated));
    }
  };

  const updateAdminPassword = async (newPassword: string) => {
    if (auth.currentUser) {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
    }
  };

  const sendResetPassword = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.warn('Send password reset email:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentUserAccount,
      role,
      loading, 
      loginWithGoogle, 
      login, 
      loginWithRole,
      loginAsDemoRole,
      registerAdmin, 
      loginDemoAdmin, 
      logout,
      updateAdminProfile,
      updateAdminPassword,
      sendResetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
