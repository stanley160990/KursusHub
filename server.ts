import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const IS_PROD = process.env.NODE_ENV === 'production';
const API_KEY = process.env.API_INTEGRATION_KEY || 'kursus_api_secret_key_2026';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'AdminSecret2026!';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ------------------------------------------------------------------
// PostgreSQL Connection Pool Setup & Schema Initialization
// ------------------------------------------------------------------
let pgPool: pg.Pool | null = null;
let pgConnected = false;

async function initDatabaseSchema() {
  if (!pgPool) return;
  try {
    console.log('[PostgreSQL] Verifying & initializing database schema...');

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS universities (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS faculties (
        id VARCHAR(64) PRIMARY KEY,
        university_id VARCHAR(64) NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS study_programs (
        id VARCHAR(64) PRIMARY KEY,
        faculty_id VARCHAR(64) NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        university_id VARCHAR(64),
        university_name VARCHAR(255),
        faculty_id VARCHAR(64),
        faculty_name VARCHAR(255),
        study_program_id VARCHAR(64),
        study_program_name VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS course_dates (
        id SERIAL PRIMARY KEY,
        course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        execution_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_course_date UNIQUE (course_id, execution_date)
      );
    `);

    // Ensure columns exist on existing databases
    await pgPool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS faculty_id VARCHAR(64);`);
    await pgPool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS faculty_name VARCHAR(255);`);
    await pgPool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS study_program_id VARCHAR(64);`);
    await pgPool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS study_program_name VARCHAR(255);`);
    await pgPool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(64) PRIMARY KEY,
        course_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        npm VARCHAR(50) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        university VARCHAR(255) NOT NULL,
        faculty VARCHAR(255) NOT NULL,
        study_program VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        access_hours VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS instructors_assistants (
        id VARCHAR(64) PRIMARY KEY,
        course_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role_type VARCHAR(50) NOT NULL,
        specific_role VARCHAR(255) NOT NULL,
        university VARCHAR(255),
        study_program VARCHAR(255),
        username VARCHAR(100),
        password_hash VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id VARCHAR(64) PRIMARY KEY,
        course_id VARCHAR(64) NOT NULL,
        npm VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        login_time_gmt VARCHAR(150) NOT NULL,
        client_ip VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Always seed default admin user into PostgreSQL admin_users table
    const adminPassHash = await bcrypt.hash(ADMIN_PASS, 10);
    await pgPool.query(
      `INSERT INTO admin_users (id, username, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO UPDATE SET password_hash = $3`,
      ['admin-01', ADMIN_USER, adminPassHash]
    );

    console.log('[PostgreSQL] Database schema structure & admin user verified successfully.');

    // Optional seeding only when explicitly requested via env variable SEED_DEFAULT_DATA=true
    if (process.env.SEED_DEFAULT_DATA === 'true') {
      const courseRes = await pgPool.query('SELECT COUNT(*) FROM courses');
      if (parseInt(courseRes.rows[0].count, 10) === 0) {
        console.log('[PostgreSQL] SEED_DEFAULT_DATA=true detected. Seeding default records...');
        for (const c of memoryCourses) {
          await pgPool.query(
            `INSERT INTO courses (id, name, description, university_id, university_name, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
            [c.id, c.name, c.description, c.university_id || '', c.university_name || '', c.status || 'active', c.created_at]
          );
        }
        for (const s of memoryStudents) {
          await pgPool.query(
            `INSERT INTO students (id, course_id, name, npm, class_name, university, faculty, study_program, password_hash, access_hours, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
            [s.id, s.course_id, s.name, s.npm, s.class_name, s.university, s.faculty, s.study_program, s.password_hash, s.access_hours, s.created_at]
          );
        }
        for (const i of memoryInstructors) {
          await pgPool.query(
            `INSERT INTO instructors_assistants (id, course_id, name, role_type, specific_role, university, study_program, username, password_hash, email, phone, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING`,
            [i.id, i.course_id, i.name, i.role_type, i.specific_role, i.university, i.study_program, i.username, i.password_hash, i.email, i.phone, i.created_at]
          );
        }
        for (const l of memoryLogins) {
          await pgPool.query(
            `INSERT INTO login_logs (id, course_id, npm, name, login_time_gmt, client_ip, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
            [l.id, l.course_id, l.npm, l.nama, l.login_time_gmt, l.client_ip, l.created_at]
          );
        }
        console.log('[PostgreSQL] Default records seeded successfully.');
      }
    }
  } catch (err) {
    console.error('[PostgreSQL Schema Init Error]:', err);
  }
}

if (process.env.DATABASE_URL || process.env.POSTGRES_HOST) {
  try {
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL || undefined,
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'kursushub_db',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres_secret_password',
      connectionTimeoutMillis: 2000,
    });

    pgPool.query('SELECT NOW()', async (err) => {
      if (err) {
        console.log('[PostgreSQL] Database not reachable locally, running in memory-resilient mode:', err.message);
        pgConnected = false;
      } else {
        console.log('[PostgreSQL] Connected successfully to database');
        pgConnected = true;
        await initDatabaseSchema();
      }
    });
  } catch (err) {
    console.log('[PostgreSQL] Pool initialization skipped:', err);
  }
}

