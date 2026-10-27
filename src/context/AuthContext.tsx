import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getUsers, getTeachersList, logAuditEvent } from '../lib/api';
import { UserAccount, UserRole, TeacherItem } from '../types';
import { defaultUsersList, defaultTeachersList } from '../data/defaultData';

export interface AdminAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  phone?: string | null;
  role?: UserRole;
  teacherId?: string;
  username?: string;
}

interface AuthContextType {
  user: AdminAuthUser | null;
  currentUserAccount: UserAccount | null;
  role: UserRole;
  loading: boolean;
  loginWithGoogle: () => Promise<AdminAuthUser | null>;
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
const LOCAL_TOKEN_KEY = 'smk_pgri_auth_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminAuthUser | null>(null);
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Derive role
  const role: UserRole = currentUserAccount?.role || 
    user?.role || 
    (user?.email === 'official.smkpgri.kromengan@gmail.com' ? 'admin' : 'public');

  useEffect(() => {
    // Check saved session in localStorage
    const savedAccount = localStorage.getItem(LOCAL_USER_SESSION_KEY);
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
          teacherId: parsedAccount.teacherId,
          username: parsedAccount.username
        });
      } catch {
        setCurrentUserAccount(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async (): Promise<AdminAuthUser | null> => {
    // Default admin profile for Google Login
    const adminEmail = 'official.smkpgri.kromengan@gmail.com';
    const adminAcc = defaultUsersList.find(u => u.role === 'admin') || {
      id: 'user-admin-1',
      email: adminEmail,
      displayName: 'Administrator Utama (Google)',
      role: 'admin' as UserRole,
      status: 'Aktif' as const,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, displayName: 'Administrator Utama' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
        if (data.user) {
          setCurrentUserAccount(data.user);
          localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(data.user));
          const authUser: AdminAuthUser = {
            uid: data.user.id,
            email: data.user.email,
            displayName: data.user.displayName,
            photoURL: data.user.photoUrl || null,
            phone: data.user.phone || null,
            role: data.user.role,
            teacherId: data.user.teacherId,
            username: data.user.username
          };
          setUser(authUser);
          await logAuditEvent('LOGIN', 'Auth', data.user.id, `Login Google berhasil: ${adminEmail}`);
          return authUser;
        }
      }
    } catch (e) {
      console.warn('Google login API error, falling back locally:', e);
    }

    setCurrentUserAccount(adminAcc);
    localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(adminAcc));
    const authUser: AdminAuthUser = {
      uid: adminAcc.id,
      email: adminAcc.email,
      displayName: adminAcc.displayName,
      role: adminAcc.role
    };
    setUser(authUser);
    return authUser;
  };

  const loginWithRole = async (identifier: string, pass: string, targetRole?: UserRole): Promise<UserAccount> => {
    const cleanId = identifier.trim();
    const cleanPass = pass.trim();

    if (!cleanId || !cleanPass) {
      throw new Error('Harap masukkan Username/NISN/NIP/Email dan Kata Sandi.');
    }

    // Try SQLite server authentication first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password: cleanPass, targetRole })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.token) localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
        const account: UserAccount = data.user;
        setCurrentUserAccount(account);
        localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(account));
        const authUser: AdminAuthUser = {
          uid: account.id,
          email: account.email,
          displayName: account.displayName,
          photoURL: account.photoUrl || null,
          phone: account.phone || null,
          role: account.role,
          teacherId: account.teacherId,
          username: account.username
        };
        setUser(authUser);
        await logAuditEvent('LOGIN', 'Auth', account.id, `Pengguna "${account.displayName}" (${account.role}) berhasil login ke SQLite.`);
        return account;
      } else if (!res.ok && data.error) {
        // If server explicitly rejected password or account status, pass the message
        if (data.error.includes('Kata sandi salah') || data.error.includes('dinonaktifkan') || data.error.includes('bukan')) {
          throw new Error(data.error);
        }
      }
    } catch (e: any) {
      // Re-throw if explicit message
      if (e.message && (e.message.includes('Kata sandi salah') || e.message.includes('dinonaktifkan') || e.message.includes('bukan'))) {
        throw e;
      }
      console.warn('Backend login fallback:', e);
    }

    // Client-side fallback matching for seamless demo or offline operation
    const idLower = cleanId.toLowerCase();
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

    let match: UserAccount | undefined = allUsers.find(u => 
      (u.email && u.email.toLowerCase() === idLower) || 
      (u.username && u.username.toLowerCase() === idLower) ||
      (u.id && u.id.toLowerCase() === idLower) ||
      (u.phone && u.phone.replace(/[^0-9]/g, '') === idLower.replace(/[^0-9]/g, ''))
    );

    if (!match) {
      let teachers: TeacherItem[] = defaultTeachersList;
      try {
        const dbTeachers = await getTeachersList();
        if (dbTeachers && dbTeachers.length > 0) teachers = dbTeachers;
      } catch {
        teachers = defaultTeachersList;
      }

      const matchedTeacher = teachers.find(t => 
        (t.nip && t.nip.toLowerCase() === idLower) ||
        (t.email && t.email.toLowerCase() === idLower) ||
        (t.id && t.id.toLowerCase() === idLower) ||
        (idLower === 'guru' && targetRole === 'guru')
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

    if (!match) {
      if (idLower === 'admin' || idLower === 'administrator' || idLower.startsWith('admin@') || idLower === 'official.smkpgri.kromengan@gmail.com') {
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
      } else if (idLower === 'bkk' || idLower.startsWith('bkk@')) {
        match = defaultUsersList.find(u => u.role === 'bkk');
      } else if (idLower === 'kepsek' || idLower.startsWith('kepsek@')) {
        match = defaultUsersList.find(u => u.role === 'kepala_sekolah');
      } else if (idLower === 'tu' || idLower.startsWith('tu@')) {
        match = defaultUsersList.find(u => u.role === 'tu');
      } else if (idLower === 'guru' || idLower.startsWith('guru@')) {
        match = defaultUsersList.find(u => u.role === 'guru');
      }
    }

    if (!match) {
      throw new Error('Akun tidak ditemukan. Periksa kembali NIP/Username/Email Anda, atau hubungi Administrator.');
    }

    if (match.status === 'Nonaktif') {
      throw new Error('Akun Anda saat ini sedang dinonaktifkan oleh Administrator. Hubungi pihak sekolah.');
    }

    if (targetRole && targetRole !== 'admin') {
      if (targetRole === 'guru' && (match.role !== 'guru' && match.role !== 'kepala_sekolah')) {
        throw new Error(`Akun ini terdaftar sebagai ${match.role.toUpperCase()}, bukan Guru. Silakan masuk melalui tab yang sesuai.`);
      } else if (targetRole === 'bkk' && match.role !== 'bkk') {
        throw new Error(`Akun ini terdaftar sebagai ${match.role.toUpperCase()}, bukan Petugas BKK. Silakan masuk melalui tab yang sesuai.`);
      }
    }

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
      teacherId: updatedAccount.teacherId,
      username: updatedAccount.username
    };
    setUser(authUser);

    await logAuditEvent('LOGIN', 'Auth', updatedAccount.id, `Pengguna "${updatedAccount.displayName}" (${updatedAccount.role.toUpperCase()}) berhasil login.`);

    return updatedAccount;
  };

  const login = async (email: string, pass: string) => {
    await loginWithRole(email, pass);
  };

  const registerAdmin = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: pass.trim(),
          displayName: email.split('@')[0],
          role: 'admin'
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (data.token) localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
        setCurrentUserAccount(data.user);
        localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(data.user));
        setUser({
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.displayName,
          role: 'admin'
        });
        return;
      }
    } catch (e) {
      console.warn('Register via SQLite API failed, falling back:', e);
    }

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
  };

  const loginAsDemoRole = async (targetRole: UserRole): Promise<UserAccount> => {
    let demoAcc = defaultUsersList.find(u => u.role === targetRole);
    if (!demoAcc) {
      demoAcc = {
        id: `user-${targetRole}-1`,
        email: `${targetRole}@smkpgri.sch.id`,
        displayName: `${targetRole.toUpperCase()}`,
        role: targetRole,
        status: 'Aktif',
        createdAt: new Date().toISOString()
      };
    }
    setCurrentUserAccount(demoAcc);
    localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(demoAcc));
    const authUser: AdminAuthUser = {
      uid: demoAcc.id,
      email: demoAcc.email,
      displayName: demoAcc.displayName,
      photoURL: demoAcc.photoUrl || null,
      phone: demoAcc.phone || null,
      role: demoAcc.role,
      teacherId: demoAcc.teacherId,
      username: demoAcc.username
    };
    setUser(authUser);
    return demoAcc;
  };

  const loginDemoAdmin = () => {
    loginAsDemoRole('admin');
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_USER_SESSION_KEY);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    setUser(null);
    setCurrentUserAccount(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
  };

  const updateAdminProfile = async (displayName: string, photoURL?: string, phone?: string) => {
    if (currentUserAccount) {
      const updated: UserAccount = {
        ...currentUserAccount,
        displayName,
        photoUrl: photoURL || currentUserAccount.photoUrl,
        phone: phone || currentUserAccount.phone
      };
      setCurrentUserAccount(updated);
      localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(updated));

      if (user) {
        setUser({
          ...user,
          displayName,
          photoURL: photoURL || user.photoURL,
          phone: phone || user.phone
        });
      }

      // Update to backend API
      try {
        const token = localStorage.getItem(LOCAL_TOKEN_KEY);
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ displayName, photoUrl: photoURL, phone })
        });
      } catch (e) {
        console.warn('Update profile error:', e);
      }
    }
  };

  const updateAdminPassword = async (newPassword: string) => {
    try {
      const token = localStorage.getItem(LOCAL_TOKEN_KEY);
      await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ password: newPassword })
      });
    } catch (e) {
      console.warn('Update password error:', e);
    }
  };

  const sendResetPassword = async (email: string) => {
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (err: any) {
      console.warn('Send password reset request:', err);
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
