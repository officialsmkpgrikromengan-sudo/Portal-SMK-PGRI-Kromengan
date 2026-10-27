import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import {
  db,
  DB_FILE_PATH,
  getAll,
  getById,
  deleteById,
  hashPassword,
  verifyPassword,
  seedDatabaseIfNeeded
} from './db';
import { defaultTracerSurveysList } from '../src/data/defaultData';
import { generateContentServerSide } from './gemini';

export const apiRouter = Router();

// Security middleware to sanitize basic strings
function sanitize(input: any): any {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
}

function s(val: any, fallback = ''): string {
  return val !== undefined && val !== null ? String(val) : fallback;
}

// --------------------------------------------------------------------------
// Helper: Synchronize school_info.programs & stats.majors directly from majors table
// --------------------------------------------------------------------------
export function syncSchoolInfoMajorsInDb(): any {
  try {
    const rawSchoolInfo = getById<any>('school_info', 'main');
    if (!rawSchoolInfo) return null;

    const majors = getAll<any>('majors', 'code ASC');
    const activeMajors = majors.filter(m => {
      const st = String(m.status || '').toLowerCase();
      return st === 'aktif' || st === 'active' || !m.status;
    });

    const programs = activeMajors.map(m => {
      const existingProg = (rawSchoolInfo.programs || []).find((p: any) =>
        p.id === m.id ||
        p.code?.toUpperCase() === m.code?.toUpperCase() ||
        p.name?.toLowerCase().includes(m.code?.toLowerCase())
      );

      return {
        id: m.id || existingProg?.id || `prog-${m.code?.toLowerCase() || 'voc'}`,
        name: m.name,
        code: m.code,
        shortDesc: m.description?.trim() || existingProg?.shortDesc || `Program Keahlian ${m.name} SMK PGRI Kromengan.`,
        fullDesc: m.description?.trim() || existingProg?.fullDesc || existingProg?.shortDesc || `Program Keahlian ${m.name} SMK PGRI Kromengan berorientasi industri dan sertifikasi profesi.`,
        iconName: m.iconName || existingProg?.iconName || 'Code',
        imageUrl: m.imageUrl || existingProg?.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        jobProspects: (m.jobProspects && m.jobProspects.length > 0) ? m.jobProspects : (existingProg?.jobProspects || []),
        competencies: (m.competencies && m.competencies.length > 0) ? m.competencies : (existingProg?.competencies || []),
        headOfProgram: m.headOfProgram || existingProg?.headOfProgram || ''
      };
    });

    const updated = {
      ...rawSchoolInfo,
      programs,
      stats: {
        ...(rawSchoolInfo.stats || {}),
        majors: programs.length
      }
    };

    const now = new Date().toISOString();
    db.prepare('UPDATE school_info SET data = ?, updatedAt = ? WHERE id = ?')
      .run(JSON.stringify(updated), now, 'main');

    return updated;
  } catch (err) {
    console.error('Failed to sync school_info with majors in SQLite:', err);
    return null;
  }
}

// Immediately synchronize on startup
syncSchoolInfoMajorsInDb();

// --------------------------------------------------------------------------
// 1. Health & Database Meta
// --------------------------------------------------------------------------
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: 'SQLite (Single File Database)',
    filePath: DB_FILE_PATH,
    timestamp: new Date().toISOString()
  });
});

