-- ============================================================
-- AxsyntheGroup CRM – School LMS Database Schema
-- PostgreSQL DDL
-- ============================================================

-- Roles ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'SUPER_ADMIN',
        'SCHOOL_ADMIN',
        'ACADEMIC_ADMIN',
        'ACADEMIC_MANAGER',
        'TEACHER',
        'STUDENT'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE section_type AS ENUM ('PRIMARY', 'OL', 'AL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE task_type AS ENUM ('ASSIGNMENT', 'LAB', 'COURSEWORK', 'QUIZ', 'EXAM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL UNIQUE,
    mobile           VARCHAR(20),
    password_hash    VARCHAR(255) NOT NULL,
    role             VARCHAR(50) NOT NULL,
    profile_image_path VARCHAR(500),
    contact_info     TEXT,
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLASSES / SECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
    id                   BIGSERIAL PRIMARY KEY,
    name                 VARCHAR(255) NOT NULL,
    section_type         VARCHAR(20) NOT NULL,
    academic_manager_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    class_id         BIGINT REFERENCES classes(id) ON DELETE CASCADE,
    has_exam         BOOLEAN DEFAULT FALSE,
    weighting_config JSONB,
    created_by       BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Many-to-many: Teachers assigned to Subjects
CREATE TABLE IF NOT EXISTS subject_teachers (
    subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (subject_id, teacher_id)
);

-- Many-to-many: Students enrolled in Classes
CREATE TABLE IF NOT EXISTS class_students (
    class_id   BIGINT REFERENCES classes(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, student_id)
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
    id               BIGSERIAL PRIMARY KEY,
    subject_id       BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    type             VARCHAR(30) NOT NULL,
    deadline         TIMESTAMP,
    attachments_path TEXT,
    max_marks        DECIMAL(5,2) DEFAULT 100.00,
    created_by       BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS marks (
    id              BIGSERIAL PRIMARY KEY,
    task_id         BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    student_id      BIGINT REFERENCES users(id) ON DELETE CASCADE,
    marks_obtained  DECIMAL(5,2) NOT NULL,
    gpa             DECIMAL(3,2),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (task_id, student_id)
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id          BIGSERIAL PRIMARY KEY,
    student_id  BIGINT REFERENCES users(id) ON DELETE CASCADE,
    class_id    BIGINT REFERENCES classes(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    recorded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, class_id, date)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    target_role     VARCHAR(50),
    target_user_ids TEXT,  -- comma-separated user IDs, NULL = all in scope
    created_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    user_name   VARCHAR(255),
    action      VARCHAR(500) NOT NULL,
    context     VARCHAR(500),
    ip_address  VARCHAR(50),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_marks_student    ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_task       ON marks(task_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_activity_user    ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_subject    ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(target_role);