// ------------------------------------------------------------------
// In-Memory Fallback State (Students, Instructors, Logins)
// ------------------------------------------------------------------
interface InMemoryLogin {
  id: string;
  course_id: string;
  npm: string;
  nama: string;
  login_time_gmt: string;
  client_ip: string;
  created_at: string;
}

interface InMemoryStudent {
  id: string;
  course_id: string;
  name: string;
  npm: string;
  class_name: string;
  university: string;
  faculty: string;
  study_program: string;
  password_hash: string;
  plain_password_preview?: string;
  access_hours: string;
  created_at: string;
}

interface InMemoryCourse {
  id: string;
  name: string;
  description: string;
  university_id?: string;
  university_name?: string;
  faculty_id?: string;
  faculty_name?: string;
  study_program_id?: string;
  study_program_name?: string;
  dates: string[];
  status: 'active' | 'inactive';
  created_at: string;
}

interface InMemoryInstructor {
  id: string;
  course_id: string;
  name: string;
  role_type: 'instruktur' | 'asisten';
  specific_role: string;
  university: string;
  study_program: string;
  username: string;
  password_hash: string;
  plain_password_preview?: string;
  email: string;
  phone: string;
  created_at: string;
}

const memoryCourses: InMemoryCourse[] = [
  {
    id: 'crs-01',
    name: 'Arsitektur Cloud & DevOps Modern',
    description: 'Pelatihan komprehensif arsitektur cloud, containerization Docker, orkestrasi microservices, dan implementasi CI/CD.',
    university_id: 'univ-01',
    university_name: 'Universitas Indonesia',
    dates: ['2026-11-02', '2026-11-09', '2026-11-16'],
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'crs-02',
    name: 'Full-Stack Web Engineering Modern',
    description: 'Pengembangan web berskala industri menggunakan React, Node.js/Express, relational database PostgreSQL, dan integrasi API.',
    university_id: 'univ-02',
    university_name: 'Institut Teknologi Bandung',
    dates: ['2026-11-05', '2026-11-12', '2026-11-19', '2026-11-26'],
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'crs-03',
    name: 'Kecerdasan Buatan & Pemrosesan Citra Digital',
    description: 'Konsep dasar hingga implementasi deep learning, computer vision, dan integrasi pipeline AI berbasis REST API.',
    university_id: 'univ-03',
    university_name: 'Universitas Gadjah Mada',
    dates: ['2026-12-01', '2026-12-08'],
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

const memoryLogins: InMemoryLogin[] = [
  {
    id: 'log-01',
    course_id: 'crs-01',
    npm: 'G0143501',
    nama: 'Budi Santoso',
    login_time_gmt: 'Monday, 18 Oct 2026 08:05:14 GMT',
    client_ip: '192.168.1.15',
    created_at: new Date().toISOString(),
  },
  {
    id: 'log-02',
    course_id: 'crs-01',
    npm: 'G0143502',
    nama: 'Siti Rahmawati',
    login_time_gmt: 'Monday, 18 Oct 2026 08:12:30 GMT',
    client_ip: '192.168.1.28',
    created_at: new Date().toISOString(),
  },
  {
    id: 'log-03',
    course_id: 'crs-02',
    npm: 'G0143503',
    nama: 'Ahmad Fauzi',
    login_time_gmt: 'Monday, 18 Oct 2026 13:02:45 GMT',
    client_ip: '192.168.1.42',
    created_at: new Date().toISOString(),
  },
];

const memoryStudents: InMemoryStudent[] = [
  {
    id: 'std-01',
    course_id: 'crs-01',
    name: 'Budi Santoso',
    npm: 'G0143501',
    class_name: '4IA01',
    university: 'Universitas Indonesia',
    faculty: 'Fakultas Ilmu Komputer',
    study_program: 'Teknik Informatika',
    password_hash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plain_password_preview: 'Mhs2026!#',
    access_hours: '08:00 - 12:00',
    created_at: new Date().toISOString(),
  },
  {
    id: 'std-02',
    course_id: 'crs-01',
    name: 'Siti Rahmawati',
    npm: 'G0143502',
    class_name: '4IA01',
    university: 'Universitas Indonesia',
    faculty: 'Fakultas Ilmu Komputer',
    study_program: 'Sistem Informasi',
    password_hash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plain_password_preview: 'Mhs2026!#',
    access_hours: '08:00 - 12:00',
    created_at: new Date().toISOString(),
  },
  {
    id: 'std-03',
    course_id: 'crs-02',
    name: 'Ahmad Fauzi',
    npm: 'G0143503',
    class_name: '3KA02',
    university: 'Institut Teknologi Bandung',
    faculty: 'Sekolah Teknik Elektro & Informatika',
    study_program: 'Sistem & Teknologi Informasi',
    password_hash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plain_password_preview: 'Mhs2026!#',
    access_hours: '13:00 - 17:00',
    created_at: new Date().toISOString(),
  },
  {
    id: 'std-04',
    course_id: 'crs-02',
    name: 'Clara Anindya',
    npm: 'G0143504',
    class_name: '3KA02',
    university: 'Institut Teknologi Bandung',
    faculty: 'Sekolah Teknik Elektro & Informatika',
    study_program: 'Teknik Informatika',
    password_hash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plain_password_preview: 'Mhs2026!#',
    access_hours: '13:00 - 17:00',
    created_at: new Date().toISOString(),
  },
];

const memoryInstructors: InMemoryInstructor[] = [
  {
    id: 'inst-01',
    course_id: 'crs-01',
    name: 'Dr. Ir. Hendra Gunawan, M.T.',
    role_type: 'instruktur',
    specific_role: 'Instruktur Utama Cloud Computing & DevOps',
    university: 'Universitas Indonesia',
    study_program: 'Teknik Komputer',
    username: 'hendra.gunawan',
    password_hash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plain_password_preview: 'H3ndrAGun4w4n982K',
    email: 'hendra.gunawan@halkh-systems.com',
    phone: '+62 812-3456-7801',
    created_at: new Date().toISOString(),
  },
  {
    id: 'inst-02',
    course_id: 'crs-01',
    name: 'Fajar Pratama, S.Kom.',
    role_type: 'asisten',
    specific_role: 'Koordinator Asisten Lab & Infrastruktur Docker',
    university: 'Universitas Indonesia',
    study_program: 'Teknik Informatika',
    username: 'fajar.pratama',
    password_hash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plain_password_preview: 'F4j4rPrat4m4928X',
    email: 'fajar.pratama@halkh-systems.com',
    phone: '+62 812-3456-7802',
    created_at: new Date().toISOString(),
  },
  {
    id: 'inst-03',
    course_id: 'crs-02',
    name: 'Nadia Putri, M.Cs.',
    role_type: 'instruktur',
    specific_role: 'Instruktur Utama Full-Stack Engineering',
    university: 'Institut Teknologi Bandung',
    study_program: 'Teknik Informatika',
    username: 'nadia.putri',
    password_hash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plain_password_preview: 'N4di4Putr1Eng82P',
    email: 'nadia.putri@halkh-systems.com',
    phone: '+62 812-3456-7803',
    created_at: new Date().toISOString(),
  },
  {
    id: 'inst-04',
    course_id: 'crs-02',
    name: 'Rizky Ramadhan, S.Tr.Kom.',
    role_type: 'asisten',
    specific_role: 'Asisten Pendamping Coding & Review Tugas',
    university: 'Institut Teknologi Bandung',
    study_program: 'Sistem & Teknologi Informasi',
    username: 'rizky.ramadhan',
    password_hash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plain_password_preview: 'R1zkyRam4dh4n34Q',
    email: 'rizky.r@halkh-systems.com',
    phone: '+62 812-3456-7804',
    created_at: new Date().toISOString(),
  },
];

// Helper to get formatted GMT: "Day, DD Mon YYYY HH:mm:ss GMT"
function generateCurrentGMT(): string {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date();
  const dayName = DAYS[d.getUTCDay()];
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');

  return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
}

// ------------------------------------------------------------------
// Health Check Endpoint
// ------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    postgresConnected: pgConnected,
    version: '1.0.0',
    system: 'KursusHub - halkh-systems.com',
  });
});