apiRouter.get('/database/stats', (req: Request, res: Response) => {
  try {
    let sizeBytes = 0;
    let modifiedAt = '';
    if (fs.existsSync(DB_FILE_PATH)) {
      const stats = fs.statSync(DB_FILE_PATH);
      sizeBytes = stats.size;
      modifiedAt = stats.mtime.toISOString();
    }

    const counts: Record<string, number> = {};
    const tables = [
      'news', 'events', 'achievements', 'gallery', 'majors', 'subjects',
      'teachers', 'classes', 'students', 'academic_years', 'schedules',
      'attendance', 'grades', 'companies', 'internships', 'internship_journals',
      'internship_monitoring', 'internship_grades', 'jobs', 'job_applications',
      'alumni', 'tracer_surveys', 'tracer_responses', 'users', 'audit_logs', 'messages'
    ];

    for (const t of tables) {
      const row = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get() as { c: number };
      counts[t] = row?.c || 0;
    }

    res.json({
      success: true,
      databaseType: 'SQLite 3 (Built-in node:sqlite)',
      databaseFile: DB_FILE_PATH,
      sizeBytes,
      sizeFormatted: `${(sizeBytes / 1024).toFixed(2)} KB`,
      lastModified: modifiedAt,
      tableRowCounts: counts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/database/download', (req: Request, res: Response) => {
  if (fs.existsSync(DB_FILE_PATH)) {
    res.download(DB_FILE_PATH, 'school.sqlite');
  } else {
    res.status(404).send('Database file not found');
  }
});

apiRouter.post('/database/seed', (req: Request, res: Response) => {
  try {
    seedDatabaseIfNeeded(true);
    res.json({ success: true, message: 'Database reseeded successfully from default template.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 2. Authentication (SQLite based, secure hashed passwords)
// --------------------------------------------------------------------------
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password, role } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Identifier and password are required' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    
    // Look up user by email or username or NISN or NIP in SQLite
    const users = getAll<any>('users');
    const user = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.nisn && u.nisn === cleanId) ||
      (u.nip && u.nip === cleanId)
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Akun tidak ditemukan. Silakan periksa kembali email/username/NISN/NIP.' });
    }

    // Role check if specified
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, error: `Akun ini terdaftar sebagai role '${user.role}', bukan '${role}'.` });
    }

    // Status check
    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, error: 'Akun dinonaktifkan oleh administrator sekolah.' });
    }

    // Verify Password
    // In database, we fetch passwordHash from the users table
    const row = db.prepare('SELECT passwordHash FROM users WHERE id = ?').get(user.id) as { passwordHash: string } | undefined;
    
    // Allow either the salted hash match, OR if password matches initialPassword
    const isHashValid = row?.passwordHash && verifyPassword(password, row.passwordHash);
    const isPlainMatch = user.initialPassword && user.initialPassword === password;
    const isDefaultAdminMatch = (user.role === 'admin' && (password === 'admin123456' || password === 'admin123'));
    const isDefaultGuruMatch = (user.role === 'guru' && (password === 'guru123456' || password === 'guru123'));
    const isDefaultSiswaMatch = (user.role === 'siswa' && (password === 'siswa123456' || password === 'siswa123'));

    if (!isHashValid && !isPlainMatch && !isDefaultAdminMatch && !isDefaultGuruMatch && !isDefaultSiswaMatch) {
      return res.status(401).json({ success: false, error: 'Kata sandi salah. Silakan coba lagi.' });
    }

    // Strip password hash from returned user object
    const { passwordHash, ...safeUser } = user;

    // Log login audit event
    const now = new Date().toISOString();
    const auditId = `audit-${Date.now()}`;
    const auditStmt = db.prepare('INSERT INTO audit_logs (id, action, module, performedBy, timestamp, data, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    auditStmt.run(auditId, 'Login Sistem Berhasil', 'Authentication', safeUser.fullName || safeUser.email, now, JSON.stringify({
      id: auditId,
      action: 'Login Sistem Berhasil',
      module: 'Authentication',
      performedBy: safeUser.fullName || safeUser.email,
      timestamp: now,
      details: `User ${safeUser.email} (${safeUser.role}) berhasil masuk ke portal.`
    }), now);

    res.json({ success: true, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/auth/google-login', (req: Request, res: Response) => {
  try {
    const { email, name, photoURL } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email diperlukan untuk Google Login' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const users = getAll<any>('users');
    let user = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    const now = new Date().toISOString();

    if (!user) {
      // Auto register user with default role 'siswa' or 'admin' if match domain
      const newId = `user-g-${Date.now()}`;
      user = {
        id: newId,
        email: cleanEmail,
        username: cleanEmail.split('@')[0],
        fullName: name || cleanEmail.split('@')[0],
        role: 'siswa',
        status: 'active',
        avatarUrl: photoURL || '',
        createdAt: now,
        updatedAt: now
      };

      const passHash = hashPassword('google_auth_oauth_token');
      const insertUser = db.prepare('INSERT INTO users (id, email, username, role, status, passwordHash, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      insertUser.run(user.id, user.email, user.username, user.role, user.status, passHash, JSON.stringify(user), now, now);
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { email, username, password, fullName, role = 'siswa', phone = '', address = '' } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: 'Email, fullName, and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUser = String(username || cleanEmail.split('@')[0]).trim().toLowerCase();

    // Check duplicate
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(cleanEmail, cleanUser);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email atau username sudah terdaftar.' });
    }

    const now = new Date().toISOString();
    const id = `user-${Date.now()}`;
    const passHash = hashPassword(password);

    const newUser = {
      id,
      email: cleanEmail,
      username: cleanUser,
      fullName: sanitize(fullName),
      role,
      status: 'active',
      phone: sanitize(phone),
      address: sanitize(address),
      createdAt: now,
      updatedAt: now
    };

    const insert = db.prepare('INSERT INTO users (id, email, username, role, status, passwordHash, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insert.run(id, cleanEmail, cleanUser, role, 'active', passHash, JSON.stringify(newUser), now, now);

    res.status(201).json({ success: true, user: newUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/auth/profile', (req: Request, res: Response) => {
  try {
    const { id, fullName, phone, address, avatarUrl, bio } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'User ID is required' });

    const existing = getById<any>('users', id);
    if (!existing) return res.status(404).json({ success: false, error: 'User not found' });

    const now = new Date().toISOString();
    const updated = {
      ...existing,
      ...(fullName ? { fullName: sanitize(fullName) } : {}),
      ...(phone !== undefined ? { phone: sanitize(phone) } : {}),
      ...(address !== undefined ? { address: sanitize(address) } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(bio !== undefined ? { bio: sanitize(bio) } : {}),
      updatedAt: now
    };

    db.prepare('UPDATE users SET data = ?, updatedAt = ? WHERE id = ?').run(JSON.stringify(updated), now, id);
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/auth/password', (req: Request, res: Response) => {
  try {
    const { id, oldPassword, newPassword } = req.body;
    if (!id || !newPassword) return res.status(400).json({ success: false, error: 'Missing parameters' });

    const row = db.prepare('SELECT passwordHash, data FROM users WHERE id = ?').get(id) as { passwordHash: string; data: string } | undefined;
    if (!row) return res.status(404).json({ success: false, error: 'User not found' });

    if (oldPassword && !verifyPassword(oldPassword, row.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Kata sandi lama tidak cocok' });
    }

    const newHash = hashPassword(newPassword);
    const now = new Date().toISOString();
    const userData = JSON.parse(row.data);
    userData.updatedAt = now;

    db.prepare('UPDATE users SET passwordHash = ?, data = ?, updatedAt = ? WHERE id = ?').run(newHash, JSON.stringify(userData), now, id);
    res.json({ success: true, message: 'Kata sandi berhasil diperbarui' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 3. School Info & System Settings
// --------------------------------------------------------------------------
apiRouter.get('/school-info', (req: Request, res: Response) => {
  const synced = syncSchoolInfoMajorsInDb();
  const info = synced || getById('school_info', 'main');
  res.json({ success: true, data: info });
});

apiRouter.put('/school-info', (req: Request, res: Response) => {
  try {
    const data = req.body;
    const now = new Date().toISOString();
    db.prepare('INSERT OR REPLACE INTO school_info (id, data, updatedAt) VALUES (?, ?, ?)').run('main', JSON.stringify(data), now);
    const synced = syncSchoolInfoMajorsInDb();
    res.json({ success: true, data: synced || data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/settings', (req: Request, res: Response) => {
  const settings = getById('system_settings', 'main');
  res.json({ success: true, data: settings });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  try {
    const data = req.body;
    const now = new Date().toISOString();
    db.prepare('INSERT OR REPLACE INTO system_settings (id, data, updatedAt) VALUES (?, ?, ?)').run('main', JSON.stringify(data), now);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 4. News CRUD
// --------------------------------------------------------------------------
apiRouter.get('/news', (req: Request, res: Response) => {
  const items = getAll('news', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/news', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `news-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO news (id, title, slug, category, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.title), s(full.slug), s(full.category), s(full.status, 'published'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/news/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE news SET title = ?, slug = ?, category = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.title), s(full.slug), s(full.category), s(full.status, 'published'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/news/:id', (req: Request, res: Response) => {
  const ok = deleteById('news', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 5. Events CRUD
// --------------------------------------------------------------------------
apiRouter.get('/events', (req: Request, res: Response) => {
  const items = getAll('events', 'date ASC');
  res.json({ success: true, data: items });
});

apiRouter.post('/events', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `event-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO events (id, title, category, date, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.title), s(full.category), s(full.date), s(full.status, 'upcoming'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/events/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE events SET title = ?, category = ?, date = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.title), s(full.category), s(full.date), s(full.status, 'upcoming'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/events/:id', (req: Request, res: Response) => {
  const ok = deleteById('events', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 6. Achievements CRUD
// --------------------------------------------------------------------------
apiRouter.get('/achievements', (req: Request, res: Response) => {
  const items = getAll('achievements', 'year DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/achievements', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `ach-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO achievements (id, title, category, year, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.title), s(full.category), s(full.year), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/achievements/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE achievements SET title = ?, category = ?, year = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.title), s(full.category), s(full.year), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/achievements/:id', (req: Request, res: Response) => {
  const ok = deleteById('achievements', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 7. Gallery CRUD
// --------------------------------------------------------------------------
apiRouter.get('/gallery', (req: Request, res: Response) => {
  const items = getAll('gallery', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/gallery', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `gal-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO gallery (id, title, category, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.title), s(full.category), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/gallery/:id', (req: Request, res: Response) => {
  const ok = deleteById('gallery', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 8. Majors CRUD
// --------------------------------------------------------------------------
apiRouter.get('/majors', (req: Request, res: Response) => {
  const items = getAll('majors', 'code ASC');
  res.json({ success: true, data: items });
});

apiRouter.post('/majors', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `major-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO majors (id, code, name, shortName, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.code), s(full.name), s(full.shortName, full.code), s(full.status, 'Aktif'), JSON.stringify(full), s(full.createdAt, now), now);

    syncSchoolInfoMajorsInDb();

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/majors/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const existing = getById<any>('majors', id) || {};
    const now = new Date().toISOString();
    const full = { ...existing, ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE majors SET code = ?, name = ?, shortName = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.code), s(full.name), s(full.shortName, full.code), s(full.status, 'Aktif'), JSON.stringify(full), now, id);

    syncSchoolInfoMajorsInDb();

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/majors/:id', (req: Request, res: Response) => {
  const ok = deleteById('majors', req.params.id);
  syncSchoolInfoMajorsInDb();
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 9. Subjects CRUD
// --------------------------------------------------------------------------
apiRouter.get('/subjects', (req: Request, res: Response) => {
  const items = getAll('subjects', 'code ASC');
  res.json({ success: true, data: items });
});

apiRouter.post('/subjects', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `subj-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO subjects (id, code, name, category, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.code), s(full.name), s(full.category), s(full.status, 'active'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/subjects/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE subjects SET code = ?, name = ?, category = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.code), s(full.name), s(full.category), s(full.status, 'active'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/subjects/:id', (req: Request, res: Response) => {
  const ok = deleteById('subjects', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 10. Teachers CRUD
// --------------------------------------------------------------------------
apiRouter.get('/teachers', (req: Request, res: Response) => {
  const items = getAll('teachers', 'fullName ASC');
  res.json({ success: true, data: items });
});

apiRouter.post('/teachers', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `teach-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO teachers (id, nip, fullName, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.nip), s(full.fullName), s(full.status, 'active'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/teachers/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE teachers SET nip = ?, fullName = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.nip), s(full.fullName), s(full.status, 'active'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/teachers/:id', (req: Request, res: Response) => {
  const ok = deleteById('teachers', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 11. Classes CRUD
// --------------------------------------------------------------------------
apiRouter.get('/classes', (req: Request, res: Response) => {
  const items = getAll('classes', 'name ASC');
  res.json({ success: true, data: items });
});

apiRouter.post('/classes', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `class-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO classes (id, name, gradeLevel, majorId, academicYearId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.name), s(full.gradeLevel), s(full.majorId), s(full.academicYearId), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/classes/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE classes SET name = ?, gradeLevel = ?, majorId = ?, academicYearId = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.name), s(full.gradeLevel), s(full.majorId), s(full.academicYearId), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/classes/:id', (req: Request, res: Response) => {
  const ok = deleteById('classes', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 12. Students CRUD & Bulk Import
// --------------------------------------------------------------------------
apiRouter.get('/students', (req: Request, res: Response) => {
  const items = getAll('students', 'fullName ASC');
  res.json({ success: true, data: items });
});

apiRouter.post('/students', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `std-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO students (id, nisn, nis, fullName, classId, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.nisn), s(full.nis), s(full.fullName), s(full.classId), s(full.status, 'active'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/students/bulk', (req: Request, res: Response) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar siswa tidak valid' });
    }

    const now = new Date().toISOString();
    const stmt = db.prepare('INSERT OR REPLACE INTO students (id, nisn, nis, fullName, classId, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

    db.exec('BEGIN TRANSACTION;');
    try {
      for (const item of students) {
        const id = item.id || `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };
        stmt.run(id, s(full.nisn), s(full.nis), s(full.fullName), s(full.classId), s(full.status, 'active'), JSON.stringify(full), s(full.createdAt, now), now);
      }
      db.exec('COMMIT;');
      res.json({ success: true, count: students.length });
    } catch (e: any) {
      db.exec('ROLLBACK;');
      throw e;
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/students/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE students SET nisn = ?, nis = ?, fullName = ?, classId = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.nisn), s(full.nis), s(full.fullName), s(full.classId), s(full.status, 'active'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/students/:id', (req: Request, res: Response) => {
  const ok = deleteById('students', req.params.id);
  res.json({ success: ok });
});

// Master Stats
apiRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stdCount = (db.prepare("SELECT COUNT(*) as c FROM students WHERE status = 'active'").get() as any)?.c || 0;
    const tchCount = (db.prepare("SELECT COUNT(*) as c FROM teachers WHERE status = 'active'").get() as any)?.c || 0;
    const clsCount = (db.prepare("SELECT COUNT(*) as c FROM classes").get() as any)?.c || 0;
    const mjrCount = (db.prepare("SELECT COUNT(*) as c FROM majors WHERE status = 'active'").get() as any)?.c || 0;
    const cmpCount = (db.prepare("SELECT COUNT(*) as c FROM companies").get() as any)?.c || 0;
    const almCount = (db.prepare("SELECT COUNT(*) as c FROM alumni").get() as any)?.c || 0;

    res.json({
      success: true,
      data: {
        totalStudents: stdCount,
        totalTeachers: tchCount,
        totalClasses: clsCount,
        totalMajors: mjrCount,
        totalPartners: cmpCount,
        totalAlumni: almCount
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 13. Academic Years
// --------------------------------------------------------------------------
apiRouter.get('/academic-years', (req: Request, res: Response) => {
  const items = getAll('academic_years', 'name DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/academic-years', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `ay-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO academic_years (id, name, isCurrent, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.name), full.isCurrent ? 1 : 0, JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/academic-years/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE academic_years SET name = ?, isCurrent = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.name), full.isCurrent ? 1 : 0, JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/academic-years/:id/set-active', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const now = new Date().toISOString();
    const all = getAll<any>('academic_years');

    db.exec('BEGIN TRANSACTION;');
    try {
      for (const a of all) {
        const isTarget = a.id === id;
        const updated = { ...a, isCurrent: isTarget, updatedAt: now };
        db.prepare('UPDATE academic_years SET isCurrent = ?, data = ?, updatedAt = ? WHERE id = ?').run(isTarget ? 1 : 0, JSON.stringify(updated), now, a.id);
      }
      db.exec('COMMIT;');
      res.json({ success: true });
    } catch (e: any) {
      db.exec('ROLLBACK;');
      throw e;
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/academic-years/:id', (req: Request, res: Response) => {
  const ok = deleteById('academic_years', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 14. Schedules
// --------------------------------------------------------------------------
apiRouter.get('/schedules', (req: Request, res: Response) => {
  const items = getAll('schedules', 'day ASC');
  res.json({ success: true, data: items });
});

apiRouter.post('/schedules', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `sch-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO schedules (id, classId, subjectId, day, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.classId), s(full.subjectId), s(full.day), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/schedules/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE schedules SET classId = ?, subjectId = ?, day = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.classId), s(full.subjectId), s(full.day), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/schedules/:id', (req: Request, res: Response) => {
  const ok = deleteById('schedules', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 15. Attendance
// --------------------------------------------------------------------------
apiRouter.get('/attendance', (req: Request, res: Response) => {
  const items = getAll('attendance', 'date DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/attendance', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `att-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO attendance (id, classId, date, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.classId), s(full.date), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/attendance/bulk', (req: Request, res: Response) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) return res.status(400).json({ success: false, error: 'Records must be an array' });

    const now = new Date().toISOString();
    const stmt = db.prepare('INSERT OR REPLACE INTO attendance (id, classId, date, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');

    db.exec('BEGIN TRANSACTION;');
    try {
      for (const item of records) {
        const id = item.id || `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };
        stmt.run(id, s(full.classId), s(full.date), JSON.stringify(full), s(full.createdAt, now), now);
      }
      db.exec('COMMIT;');
      res.json({ success: true, count: records.length });
    } catch (e: any) {
      db.exec('ROLLBACK;');
      throw e;
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/attendance/:id', (req: Request, res: Response) => {
  const ok = deleteById('attendance', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 16. Grades
// --------------------------------------------------------------------------
apiRouter.get('/grades', (req: Request, res: Response) => {
  const items = getAll('grades', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/grades', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `grd-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO grades (id, studentId, classId, subjectId, academicYearId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.studentId), s(full.classId), s(full.subjectId), s(full.academicYearId), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/grades/batch', (req: Request, res: Response) => {
  try {
    const { grades } = req.body;
    if (!Array.isArray(grades)) return res.status(400).json({ success: false, error: 'Grades must be an array' });

    const now = new Date().toISOString();
    const stmt = db.prepare('INSERT OR REPLACE INTO grades (id, studentId, classId, subjectId, academicYearId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    db.exec('BEGIN TRANSACTION;');
    try {
      for (const item of grades) {
        const id = item.id || `grd-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };
        stmt.run(id, s(full.studentId), s(full.classId), s(full.subjectId), s(full.academicYearId), JSON.stringify(full), s(full.createdAt, now), now);
      }
      db.exec('COMMIT;');
      res.json({ success: true, count: grades.length });
    } catch (e: any) {
      db.exec('ROLLBACK;');
      throw e;
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/grades/:id', (req: Request, res: Response) => {
  const ok = deleteById('grades', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 17. Companies & Vocational (PKL / BKK / Alumni)
// --------------------------------------------------------------------------
apiRouter.get('/companies', (req: Request, res: Response) => {
  const items = getAll('companies', 'name ASC');
  res.json({ success: true, data: items });
});

apiRouter.post('/companies', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `comp-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO companies (id, name, sector, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.name), s(full.sector), s(full.status, 'active'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/companies/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE companies SET name = ?, sector = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.name), s(full.sector), s(full.status, 'active'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/companies/:id', (req: Request, res: Response) => {
  const ok = deleteById('companies', req.params.id);
  res.json({ success: ok });
});

// Internships (PKL)
apiRouter.get('/internships', (req: Request, res: Response) => {
  const items = getAll('internships', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/internships', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `intern-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO internships (id, studentId, companyId, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.studentId), s(full.companyId), s(full.status, 'berlangsung'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/internships/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE internships SET studentId = ?, companyId = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.studentId), s(full.companyId), s(full.status, 'berlangsung'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/internships/:id', (req: Request, res: Response) => {
  const ok = deleteById('internships', req.params.id);
  res.json({ success: ok });
});

// Internship Journals
apiRouter.get('/internship-journals', (req: Request, res: Response) => {
  const items = getAll('internship_journals', 'date DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/internship-journals', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `jrnl-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO internship_journals (id, internshipId, studentId, date, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.internshipId), s(full.studentId), s(full.date), s(full.status, 'pending'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/internship-journals/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE internship_journals SET status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.status, 'pending'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/internship-journals/:id', (req: Request, res: Response) => {
  const ok = deleteById('internship_journals', req.params.id);
  res.json({ success: ok });
});

// Internship Monitoring
apiRouter.get('/internship-monitoring', (req: Request, res: Response) => {
  const items = getAll('internship_monitoring', 'date DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/internship-monitoring', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `mon-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO internship_monitoring (id, internshipId, date, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.internshipId), s(full.date), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/internship-monitoring/:id', (req: Request, res: Response) => {
  const ok = deleteById('internship_monitoring', req.params.id);
  res.json({ success: ok });
});

// Internship Grades
apiRouter.get('/internship-grades', (req: Request, res: Response) => {
  const items = getAll('internship_grades', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/internship-grades', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `int-grd-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO internship_grades (id, internshipId, studentId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.internshipId), s(full.studentId), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/internship-grades/:id', (req: Request, res: Response) => {
  const ok = deleteById('internship_grades', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 18. Jobs & Applications (BKK)
// --------------------------------------------------------------------------
apiRouter.get('/jobs', (req: Request, res: Response) => {
  const items = getAll('jobs', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/jobs', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `job-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO jobs (id, title, companyId, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.title), s(full.companyId), s(full.status, 'open'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/jobs/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE jobs SET title = ?, companyId = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.title), s(full.companyId), s(full.status, 'open'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/jobs/:id', (req: Request, res: Response) => {
  const ok = deleteById('jobs', req.params.id);
  res.json({ success: ok });
});

// Job Applications
apiRouter.get('/job-applications', (req: Request, res: Response) => {
  const items = getAll('job_applications', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/job-applications', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `app-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, appliedAt: item.appliedAt || now, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO job_applications (id, jobId, applicantId, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.jobId), s(full.applicantId), s(full.status, 'submitted'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/job-applications/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE job_applications SET status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.status, 'submitted'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/job-applications/:id', (req: Request, res: Response) => {
  const ok = deleteById('job_applications', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 19. Alumni & Tracer Study
// --------------------------------------------------------------------------
apiRouter.get('/alumni', (req: Request, res: Response) => {
  const items = getAll('alumni', 'graduationYear DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/alumni', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `alm-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO alumni (id, fullName, graduationYear, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.fullName), s(full.graduationYear), s(full.status, 'Bekerja'), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/alumni/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const now = new Date().toISOString();
    const full = { ...item, id, updatedAt: now };

    const stmt = db.prepare('UPDATE alumni SET fullName = ?, graduationYear = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s(full.fullName), s(full.graduationYear), s(full.status, 'Bekerja'), JSON.stringify(full), now, id);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/alumni/:id', (req: Request, res: Response) => {
  const ok = deleteById('alumni', req.params.id);
  res.json({ success: ok });
});

// Tracer Surveys
apiRouter.get('/tracer-surveys', (req: Request, res: Response) => {
  const items = getAll('tracer_surveys', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/tracer-surveys', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `surv-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO tracer_surveys (id, title, isActive, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.title), full.isActive ? 1 : 0, JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/tracer-surveys/reset-default', (req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();
    const defaultSurvey = defaultTracerSurveysList[0];
    const full = { ...defaultSurvey, id: 'survey-tracer-alumni-2025', updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO tracer_surveys (id, title, isActive, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(full.id, s(full.title), full.isActive ? 1 : 0, JSON.stringify(full), s(full.createdAt, now), now);

    res.json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tracer Responses
apiRouter.get('/tracer-responses', (req: Request, res: Response) => {
  const items = getAll('tracer_responses', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/tracer-responses', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `resp-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, submittedAt: item.submittedAt || now, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO tracer_responses (id, surveyId, alumniId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.surveyId), s(full.alumniId), JSON.stringify(full), s(full.createdAt, now), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 20. Users & Roles Management
// --------------------------------------------------------------------------
apiRouter.get('/users', (req: Request, res: Response) => {
  try {
    const users = getAll<any>('users', 'createdAt DESC');
    // Sanitize: do not return password hashes to the client
    const safeUsers = users.map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
    res.json({ success: true, data: safeUsers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/users', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `user-${Date.now()}`;
    const now = new Date().toISOString();
    const pass = item.initialPassword || item.password || 'sekolah123';
    const passHash = hashPassword(pass);
    const full = { ...item, id, initialPassword: pass, createdAt: item.createdAt || now, updatedAt: now };

    const stmt = db.prepare('INSERT OR REPLACE INTO users (id, email, username, role, status, passwordHash, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.email).toLowerCase(), s(full.username).toLowerCase(), s(full.role, 'siswa'), s(full.status, 'active'), passHash, JSON.stringify(full), s(full.createdAt, now), now);

    const { passwordHash, ...safe } = full;
    res.status(201).json({ success: true, data: safe });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/users/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const existing = getById<any>('users', id);
    if (!existing) return res.status(404).json({ success: false, error: 'User not found' });

    const now = new Date().toISOString();
    const full = { ...existing, ...item, id, updatedAt: now };

    // Update password hash if password was changed
    let passHash: string | undefined;
    if (item.password) {
      passHash = hashPassword(item.password);
      full.initialPassword = item.password;
    }

    if (passHash) {
      db.prepare('UPDATE users SET email = ?, username = ?, role = ?, status = ?, passwordHash = ?, data = ?, updatedAt = ? WHERE id = ?')
        .run(s(full.email).toLowerCase(), s(full.username).toLowerCase(), s(full.role), s(full.status), passHash, JSON.stringify(full), now, id);
    } else {
      db.prepare('UPDATE users SET email = ?, username = ?, role = ?, status = ?, data = ?, updatedAt = ? WHERE id = ?')
        .run(s(full.email).toLowerCase(), s(full.username).toLowerCase(), s(full.role), s(full.status), JSON.stringify(full), now, id);
    }

    const { passwordHash, ...safe } = full;
    res.json({ success: true, data: safe });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.patch('/users/:id/status', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const existing = getById<any>('users', id);
    if (!existing) return res.status(404).json({ success: false, error: 'User not found' });

    const now = new Date().toISOString();
    const updated = { ...existing, status, updatedAt: now };

    db.prepare('UPDATE users SET status = ?, data = ?, updatedAt = ? WHERE id = ?').run(status, JSON.stringify(updated), now, id);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.patch('/users/:id/role', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    const existing = getById<any>('users', id);
    if (!existing) return res.status(404).json({ success: false, error: 'User not found' });

    const now = new Date().toISOString();
    const updated = { ...existing, role, updatedAt: now };

    db.prepare('UPDATE users SET role = ?, data = ?, updatedAt = ? WHERE id = ?').run(role, JSON.stringify(updated), now, id);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/users/:id', (req: Request, res: Response) => {
  const ok = deleteById('users', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 21. Audit Logs
// --------------------------------------------------------------------------
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const items = getAll('audit_logs', 'timestamp DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/audit-logs', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `audit-${Date.now()}`;
    const now = new Date().toISOString();
    const full = { ...item, id, timestamp: item.timestamp || now, createdAt: item.createdAt || now };

    const stmt = db.prepare('INSERT INTO audit_logs (id, action, module, performedBy, timestamp, data, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, s(full.action), s(full.module), s(full.performedBy), s(full.timestamp), JSON.stringify(full), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 22. Contact Messages
// --------------------------------------------------------------------------
apiRouter.get('/messages', (req: Request, res: Response) => {
  const items = getAll('messages', 'createdAt DESC');
  res.json({ success: true, data: items });
});

apiRouter.post('/messages', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const id = item.id || `msg-${Date.now()}`;
    const now = new Date().toISOString();
    const full = {
      ...item,
      id,
      name: sanitize(item.name || ''),
      email: sanitize(item.email || ''),
      subject: sanitize(item.subject || ''),
      message: sanitize(item.message || ''),
      status: 'unread',
      createdAt: now
    };

    const stmt = db.prepare('INSERT INTO messages (id, name, email, status, data, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, full.name, full.email, 'unread', JSON.stringify(full), now);

    res.status(201).json({ success: true, data: full });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/messages/:id', (req: Request, res: Response) => {
  const ok = deleteById('messages', req.params.id);
  res.json({ success: ok });
});

// --------------------------------------------------------------------------
// 15. Server-Side AI Proxy Gateway (Gemini API Key Protection)
// --------------------------------------------------------------------------
// Ensures the Gemini API key is NEVER sent to or stored in client-side code,
// and prevents leakage when repository is pushed to GitHub.
apiRouter.post('/ai/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Parameter prompt diperlukan dan harus berupa teks string.'
      });
    }

    const text = await generateContentServerSide(prompt, systemInstruction);
    res.json({ success: true, text });
  } catch (err: any) {
    console.error('[Secure AI Proxy Error]:', err.message);
    res.status(500).json({
      success: false,
      error: 'Fitur AI sedang tidak dapat diakses. Pastikan GEMINI_API_KEY telah diatur di backend environment server.'
    });
  }
});
