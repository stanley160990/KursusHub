export interface StudyProgram {
  id: string;
  name: string;
}

export interface Faculty {
  id: string;
  name: string;
  studyPrograms: StudyProgram[];
}

export interface University {
  id: string;
  code: string;
  name: string;
  faculties: Faculty[];
  createdAt: string;
}

export type CourseStatus = 'active' | 'inactive';

export interface Course {
  id: string;
  name: string;
  description: string;
  universityId?: string; // ID Perguruan Tinggi dari data referensi
  universityName?: string; // Nama Perguruan Tinggi dari data referensi
  dates: string[]; // Dynamic execution dates e.g. ['2026-11-02', '2026-11-09']
  status: CourseStatus; // 'active' | 'inactive'
  createdAt: string;
}

export interface Student {
  id: string;
  courseId: string;
  name: string;
  npm: string;
  className: string;
  university: string;
  faculty: string;
  studyProgram: string;
  passwordHash: string; // BCrypt hash
  plainPasswordPreview?: string; // Only displayed immediately upon creation/import for export
  accessHours: string; // Format e.g. "08:00 - 12:00"
  createdAt: string;
}

export type RoleType = 'instruktur' | 'asisten';

export interface InstructorAssistant {
  id: string;
  courseId: string;
  name: string;
  roleType: RoleType;
  specificRole: string; // Specific role e.g. "Instruktur Utama", "Asisten Lab", "Koordinator Praktikum"
  university: string; // Perguruan Tinggi dari data referensi
  studyProgram: string; // Program Studi dari data referensi
  username: string; // Username (Wajib)
  passwordHash: string; // BCrypt hash
  plainPasswordPreview?: string; // Generated 16-digit alphanumeric password
  email: string;
  phone: string;
  createdAt: string;
}

export interface LoginRecord {
  id: string;
  courseId: string;
  npm: string;
  name: string;
  loginTimeGmt: string; // Day and Hour in GMT format e.g. "Monday, 18 Oct 2026 10:15:30 GMT"
  clientIp?: string;
  createdAt: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  loginTime: number;
  expiresAt: number; // 15 minutes timeout timestamp
  token?: string;
}

export interface DatabaseStatus {
  connected: boolean;
  engine: 'PostgreSQL' | 'Local-Storage-Engine';
  hasData: boolean;
  coursesCount: number;
  studentsCount: number;
  instructorsCount: number;
  loginLogsCount: number;
  isDefaultSeeded: boolean;
  lastChecked: string;
}

export interface ExcelImportResult {
  totalProcessed: number;
  studentsAdded: Student[];
  exportRows: { npm: string; pass: string }[];
  errors: string[];
}