// ------------------------------------------------------------------
// Admin Authentication (Web UI login)
// ------------------------------------------------------------------
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  let authenticated = false;
  let adminUsername = String(username).trim();
  const inputPassword = String(password);

  if (pgPool && pgConnected) {
    try {
      const dbResult = await pgPool.query('SELECT * FROM admin_users WHERE username = $1', [adminUsername]);
      if (dbResult.rows.length > 0) {
        const dbAdmin = dbResult.rows[0];
        let match = false;
        if (inputPassword === dbAdmin.password_hash) {
          match = true;
        } else {
          try {
            match = await bcrypt.compare(inputPassword, dbAdmin.password_hash);
          } catch {
            match = false;
          }
        }
        if (match) {
          authenticated = true;
          adminUsername = dbAdmin.username;
          await pgPool.query('UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [dbAdmin.id]);
        } else {
          return res.status(401).json({ error: 'Password admin tidak valid.' });
        }
      } else {
        return res.status(401).json({ error: 'Username admin tidak terdaftar di database.' });
      }
    } catch (err) {
      console.error('[PostgreSQL Admin Auth Error]:', err);
    }
  }

  if (!authenticated) {
    const isUserValid = adminUsername === ADMIN_USER;
    const isPassValid = inputPassword === ADMIN_PASS;
    if (isUserValid && isPassValid) {
      authenticated = true;
      adminUsername = ADMIN_USER;
    }
  }

  if (!authenticated) {
    return res.status(401).json({ error: 'Kredensial login admin tidak valid.' });
  }

  const token = `kh_session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  return res.json({
    success: true,
    message: 'Login berhasil.',
    admin: {
      username: adminUsername,
      token,
      sessionTimeoutMinutes: 15,
      expiresAt: Date.now() + 15 * 60 * 1000,
    },
  });
});

// ------------------------------------------------------------------
// Sync endpoints between Client and Server memory / database
// ------------------------------------------------------------------
app.get('/api/data/all', async (_req: Request, res: Response) => {
  try {
    if (pgPool && pgConnected) {
      const coursesRes = await pgPool.query('SELECT * FROM courses ORDER BY created_at DESC');
      const datesRes = await pgPool.query('SELECT course_id, execution_date FROM course_dates ORDER BY execution_date ASC');
      const studentsRes = await pgPool.query('SELECT * FROM students ORDER BY created_at DESC');
      const instructorsRes = await pgPool.query('SELECT * FROM instructors_assistants ORDER BY created_at DESC');
      const loginsRes = await pgPool.query('SELECT * FROM login_logs ORDER BY created_at DESC');
      const univsRes = await pgPool.query('SELECT * FROM universities ORDER BY created_at ASC');
      const facsRes = await pgPool.query('SELECT * FROM faculties ORDER BY created_at ASC');
      const prodsRes = await pgPool.query('SELECT * FROM study_programs ORDER BY created_at ASC');

      const datesMap: Record<string, string[]> = {};
      for (const r of datesRes.rows) {
        if (!datesMap[r.course_id]) {
          datesMap[r.course_id] = [];
        }
        let dateStr = '';
        if (r.execution_date instanceof Date) {
          dateStr = r.execution_date.toISOString().split('T')[0];
        } else {
          dateStr = String(r.execution_date).split('T')[0];
        }
        if (dateStr && !datesMap[r.course_id].includes(dateStr)) {
          datesMap[r.course_id].push(dateStr);
        }
      }

      const mappedUniversities = univsRes.rows.map((u) => {
        const univFacs = facsRes.rows
          .filter((f) => f.university_id === u.id)
          .map((f) => {
            const facProds = prodsRes.rows
              .filter((p) => p.faculty_id === f.id)
              .map((p) => ({ id: p.id, name: p.name }));
            return {
              id: f.id,
              name: f.name,
              studyPrograms: facProds,
            };
          });
        return {
          id: u.id,
          code: u.code || '',
          name: u.name,
          faculties: univFacs,
          createdAt: u.created_at,
        };
      });

      const mappedCourses = coursesRes.rows.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        universityId: c.university_id || '',
        universityName: c.university_name || '',
        facultyId: c.faculty_id || '',
        facultyName: c.faculty_name || '',
        studyProgramId: c.study_program_id || '',
        studyProgramName: c.study_program_name || '',
        dates: datesMap[c.id] || [],
        status: c.status || 'active',
        createdAt: c.created_at,
      }));

      const mappedStudents = studentsRes.rows.map((s) => ({
        id: s.id,
        courseId: s.course_id,
        name: s.name,
        npm: s.npm,
        className: s.class_name,
        university: s.university,
        faculty: s.faculty,
        studyProgram: s.study_program,
        passwordHash: s.password_hash,
        accessHours: s.access_hours,
        createdAt: s.created_at,
      }));

      const mappedInstructors = instructorsRes.rows.map((i) => ({
        id: i.id,
        courseId: i.course_id,
        name: i.name,
        roleType: i.role_type,
        specificRole: i.specific_role,
        university: i.university || '',
        studyProgram: i.study_program || '',
        username: i.username || '',
        passwordHash: i.password_hash || '',
        email: i.email || '',
        phone: i.phone || '',
        createdAt: i.created_at,
      }));

      const mappedLogins = loginsRes.rows.map((l) => ({
        id: l.id,
        courseId: l.course_id,
        npm: l.npm,
        name: l.name,
        loginTimeGmt: l.login_time_gmt,
        clientIp: l.client_ip,
        createdAt: l.created_at,
      }));

      return res.json({
        postgresConnected: true,
        universities: mappedUniversities,
        courses: mappedCourses,
        students: mappedStudents,
        instructors: mappedInstructors,
        logins: mappedLogins,
      });
    }

    return res.json({
      postgresConnected: false,
      courses: memoryCourses,
      students: memoryStudents,
      instructors: memoryInstructors,
      logins: memoryLogins,
    });
  } catch (err) {
    console.error('[PostgreSQL Fetch All Data Error]:', err);
    return res.status(500).json({ postgresConnected: false, error: String(err) });
  }
});

// ------------------------------------------------------------------
// Reference Data Sync (Universities, Faculties, Study Programs)
// ------------------------------------------------------------------
app.post('/api/sync/university', async (req: Request, res: Response) => {
  try {
    const univ = req.body;
    if (univ && univ.id && univ.name) {
      if (pgPool && pgConnected) {
        await pgPool.query(
          `INSERT INTO universities (id, code, name)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET code = $2, name = $3`,
          [univ.id, univ.code || '', univ.name]
        );
        console.log(`[PostgreSQL] Upserted university: ${univ.name} (${univ.id})`);
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[PostgreSQL Sync University Error]:', err);
    return res.status(500).json({ success: false });
  }
});

app.delete('/api/sync/university/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (pgPool && pgConnected) {
      await pgPool.query('DELETE FROM universities WHERE id = $1', [id]);
      console.log(`[PostgreSQL] Deleted university ID: ${id}`);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[PostgreSQL Delete University Error]:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.post('/api/sync/faculty', async (req: Request, res: Response) => {
  try {
    const { universityId, faculty } = req.body;
    if (universityId && faculty && faculty.id && faculty.name) {
      if (pgPool && pgConnected) {
        await pgPool.query(
          `INSERT INTO faculties (id, university_id, name)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET name = $3`,
          [faculty.id, universityId, faculty.name]
        );
        console.log(`[PostgreSQL] Upserted faculty: ${faculty.name} (${faculty.id})`);
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[PostgreSQL Sync Faculty Error]:', err);
    return res.status(500).json({ success: false });
  }
});

app.delete('/api/sync/faculty/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (pgPool && pgConnected) {
      await pgPool.query('DELETE FROM faculties WHERE id = $1', [id]);
      console.log(`[PostgreSQL] Deleted faculty ID: ${id}`);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[PostgreSQL Delete Faculty Error]:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.post('/api/sync/study_program', async (req: Request, res: Response) => {
  try {
    const { facultyId, program } = req.body;
    if (facultyId && program && program.id && program.name) {
      if (pgPool && pgConnected) {
        await pgPool.query(
          `INSERT INTO study_programs (id, faculty_id, name)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET name = $3`,
          [program.id, facultyId, program.name]
        );
        console.log(`[PostgreSQL] Upserted study program: ${program.name} (${program.id})`);
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[PostgreSQL Sync Study Program Error]:', err);
    return res.status(500).json({ success: false });
  }
});

app.delete('/api/sync/study_program/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (pgPool && pgConnected) {
      await pgPool.query('DELETE FROM study_programs WHERE id = $1', [id]);
      console.log(`[PostgreSQL] Deleted study program ID: ${id}`);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[PostgreSQL Delete Study Program Error]:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.post('/api/sync/student', async (req: Request, res: Response) => {
  try {
    const student = req.body;
    if (student && student.npm) {
      const idx = memoryStudents.findIndex((s) => s.id === student.id || (s.npm === student.npm && s.course_id === student.courseId));
      const record: InMemoryStudent = {
        id: student.id,
        course_id: student.courseId || student.course_id,
        name: student.name,
        npm: student.npm,
        class_name: student.className || student.class_name,
        university: student.university,
        faculty: student.faculty,
        study_program: student.studyProgram || student.study_program,
        password_hash: student.passwordHash || student.password_hash,
        plain_password_preview: student.plainPasswordPreview || student.plain_password_preview,
        access_hours: student.accessHours || student.access_hours,
        created_at: student.createdAt || student.created_at || new Date().toISOString(),
      };
      if (idx >= 0) {
        memoryStudents[idx] = record;
      } else {
        memoryStudents.push(record);
      }

      if (pgPool && pgConnected) {
        try {
          await pgPool.query(
            `INSERT INTO students (id, course_id, name, npm, class_name, university, faculty, study_program, password_hash, access_hours)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO UPDATE SET name = $3, npm = $4, class_name = $5, university = $6, faculty = $7, study_program = $8, password_hash = $9, access_hours = $10`,
            [record.id, record.course_id, record.name, record.npm, record.class_name, record.university, record.faculty, record.study_program, record.password_hash, record.access_hours]
          );
          console.log(`[PostgreSQL] Upserted student: ${record.name} (${record.npm})`);
        } catch (dbErr) {
          console.error('[PostgreSQL Student Sync Error]:', dbErr);
        }
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[Sync Student Route Error]:', err);
    return res.status(500).json({ success: false });
  }
});

app.delete('/api/sync/student/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryStudents.findIndex((s) => s.id === id);
    if (idx >= 0) {
      memoryStudents.splice(idx, 1);
    }
    if (pgPool && pgConnected) {
      await pgPool.query('DELETE FROM students WHERE id = $1', [id]);
      console.log(`[PostgreSQL] Deleted student ID: ${id}`);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[PostgreSQL Delete Student Error]:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.post('/api/sync/instructor', async (req: Request, res: Response) => {
  try {
    const inst = req.body;
    if (inst && inst.name) {
      const idx = memoryInstructors.findIndex((i) => i.id === inst.id);
      const record: InMemoryInstructor = {
        id: inst.id,
        course_id: inst.courseId || inst.course_id,
        name: inst.name,
        role_type: inst.roleType || inst.role_type,
        specific_role: inst.specificRole || inst.specific_role,
        university: inst.university || '',
        study_program: inst.studyProgram || inst.study_program || '',
        username: inst.username || '',
        password_hash: inst.passwordHash || inst.password_hash || '',
        plain_password_preview: inst.plainPasswordPreview || inst.plain_password_preview || '',
        email: inst.email || '',
        phone: inst.phone || '',
        created_at: inst.createdAt || inst.created_at || new Date().toISOString(),
      };
      if (idx >= 0) {
        memoryInstructors[idx] = record;
      } else {
        memoryInstructors.push(record);
      }

      if (pgPool && pgConnected) {
        try {
          await pgPool.query(
            `INSERT INTO instructors_assistants (id, course_id, name, role_type, specific_role, university, study_program, username, password_hash, email, phone)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (id) DO UPDATE SET name = $3, role_type = $4, specific_role = $5, university = $6, study_program = $7, username = $8, password_hash = $9, email = $10, phone = $11`,
            [record.id, record.course_id, record.name, record.role_type, record.specific_role, record.university, record.study_program, record.username, record.password_hash, record.email, record.phone]
          );
          console.log(`[PostgreSQL] Upserted instructor: ${record.name} (${record.role_type})`);
        } catch (dbErr) {
          console.error('[PostgreSQL Instructor Sync Error]:', dbErr);
        }
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[Sync Instructor Route Error]:', err);
    return res.status(500).json({ success: false });
  }
});

app.delete('/api/sync/instructor/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryInstructors.findIndex((i) => i.id === id);
    if (idx >= 0) {
      memoryInstructors.splice(idx, 1);
    }
    if (pgPool && pgConnected) {
      await pgPool.query('DELETE FROM instructors_assistants WHERE id = $1', [id]);
      console.log(`[PostgreSQL] Deleted instructor ID: ${id}`);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[PostgreSQL Delete Instructor Error]:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.post('/api/sync/course', async (req: Request, res: Response) => {
  try {
    const course = req.body;
    if (course && course.id) {
      const idx = memoryCourses.findIndex((c) => c.id === course.id);
      const record: InMemoryCourse = {
        id: course.id,
        name: course.name,
        description: course.description || '',
        university_id: course.universityId || course.university_id || '',
        university_name: course.universityName || course.university_name || '',
        faculty_id: course.facultyId || course.faculty_id || '',
        faculty_name: course.facultyName || course.faculty_name || '',
        study_program_id: course.studyProgramId || course.study_program_id || '',
        study_program_name: course.studyProgramName || course.study_program_name || '',
        dates: Array.isArray(course.dates) ? course.dates : [],
        status: (course.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
        created_at: course.createdAt || course.created_at || new Date().toISOString(),
      };
      if (idx >= 0) {
        memoryCourses[idx] = record;
      } else {
        memoryCourses.push(record);
      }

      if (pgPool && pgConnected) {
        try {
          await pgPool.query(
            `INSERT INTO courses (id, name, description, university_id, university_name, faculty_id, faculty_name, study_program_id, study_program_name, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO UPDATE SET name = $2, description = $3, university_id = $4, university_name = $5, faculty_id = $6, faculty_name = $7, study_program_id = $8, study_program_name = $9, status = $10, updated_at = CURRENT_TIMESTAMP`,
            [record.id, record.name, record.description, record.university_id, record.university_name, record.faculty_id, record.faculty_name, record.study_program_id, record.study_program_name, record.status]
          );

          // Delete existing dates and re-insert new execution dates
          await pgPool.query('DELETE FROM course_dates WHERE course_id = $1', [record.id]);
          if (Array.isArray(record.dates)) {
            for (const dStr of record.dates) {
              const cleanDate = String(dStr).trim();
              if (cleanDate) {
                await pgPool.query(
                  `INSERT INTO course_dates (course_id, execution_date)
                   VALUES ($1, $2)
                   ON CONFLICT (course_id, execution_date) DO NOTHING`,
                  [record.id, cleanDate]
                );
              }
            }
          }
          console.log(`[PostgreSQL] Upserted course: ${record.name} (${record.status}) with ${record.dates.length} execution dates`);
        } catch (dbErr) {
          console.error('[PostgreSQL Course Sync Error]:', dbErr);
        }
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[Sync Course Route Error]:', err);
    return res.status(500).json({ success: false });
  }
});

app.delete('/api/sync/course/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryCourses.findIndex((c) => c.id === id);
    if (idx >= 0) {
      memoryCourses.splice(idx, 1);
    }
    if (pgPool && pgConnected) {
      await pgPool.query('DELETE FROM students WHERE course_id = $1', [id]);
      await pgPool.query('DELETE FROM instructors_assistants WHERE course_id = $1', [id]);
      await pgPool.query('DELETE FROM login_logs WHERE course_id = $1', [id]);
      await pgPool.query('DELETE FROM courses WHERE id = $1', [id]);
      console.log(`[PostgreSQL] Deleted course ID: ${id} and related children`);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[PostgreSQL Delete Course Error]:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// ------------------------------------------------------------------
// REQUIRED EXTERNAL API 1: POST /api/external/logins
// Specifically provided for external systems to record student login
// ------------------------------------------------------------------
app.post('/api/external/logins', async (req: Request, res: Response) => {
  try {
    const providedApiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    // Validate API key if configured
    if (API_KEY && providedApiKey !== API_KEY) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Akses ditolak. Header X-API-Key tidak valid atau tidak disertakan.',
      });
    }

    const { course_id, npm, nama, login_time } = req.body;

    if (!course_id || !npm || !nama) {
      return res.status(400).json({
        status: 'error',
        code: 'BAD_REQUEST',
        message: 'Parameter "course_id", "npm", dan "nama" wajib disertakan dalam request body JSON.',
      });
    }

    // Determine login time in GMT: use provided or auto-generate formatted GMT
    const finalLoginTimeGMT = login_time && typeof login_time === 'string' && login_time.trim().length > 0
      ? login_time.trim()
      : generateCurrentGMT();

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newRecord: InMemoryLogin = {
      id: logId,
      course_id: String(course_id).trim(),
      npm: String(npm).trim(),
      nama: String(nama).trim(),
      login_time_gmt: finalLoginTimeGMT,
      client_ip: clientIp.split(',')[0].trim(),
      created_at: new Date().toISOString(),
    };

    // If PostgreSQL is active, insert into PostgreSQL
    if (pgPool && pgConnected) {
      try {
        await pgPool.query(
          `INSERT INTO login_logs (id, course_id, npm, name, login_time_gmt, client_ip)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newRecord.id, newRecord.course_id, newRecord.npm, newRecord.nama, newRecord.login_time_gmt, newRecord.client_ip]
        );
      } catch (dbErr) {
        console.warn('[PostgreSQL Insert Log Warning]:', dbErr);
      }
    }

    // Always push to in-memory list so instant query reflects it
    memoryLogins.unshift(newRecord);

    return res.status(201).json({
      status: 'success',
      code: 'CREATED',
      message: 'Data login mahasiswa berhasil dicatat ke dalam sistem KursusHub.',
      data: {
        id: newRecord.id,
        course_id: newRecord.course_id,
        npm: newRecord.npm,
        nama: newRecord.nama,
        login_time_gmt: newRecord.login_time_gmt,
        recorded_at: newRecord.created_at,
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: `Terjadi kesalahan saat memproses data login: ${errMessage}`,
    });
  }
});

