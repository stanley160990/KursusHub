-- ====================================================================
-- KursusHub PostgreSQL Schema & Migration Script
-- Copyright 2026 - halkh-systems.com
-- ====================================================================

-- 1. Table: universities (Referensi Perguruan Tinggi)
CREATE TABLE IF NOT EXISTS universities (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: faculties (Referensi Fakultas)
CREATE TABLE IF NOT EXISTS faculties (
    id VARCHAR(64) PRIMARY KEY,
    university_id VARCHAR(64) NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: study_programs (Referensi Program Studi)
CREATE TABLE IF NOT EXISTS study_programs (
    id VARCHAR(64) PRIMARY KEY,
    faculty_id VARCHAR(64) NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: courses
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    university_id VARCHAR(64) REFERENCES universities(id) ON DELETE SET NULL,
    university_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: course_dates (Dynamic execution dates per course)
CREATE TABLE IF NOT EXISTS course_dates (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    execution_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_course_date UNIQUE (course_id, execution_date)
);

-- 6. Table: students
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    npm VARCHAR(50) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    university VARCHAR(255) NOT NULL,
    faculty VARCHAR(255) NOT NULL,
    study_program VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    access_hours VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_course_student_npm UNIQUE (course_id, npm)
);

-- 7. Table: instructors_assistants
CREATE TABLE IF NOT EXISTS instructors_assistants (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('instruktur', 'asisten')),
    specific_role VARCHAR(255) NOT NULL,
    university VARCHAR(255),
    study_program VARCHAR(255),
    username VARCHAR(100),
    password_hash VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table: login_logs (Recorded by external system via API)
CREATE TABLE IF NOT EXISTS login_logs (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    npm VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    login_time_gmt VARCHAR(150) NOT NULL,
    client_ip VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Table: admin_users (Single admin management)
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Table: system_metadata (Tracks migrations)
CREATE TABLE IF NOT EXISTS system_metadata (
    key VARCHAR(100) PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_course_id ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_npm ON students(npm);
CREATE INDEX IF NOT EXISTS idx_course_dates_course_id ON course_dates(course_id);
CREATE INDEX IF NOT EXISTS idx_instructors_course_id ON instructors_assistants(course_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_course_id ON login_logs(course_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_npm ON login_logs(npm);
CREATE INDEX IF NOT EXISTS idx_faculties_university_id ON faculties(university_id);
CREATE INDEX IF NOT EXISTS idx_study_programs_faculty_id ON study_programs(faculty_id);

-- Conditional Default Migration Seed:
-- Deteksi keberadaan data/database: jika data telah ada maka tidak perlu migrasi dari data "default",
-- namun jika belum ada data, berikan fasilitas migration data "default".
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM courses LIMIT 1) THEN
        -- Insert Default Universities
        INSERT INTO universities (id, code, name) VALUES
        ('univ-01', 'UI', 'Universitas Indonesia'),
        ('univ-02', 'ITB', 'Institut Teknologi Bandung'),
        ('univ-03', 'UGM', 'Universitas Gadjah Mada'),
        ('univ-04', 'UNPAD', 'Universitas Padjadjaran');

        -- Insert Default Faculties
        INSERT INTO faculties (id, university_id, name) VALUES
        ('fac-ui-01', 'univ-01', 'Fakultas Ilmu Komputer'),
        ('fac-ui-02', 'univ-01', 'Fakultas Teknik'),
        ('fac-itb-01', 'univ-02', 'Sekolah Teknik Elektro & Informatika'),
        ('fac-ugm-01', 'univ-03', 'Fakultas MIPA'),
        ('fac-unpad-01', 'univ-04', 'Fakultas MIPA');

        -- Insert Default Study Programs
        INSERT INTO study_programs (id, faculty_id, name) VALUES
        ('pro-01', 'fac-ui-01', 'Teknik Informatika'),
        ('pro-02', 'fac-ui-01', 'Sistem Informasi'),
        ('pro-03', 'fac-ui-02', 'Teknik Komputer'),
        ('pro-08', 'fac-itb-01', 'Teknik Informatika'),
        ('pro-09', 'fac-itb-01', 'Sistem & Teknologi Informasi'),
        ('pro-13', 'fac-ugm-01', 'Ilmu Komputer'),
        ('pro-17', 'fac-unpad-01', 'Teknik Informatika');

        -- Insert Default Course 1
        INSERT INTO courses (id, name, description, university_id, university_name) VALUES 
        ('crs-01', 'Arsitektur Cloud & DevOps Modern', 'Pelatihan intensif arsitektur cloud AWS/GCP, containerization Docker, dan pipeline CI/CD tingkat lanjut.', 'univ-01', 'Universitas Indonesia');
        
        -- Insert Dynamic Dates for Course 1
        INSERT INTO course_dates (course_id, execution_date) VALUES
        ('crs-01', '2026-11-02'),
        ('crs-01', '2026-11-09'),
        ('crs-01', '2026-11-16');

        -- Insert Default Course 2
        INSERT INTO courses (id, name, description, university_id, university_name) VALUES 
        ('crs-02', 'Full-Stack Web Engineering dengan React & Node.js', 'Pengembangan aplikasi web end-to-end dengan RESTful API, database relational, dan deployment container.', 'univ-02', 'Institut Teknologi Bandung');

        -- Insert Dynamic Dates for Course 2
        INSERT INTO course_dates (course_id, execution_date) VALUES
        ('crs-02', '2026-11-05'),
        ('crs-02', '2026-11-12'),
        ('crs-02', '2026-11-19'),
        ('crs-02', '2026-11-26');

        -- Insert Default Students (8-digit NPM starting with G01)
        INSERT INTO students (id, course_id, name, npm, class_name, university, faculty, study_program, password_hash, access_hours) VALUES
        ('std-01', 'crs-01', 'Budi Santoso', 'G0143501', '4IA01', 'Universitas Indonesia', 'Fakultas Ilmu Komputer', 'Teknik Informatika', '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D', '08:00 - 12:00'),
        ('std-02', 'crs-01', 'Siti Rahmawati', 'G0143502', '4IA01', 'Universitas Indonesia', 'Fakultas Ilmu Komputer', 'Sistem Informasi', '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D', '08:00 - 12:00'),
        ('std-03', 'crs-02', 'Ahmad Fauzi', 'G0143503', '3KA02', 'Institut Teknologi Bandung', 'Sekolah Teknik Elektro & Informatika', 'Sistem & Teknologi Informasi', '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D', '13:00 - 17:00'),
        ('std-04', 'crs-02', 'Clara Anindya', 'G0143504', '3KA02', 'Institut Teknologi Bandung', 'Sekolah Teknik Elektro & Informatika', 'Teknik Informatika', '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D', '13:00 - 17:00');

        -- Insert Default Instructors and Assistants
        INSERT INTO instructors_assistants (id, course_id, name, role_type, specific_role, university, study_program, username, password_hash, email, phone) VALUES
        ('inst-01', 'crs-01', 'Dr. Ir. Hendra Gunawan, M.T.', 'instruktur', 'Instruktur Utama Cloud Computing', 'Universitas Indonesia', 'Teknik Komputer', 'hendra.gunawan', '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D', 'hendra.gunawan@halkh-systems.com', '+6281234567801'),
        ('inst-02', 'crs-01', 'Fajar Pratama, S.Kom.', 'asisten', 'Koordinator Asisten Lab & Praktikum', 'Universitas Indonesia', 'Teknik Informatika', 'fajar.pratama', '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D', 'fajar.p@halkh-systems.com', '+6281234567802'),
        ('inst-03', 'crs-02', 'Nadia Putri, M.Cs.', 'instruktur', 'Instruktur Utama Full-Stack Engineering', 'Institut Teknologi Bandung', 'Teknik Informatika', 'nadia.putri', '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D', 'nadia.putri@halkh-systems.com', '+6281234567803'),
        ('inst-04', 'crs-02', 'Rizky Ramadhan', 'asisten', 'Asisten Pendamping Coding & Debugging', 'Institut Teknologi Bandung', 'Sistem & Teknologi Informasi', 'rizky.ramadhan', '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D', 'rizky.r@halkh-systems.com', '+6281234567804');

        -- Insert Default Login Records
        INSERT INTO login_logs (id, course_id, npm, name, login_time_gmt, client_ip) VALUES
        ('log-01', 'crs-01', 'G0143501', 'Budi Santoso', 'Monday, 18 Oct 2026 08:05:14 GMT', '192.168.1.15'),
        ('log-02', 'crs-01', 'G0143502', 'Siti Rahmawati', 'Monday, 18 Oct 2026 08:12:30 GMT', '192.168.1.28'),
        ('log-03', 'crs-02', 'G0143503', 'Ahmad Fauzi', 'Monday, 18 Oct 2026 13:02:45 GMT', '192.168.1.42');

        -- Insert Default Admin User
        INSERT INTO admin_users (id, username, password_hash) VALUES
        ('admin-01', 'admin', '$2a$10$wKqK6GZlWcM7Rz2PZlWcMOkQ1lJ7Kz3R6tS5u8V9w0xYz1A2B3C4D')
        ON CONFLICT (username) DO NOTHING;

        -- Record system metadata
        INSERT INTO system_metadata (key, value) VALUES ('default_migration_status', 'seeded_successfully');
        
        RAISE NOTICE 'Default migration dataset with universities and admin user seeded successfully.';
    ELSE
        RAISE NOTICE 'Data already exists in database. Skipping default migration.';
    END IF;
END $$;
