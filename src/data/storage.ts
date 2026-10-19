import { Course, Student, InstructorAssistant, LoginRecord, DatabaseStatus, University } from '../types';

const STORAGE_KEYS = {
  COURSES: 'kursushub_courses_v1',
  STUDENTS: 'kursushub_students_v1',
  INSTRUCTORS: 'kursushub_instructors_v1',
  LOGINS: 'kursushub_logins_v1',
  UNIVERSITIES: 'kursushub_universities_v1',
  MIGRATION_DONE: 'kursushub_migration_status_v1',
  ADMIN_SESSION: 'kursushub_admin_session_v1',
};

// Default Universities Reference Dataset (Perguruan Tinggi -> Fakultas -> Program Studi)
export const DEFAULT_UNIVERSITIES: University[] = [
  {
    id: 'univ-01',
    code: 'UI',
    name: 'Universitas Indonesia',
    faculties: [
      {
        id: 'fac-ui-01',
        name: 'Fakultas Ilmu Komputer',
        studyPrograms: [
          { id: 'pro-01', name: 'Teknik Informatika' },
          { id: 'pro-02', name: 'Sistem Informasi' },
        ],
      },
      {
        id: 'fac-ui-02',
        name: 'Fakultas Teknik',
        studyPrograms: [
          { id: 'pro-03', name: 'Teknik Elektro' },
          { id: 'pro-04', name: 'Teknik Komputer' },
          { id: 'pro-05', name: 'Teknik Industri' },
        ],
      },
      {
        id: 'fac-ui-03',
        name: 'Fakultas MIPA',
        studyPrograms: [
          { id: 'pro-06', name: 'Matematika' },
          { id: 'pro-07', name: 'Statistika' },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'univ-02',
    code: 'ITB',
    name: 'Institut Teknologi Bandung',
    faculties: [
      {
        id: 'fac-itb-01',
        name: 'Sekolah Teknik Elektro & Informatika',
        studyPrograms: [
          { id: 'pro-08', name: 'Teknik Informatika' },
          { id: 'pro-09', name: 'Sistem & Teknologi Informasi' },
          { id: 'pro-10', name: 'Teknik Elektro' },
        ],
      },
      {
        id: 'fac-itb-02',
        name: 'Fakultas Matematika & Ilmu Pengetahuan Alam',
        studyPrograms: [
          { id: 'pro-11', name: 'Matematika' },
          { id: 'pro-12', name: 'Aktuaria' },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'univ-03',
    code: 'UGM',
    name: 'Universitas Gadjah Mada',
    faculties: [
      {
        id: 'fac-ugm-01',
        name: 'Fakultas MIPA',
        studyPrograms: [
          { id: 'pro-13', name: 'Ilmu Komputer' },
          { id: 'pro-14', name: 'Elektronika & Instrumentasi' },
        ],
      },
      {
        id: 'fac-ugm-02',
        name: 'Fakultas Teknik',
        studyPrograms: [
          { id: 'pro-15', name: 'Teknik Elektro' },
          { id: 'pro-16', name: 'Teknologi Informasi' },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'univ-04',
    code: 'UNPAD',
    name: 'Universitas Padjadjaran',
    faculties: [
      {
        id: 'fac-unpad-01',
        name: 'Fakultas MIPA',
        studyPrograms: [
          { id: 'pro-17', name: 'Teknik Informatika' },
          { id: 'pro-18', name: 'Matematika' },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

// Default migration seed datasets
export const DEFAULT_COURSES: Course[] = [
  {
    id: 'crs-01',
    name: 'Arsitektur Cloud & DevOps Modern',
    description: 'Pelatihan komprehensif arsitektur cloud, containerization Docker, orkestrasi microservices, dan implementasi CI/CD.',
    universityId: 'univ-01',
    universityName: 'Universitas Indonesia',
    facultyId: 'fac-ui-01',
    facultyName: 'Fakultas Ilmu Komputer',
    studyProgramId: 'pro-01',
    studyProgramName: 'Teknik Informatika',
    dates: ['2026-11-02', '2026-11-09', '2026-11-16'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'crs-02',
    name: 'Full-Stack Web Engineering Modern',
    description: 'Pengembangan web berskala industri menggunakan React, Node.js/Express, relational database PostgreSQL, dan integrasi API.',
    universityId: 'univ-02',
    universityName: 'Institut Teknologi Bandung',
    facultyId: 'fac-itb-01',
    facultyName: 'Sekolah Teknik Elektro & Informatika',
    studyProgramId: 'pro-08',
    studyProgramName: 'Teknik Informatika',
    dates: ['2026-11-05', '2026-11-12', '2026-11-19', '2026-11-26'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'crs-03',
    name: 'Kecerdasan Buatan & Pemrosesan Citra Digital',
    description: 'Konsep dasar hingga implementasi deep learning, computer vision, dan integrasi pipeline AI berbasis REST API.',
    universityId: 'univ-03',
    universityName: 'Universitas Gadjah Mada',
    facultyId: 'fac-ugm-01',
    facultyName: 'Fakultas MIPA',
    studyProgramId: 'pro-13',
    studyProgramName: 'Ilmu Komputer',
    dates: ['2026-12-01', '2026-12-08'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std-01',
    courseId: 'crs-01',
    name: 'Budi Santoso',
    npm: 'G0143501',
    className: '4IA01',
    university: 'Universitas Indonesia',
    faculty: 'Fakultas Ilmu Komputer',
    studyProgram: 'Teknik Informatika',
    passwordHash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plainPasswordPreview: 'Mhs2026!#',
    accessHours: '08:00 - 12:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-02',
    courseId: 'crs-01',
    name: 'Siti Rahmawati',
    npm: 'G0143502',
    className: '4IA01',
    university: 'Universitas Indonesia',
    faculty: 'Fakultas Ilmu Komputer',
    studyProgram: 'Sistem Informasi',
    passwordHash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plainPasswordPreview: 'Mhs2026!#',
    accessHours: '08:00 - 12:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-03',
    courseId: 'crs-02',
    name: 'Ahmad Fauzi',
    npm: 'G0143503',
    className: '3KA02',
    university: 'Institut Teknologi Bandung',
    faculty: 'Sekolah Teknik Elektro & Informatika',
    studyProgram: 'Sistem & Teknologi Informasi',
    passwordHash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plainPasswordPreview: 'Mhs2026!#',
    accessHours: '13:00 - 17:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-04',
    courseId: 'crs-02',
    name: 'Clara Anindya',
    npm: 'G0143504',
    className: '3KA02',
    university: 'Institut Teknologi Bandung',
    faculty: 'Sekolah Teknik Elektro & Informatika',
    studyProgram: 'Teknik Informatika',
    passwordHash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plainPasswordPreview: 'Mhs2026!#',
    accessHours: '13:00 - 17:00',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_INSTRUCTORS: InstructorAssistant[] = [
  {
    id: 'inst-01',
    courseId: 'crs-01',
    name: 'Dr. Ir. Hendra Gunawan, M.T.',
    roleType: 'instruktur',
    specificRole: 'Instruktur Utama Cloud Computing & DevOps',
    university: 'Universitas Indonesia',
    studyProgram: 'Teknik Komputer',
    username: 'hendra.gunawan',
    passwordHash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plainPasswordPreview: 'H3ndrAGun4w4n982K',
    email: 'hendra.gunawan@halkh-systems.com',
    phone: '+62 812-3456-7801',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inst-02',
    courseId: 'crs-01',
    name: 'Fajar Pratama, S.Kom.',
    roleType: 'asisten',
    specificRole: 'Koordinator Asisten Lab & Infrastruktur Docker',
    university: 'Universitas Indonesia',
    studyProgram: 'Teknik Informatika',
    username: 'fajar.pratama',
    passwordHash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plainPasswordPreview: 'F4j4rPrat4m4928X',
    email: 'fajar.pratama@halkh-systems.com',
    phone: '+62 812-3456-7802',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inst-03',
    courseId: 'crs-02',
    name: 'Nadia Putri, M.Cs.',
    roleType: 'instruktur',
    specificRole: 'Instruktur Utama Full-Stack Engineering',
    university: 'Institut Teknologi Bandung',
    studyProgram: 'Teknik Informatika',
    username: 'nadia.putri',
    passwordHash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plainPasswordPreview: 'N4di4Putr1Eng82P',
    email: 'nadia.putri@halkh-systems.com',
    phone: '+62 812-3456-7803',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inst-04',
    courseId: 'crs-02',
    name: 'Rizky Ramadhan, S.Tr.Kom.',
    roleType: 'asisten',
    specificRole: 'Asisten Pendamping Coding & Review Tugas',
    university: 'Institut Teknologi Bandung',
    studyProgram: 'Sistem & Teknologi Informasi',
    username: 'rizky.ramadhan',
    passwordHash: '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D',
    plainPasswordPreview: 'R1zkyRam4dh4n34Q',
    email: 'rizky.r@halkh-systems.com',
    phone: '+62 812-3456-7804',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_LOGINS: LoginRecord[] = [
  {
    id: 'log-01',
    courseId: 'crs-01',
    npm: 'G0143501',
    name: 'Budi Santoso',
    loginTimeGmt: 'Monday, 18 Oct 2026 08:05:14 GMT',
    clientIp: '192.168.1.15',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'log-02',
    courseId: 'crs-01',
    npm: 'G0143502',
    name: 'Siti Rahmawati',
    loginTimeGmt: 'Monday, 18 Oct 2026 08:12:30 GMT',
    clientIp: '192.168.1.28',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'log-03',
    courseId: 'crs-02',
    npm: 'G0143503',
    name: 'Ahmad Fauzi',
    loginTimeGmt: 'Monday, 18 Oct 2026 13:02:45 GMT',
    clientIp: '192.168.1.42',
    createdAt: new Date().toISOString(),
  },
];

export const StorageService = {
  checkDataStatus(): DatabaseStatus {
    try {
      const rawCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
      const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const rawInstructors = localStorage.getItem(STORAGE_KEYS.INSTRUCTORS);
      const rawLogins = localStorage.getItem(STORAGE_KEYS.LOGINS);
      const migrationDone = localStorage.getItem(STORAGE_KEYS.MIGRATION_DONE) === 'true';

      const courses: Course[] = rawCourses ? JSON.parse(rawCourses) : [];
      const students: Student[] = rawStudents ? JSON.parse(rawStudents) : [];
      const instructors: InstructorAssistant[] = rawInstructors ? JSON.parse(rawInstructors) : [];
      const logins: LoginRecord[] = rawLogins ? JSON.parse(rawLogins) : [];

      const hasData = courses.length > 0 || students.length > 0 || instructors.length > 0;

      return {
        connected: true,
        engine: 'PostgreSQL',
        hasData,
        coursesCount: courses.length,
        studentsCount: students.length,
        instructorsCount: instructors.length,
        loginLogsCount: logins.length,
        isDefaultSeeded: migrationDone || hasData,
        lastChecked: new Date().toISOString(),
      };
    } catch {
      return {
        connected: false,
        engine: 'PostgreSQL',
        hasData: false,
        coursesCount: 0,
        studentsCount: 0,
        instructorsCount: 0,
        loginLogsCount: 0,
        isDefaultSeeded: false,
        lastChecked: new Date().toISOString(),
      };
    }
  },

  seedDefaultData(force: boolean = false): boolean {
    const status = this.checkDataStatus();
    if (status.hasData && !force) {
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(DEFAULT_INSTRUCTORS));
    localStorage.setItem(STORAGE_KEYS.LOGINS, JSON.stringify(DEFAULT_LOGINS));
    localStorage.setItem(STORAGE_KEYS.UNIVERSITIES, JSON.stringify(DEFAULT_UNIVERSITIES));
    localStorage.setItem(STORAGE_KEYS.MIGRATION_DONE, 'true');
    return true;
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.INSTRUCTORS);
    localStorage.removeItem(STORAGE_KEYS.LOGINS);
    localStorage.removeItem(STORAGE_KEYS.UNIVERSITIES);
    localStorage.removeItem(STORAGE_KEYS.MIGRATION_DONE);
  },

  // ----------------------------------------------------------------
  // Universities & Faculties & Study Programs Reference
  // ----------------------------------------------------------------
  getUniversities(): University[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.UNIVERSITIES);
      if (!raw) {
        // Return default universities and cache them
        this.saveUniversities(DEFAULT_UNIVERSITIES);
        return DEFAULT_UNIVERSITIES;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_UNIVERSITIES;
    }
  },

  saveUniversities(universities: University[]): void {
    localStorage.setItem(STORAGE_KEYS.UNIVERSITIES, JSON.stringify(universities));
  },

  addUniversity(univ: Omit<University, 'id' | 'createdAt'>): University {
    const list = this.getUniversities();
    const newUniv: University = {
      ...univ,
      id: `univ-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newUniv);
    this.saveUniversities(list);

    try {
      fetch('/api/sync/university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUniv),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return newUniv;
  },

  updateUniversity(id: string, updates: Partial<Omit<University, 'id' | 'createdAt'>>): University | null {
    const list = this.getUniversities();
    const idx = list.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.saveUniversities(list);

    try {
      fetch('/api/sync/university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list[idx]),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return list[idx];
  },

  deleteUniversity(id: string): void {
    const list = this.getUniversities().filter((u) => u.id !== id);
    this.saveUniversities(list);

    try {
      fetch(`/api/sync/university/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // ignore
    }
  },

  addFaculty(universityId: string, facultyName: string): University | null {
    const list = this.getUniversities();
    const univ = list.find((u) => u.id === universityId);
    if (!univ) return null;

    const newFaculty = {
      id: `fac-${Date.now().toString().slice(-6)}`,
      name: facultyName.trim(),
      studyPrograms: [],
    };
    univ.faculties.push(newFaculty);
    this.saveUniversities(list);

    try {
      fetch('/api/sync/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityId, faculty: newFaculty }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return univ;
  },

  deleteFaculty(universityId: string, facultyId: string): University | null {
    const list = this.getUniversities();
    const univ = list.find((u) => u.id === universityId);
    if (!univ) return null;

    univ.faculties = univ.faculties.filter((f) => f.id !== facultyId);
    this.saveUniversities(list);

    try {
      fetch(`/api/sync/faculty/${facultyId}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // ignore
    }

    return univ;
  },

  addStudyProgram(universityId: string, facultyId: string, programName: string): University | null {
    const list = this.getUniversities();
    const univ = list.find((u) => u.id === universityId);
    if (!univ) return null;

    const fac = univ.faculties.find((f) => f.id === facultyId);
    if (!fac) return null;

    const newProg = {
      id: `pro-${Date.now().toString().slice(-6)}`,
      name: programName.trim(),
    };
    fac.studyPrograms.push(newProg);
    this.saveUniversities(list);

    try {
      fetch('/api/sync/study_program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId, program: newProg }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return univ;
  },

  deleteStudyProgram(universityId: string, facultyId: string, programId: string): University | null {
    const list = this.getUniversities();
    const univ = list.find((u) => u.id === universityId);
    if (!univ) return null;

    const fac = univ.faculties.find((f) => f.id === facultyId);
    if (!fac) return null;

    fac.studyPrograms = fac.studyPrograms.filter((p) => p.id !== programId);
    this.saveUniversities(list);

    try {
      fetch(`/api/sync/study_program/${programId}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // ignore
    }

    return univ;
  },

  // ----------------------------------------------------------------
  // Courses
  // ----------------------------------------------------------------
  getCourses(): Course[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (!raw) return [];
      const list: Course[] = JSON.parse(raw);
      return list.map((c) => ({
        ...c,
        status: c.status || 'active',
      }));
    } catch {
      return [];
    }
  },

  saveCourses(courses: Course[]): void {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  addCourse(course: Omit<Course, 'id' | 'createdAt'>): Course {
    const courses = this.getCourses();
    const newCourse: Course = {
      ...course,
      status: course.status || 'active',
      id: `crs-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    courses.unshift(newCourse);
    this.saveCourses(courses);

    // Sync to backend
    try {
      fetch('/api/sync/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return newCourse;
  },

  updateCourse(id: string, updates: Partial<Omit<Course, 'id' | 'createdAt'>>): Course | null {
    const courses = this.getCourses();
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return null;
    courses[index] = { ...courses[index], ...updates };
    this.saveCourses(courses);

    // Sync to backend
    try {
      fetch('/api/sync/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courses[index]),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return courses[index];
  },

  toggleCourseStatus(id: string): Course | null {
    const courses = this.getCourses();
    const course = courses.find((c) => c.id === id);
    if (!course) return null;
    const newStatus: 'active' | 'inactive' = (course.status || 'active') === 'active' ? 'inactive' : 'active';
    return this.updateCourse(id, { status: newStatus });
  },

  deleteCourse(id: string): void {
    const courses = this.getCourses().filter((c) => c.id !== id);
    this.saveCourses(courses);
    const students = this.getStudents().filter((s) => s.courseId !== id);
    this.saveStudents(students);
    const instructors = this.getInstructors().filter((i) => i.courseId !== id);
    this.saveInstructors(instructors);
    const logins = this.getLogins().filter((l) => l.courseId !== id);
    this.saveLogins(logins);

    try {
      fetch(`/api/sync/course/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // ignore
    }
  },

  // ----------------------------------------------------------------
  // Students
  // ----------------------------------------------------------------
  getStudents(courseId?: string): Student[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!raw) return [];
      const students: Student[] = JSON.parse(raw);
      if (courseId) {
        return students.filter((s) => s.courseId === courseId);
      }
      return students;
    } catch {
      return [];
    }
  },

  saveStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...student,
      id: `std-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    students.unshift(newStudent);
    this.saveStudents(students);
    
    // Sync to backend for external auth verification and PostgreSQL persistence
    try {
      fetch('/api/sync/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return newStudent;
  },

  addBatchStudents(newStudents: Student[]): void {
    const students = this.getStudents();
    const updated = [...newStudents, ...students];
    this.saveStudents(updated);

    // Sync to backend
    try {
      newStudents.forEach((st) => {
        fetch('/api/sync/student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(st),
        }).catch(() => {});
      });
    } catch {
      // ignore
    }
  },

  deleteStudent(id: string): void {
    const students = this.getStudents().filter((s) => s.id !== id);
    this.saveStudents(students);

    try {
      fetch(`/api/sync/student/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // ignore
    }
  },

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updatedStudent: Student = {
      ...students[index],
      ...updates,
    };
    students[index] = updatedStudent;
    this.saveStudents(students);

    // Sync to backend for external auth verification and PostgreSQL persistence
    try {
      fetch('/api/sync/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return updatedStudent;
  },

  // ----------------------------------------------------------------
  // Instructors and Assistants
  // ----------------------------------------------------------------
  getInstructors(courseId?: string): InstructorAssistant[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INSTRUCTORS);
      if (!raw) return [];
      const list: InstructorAssistant[] = JSON.parse(raw);
      if (courseId) {
        return list.filter((item) => item.courseId === courseId);
      }
      return list;
    } catch {
      return [];
    }
  },

  saveInstructors(list: InstructorAssistant[]): void {
    localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(list));
  },

  addInstructor(item: Omit<InstructorAssistant, 'id' | 'createdAt'>): InstructorAssistant {
    const list = this.getInstructors();
    const newItem: InstructorAssistant = {
      ...item,
      id: `inst-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newItem);
    this.saveInstructors(list);

    // Sync to backend for external auth verification and PostgreSQL persistence
    try {
      fetch('/api/sync/instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return newItem;
  },

  deleteInstructor(id: string): void {
    const list = this.getInstructors().filter((i) => i.id !== id);
    this.saveInstructors(list);

    try {
      fetch(`/api/sync/instructor/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // ignore
    }
  },

  updateInstructor(id: string, updates: Partial<InstructorAssistant>): InstructorAssistant | null {
    const list = this.getInstructors();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const updatedItem: InstructorAssistant = {
      ...list[index],
      ...updates,
    };
    list[index] = updatedItem;
    this.saveInstructors(list);

    // Sync to backend for external auth verification and PostgreSQL persistence
    try {
      fetch('/api/sync/instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return updatedItem;
  },

  // ----------------------------------------------------------------
  // Login records (fed by external API)
  // ----------------------------------------------------------------
  getLogins(courseId?: string): LoginRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOGINS);
      if (!raw) return [];
      const logins: LoginRecord[] = JSON.parse(raw);
      if (courseId) {
        return logins.filter((l) => l.courseId === courseId);
      }
      return logins;
    } catch {
      return [];
    }
  },

  saveLogins(logins: LoginRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGINS, JSON.stringify(logins));
  },

  addLoginRecord(record: Omit<LoginRecord, 'id' | 'createdAt'>): LoginRecord {
    const logins = this.getLogins();
    const newRecord: LoginRecord = {
      ...record,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    logins.unshift(newRecord);
    this.saveLogins(logins);
    return newRecord;
  },

  // ----------------------------------------------------------------
  // Database Synchronization Method
  // ----------------------------------------------------------------
  async syncWithDatabase(): Promise<boolean> {
    try {
      const res = await fetch('/api/data/all');
      if (!res.ok) return false;
      const data = await res.json();
      if (data && data.postgresConnected) {
        if (Array.isArray(data.universities) && data.universities.length > 0) {
          this.saveUniversities(data.universities);
        }
        if (Array.isArray(data.courses) && data.courses.length > 0) {
          this.saveCourses(data.courses);
        }
        if (Array.isArray(data.students)) {
          this.saveStudents(data.students);
        }
        if (Array.isArray(data.instructors)) {
          this.saveInstructors(data.instructors);
        }
        if (Array.isArray(data.logins)) {
          this.saveLogins(data.logins);
        }
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  },
};