interface CourseInfoResult {
  course_id: string;
  course_name: string;
  tgl_kursus: string[];
  active: boolean;
}

async function fetchCourseInfo(courseId: string): Promise<CourseInfoResult> {
  if (!courseId) {
    return {
      course_id: '',
      course_name: '',
      tgl_kursus: [],
      active: false,
    };
  }

  if (pgPool && pgConnected) {
    try {
      const cRes = await pgPool.query('SELECT * FROM courses WHERE id = $1 LIMIT 1', [courseId]);
      if (cRes.rows.length > 0) {
        const cRow = cRes.rows[0];
        const datesRes = await pgPool.query('SELECT execution_date FROM course_dates WHERE course_id = $1 ORDER BY execution_date ASC', [courseId]);
        const tglList = datesRes.rows.map((r) => {
          if (r.execution_date instanceof Date) {
            return r.execution_date.toISOString().split('T')[0];
          }
          return String(r.execution_date).split('T')[0];
        });

        return {
          course_id: cRow.id,
          course_name: cRow.name || '',
          tgl_kursus: tglList,
          active: (cRow.status || 'active') === 'active',
        };
      }
    } catch (err) {
      console.warn('[PostgreSQL Fetch Course Info Warning]:', err);
    }
  }

  const memCourse = memoryCourses.find((c) => c.id === courseId);
  if (memCourse) {
    return {
      course_id: memCourse.id,
      course_name: memCourse.name || '',
      tgl_kursus: Array.isArray(memCourse.dates) ? memCourse.dates : [],
      active: (memCourse.status || 'active') === 'active',
    };
  }

  return {
    course_id: courseId,
    course_name: '',
    tgl_kursus: [],
    active: true,
  };
}

// ------------------------------------------------------------------
// REQUIRED EXTERNAL API 2: POST /api/external/auth
// User authentication endpoint for external applications (Students, Instructors/Assistants, Admin)
// ------------------------------------------------------------------
app.post('/api/external/auth', async (req: Request, res: Response) => {
  try {
    const providedApiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    // Validate API key if configured
    if (API_KEY && providedApiKey !== API_KEY) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Akses ditolak. Header X-API-Key tidak valid atau tidak disertakan.',
      });
    }

    // Support 'username' or 'npm' in body
    const identifier = req.body.username || req.body.npm;
    const password = req.body.password;
    const courseId = req.body.course_id || req.body.courseId;

    if (!identifier || !password) {
      return res.status(400).json({
        status: 'error',
        code: 'BAD_REQUEST',
        message: 'Parameter "username" (atau "npm") dan "password" wajib disertakan.',
      });
    }

    const cleanIdentifier = String(identifier).trim();
    const cleanPassword = String(password);

    // 1. Check Admin User
    if (cleanIdentifier === ADMIN_USER) {
      if (cleanPassword === ADMIN_PASS) {
        return res.json({
          status: 'success',
          code: 'AUTHENTICATED',
          message: 'Autentikasi admin berhasil.',
          data: {
            user_type: 'admin',
            identifier: ADMIN_USER,
            name: 'Administrator KursusHub',
            role: 'Super Administrator',
            authenticated_at: generateCurrentGMT(),
          },
        });
      } else {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: 'Password admin tidak valid.',
        });
      }
    }

    // 2. Check Student (Mahasiswa) by NPM
    let foundStudent: InMemoryStudent | null = null;

    if (pgPool && pgConnected) {
      try {
        let query = 'SELECT * FROM students WHERE UPPER(npm) = UPPER($1)';
        const params: string[] = [cleanIdentifier];
        if (courseId) {
          query += ' AND course_id = $2';
          params.push(String(courseId).trim());
        }
        query += ' LIMIT 1';
        const result = await pgPool.query(query, params);
        if (result.rows.length > 0) {
          const r = result.rows[0];
          foundStudent = {
            id: r.id,
            course_id: r.course_id,
            name: r.name,
            npm: r.npm,
            class_name: r.class_name,
            university: r.university,
            faculty: r.faculty,
            study_program: r.study_program,
            password_hash: r.password_hash,
            access_hours: r.access_hours,
            created_at: r.created_at,
          };
        }
      } catch (err) {
        console.warn('[PostgreSQL Auth Query Error]:', err);
      }
    }

    if (!foundStudent) {
      foundStudent = memoryStudents.find((s) => {
        const matchesNpm = s.npm.toUpperCase() === cleanIdentifier.toUpperCase();
        const matchesCourse = courseId ? s.course_id === courseId : true;
        return matchesNpm && matchesCourse;
      }) || null;
    }

    if (foundStudent) {
      let isMatch = false;
      if (foundStudent.plain_password_preview && cleanPassword === foundStudent.plain_password_preview) {
        isMatch = true;
      } else if (foundStudent.password_hash) {
        try {
          isMatch = await bcrypt.compare(cleanPassword, foundStudent.password_hash);
        } catch {
          isMatch = false;
        }
      }

      if (isMatch) {
        const courseInfo = await fetchCourseInfo(foundStudent.course_id);
        return res.json({
          status: 'success',
          code: 'AUTHENTICATED',
          message: 'Autentikasi mahasiswa berhasil diverifikasi.',
          data: {
            user_type: 'mahasiswa',
            id: foundStudent.id,
            identifier: foundStudent.npm,
            npm: foundStudent.npm,
            name: foundStudent.name,
            course_id: foundStudent.course_id,
            class_name: foundStudent.class_name,
            university: foundStudent.university,
            faculty: foundStudent.faculty,
            study_program: foundStudent.study_program,
            access_hours: foundStudent.access_hours,
            role: 'Mahasiswa Kursus',
            courses_info: courseInfo,
            authenticated_at: generateCurrentGMT(),
          },
        });
      } else {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: 'Password mahasiswa tidak cocok.',
        });
      }
    }

    // 3. Check Instructor / Assistant (by username)
    let foundInstructor: InMemoryInstructor | null = null;

    if (pgPool && pgConnected) {
      try {
        let query = 'SELECT * FROM instructors_assistants WHERE LOWER(username) = LOWER($1)';
        const params: string[] = [cleanIdentifier];
        if (courseId) {
          query += ' AND course_id = $2';
          params.push(String(courseId).trim());
        }
        query += ' LIMIT 1';
        const result = await pgPool.query(query, params);
        if (result.rows.length > 0) {
          const r = result.rows[0];
          foundInstructor = {
            id: r.id,
            course_id: r.course_id,
            name: r.name,
            role_type: r.role_type,
            specific_role: r.specific_role,
            university: r.university || '',
            study_program: r.study_program || '',
            username: r.username || '',
            password_hash: r.password_hash || '',
            email: r.email || '',
            phone: r.phone || '',
            created_at: r.created_at,
          };
        }
      } catch (err) {
        console.warn('[PostgreSQL Instructor Auth Query Error]:', err);
      }
    }

    if (!foundInstructor) {
      foundInstructor = memoryInstructors.find((i) => {
        const matchesUser = i.username && i.username.toLowerCase() === cleanIdentifier.toLowerCase();
        const matchesCourse = courseId ? i.course_id === courseId : true;
        return matchesUser && matchesCourse;
      }) || null;
    }

    if (foundInstructor) {
      let isMatch = false;
      if (foundInstructor.plain_password_preview && cleanPassword === foundInstructor.plain_password_preview) {
        isMatch = true;
      } else if (foundInstructor.password_hash) {
        try {
          isMatch = await bcrypt.compare(cleanPassword, foundInstructor.password_hash);
        } catch {
          isMatch = false;
        }
      }

      if (isMatch) {
        const courseInfo = await fetchCourseInfo(foundInstructor.course_id);
        return res.json({
          status: 'success',
          code: 'AUTHENTICATED',
          message: `Autentikasi ${foundInstructor.role_type} berhasil diverifikasi.`,
          data: {
            user_type: foundInstructor.role_type,
            id: foundInstructor.id,
            identifier: foundInstructor.username,
            username: foundInstructor.username,
            name: foundInstructor.name,
            course_id: foundInstructor.course_id,
            university: foundInstructor.university,
            study_program: foundInstructor.study_program,
            specific_role: foundInstructor.specific_role,
            email: foundInstructor.email,
            phone: foundInstructor.phone,
            role: foundInstructor.role_type === 'instruktur' ? 'Instruktur Kursus' : 'Asisten Kursus',
            courses_info: courseInfo,
            authenticated_at: generateCurrentGMT(),
          },
        });
      } else {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: 'Password pengajar tidak cocok.',
        });
      }
    }

    // 4. User not found
    return res.status(404).json({
      status: 'error',
      code: 'USER_NOT_FOUND',
      message: `Pengguna dengan username/NPM "${cleanIdentifier}" tidak ditemukan.`,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: `Terjadi kesalahan saat memverifikasi autentikasi: ${errMessage}`,
    });
  }
});

// Query login records (used by admin UI)
app.get('/api/logins', async (req: Request, res: Response) => {
  const { course_id } = req.query;

  if (pgPool && pgConnected) {
    try {
      let query = 'SELECT id, course_id as "courseId", npm, name, login_time_gmt as "loginTimeGmt", client_ip as "clientIp", created_at as "createdAt" FROM login_logs';
      const params: string[] = [];
      if (course_id) {
        query += ' WHERE course_id = $1';
        params.push(String(course_id));
      }
      query += ' ORDER BY created_at DESC LIMIT 200';
      const result = await pgPool.query(query, params);
      return res.json({ data: result.rows });
    } catch {
      // fallback to memory
    }
  }

  let results = memoryLogins;
  if (course_id) {
    results = results.filter((l) => l.course_id === course_id);
  }

  const mapped = results.map((l) => ({
    id: l.id,
    courseId: l.course_id,
    npm: l.npm,
    name: l.nama,
    loginTimeGmt: l.login_time_gmt,
    clientIp: l.client_ip,
    createdAt: l.created_at,
  }));

  return res.json({ data: mapped });
});

// ------------------------------------------------------------------
// Frontend Serving Setup
// ------------------------------------------------------------------
async function startServer() {
  if (!IS_PROD) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KursusHub] Server running on http://0.0.0.0:${PORT} (Mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[KursusHub Server Error]:', err);
});
