-- ACME Solar HSE Management System - PostgreSQL Normalized Schema
-- Adapted from MySQL schema for PostgreSQL 13+
-- Date: 2026-04-01

-- Extension for UUIDs if needed (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE event_category AS ENUM ('Unsafe Act', 'Unsafe Condition', 'Near Miss', 'First Aid', 'Medical Treatment', 'Fatal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_priority AS ENUM ('Low', 'Medium', 'High');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tracking_status AS ENUM ('Open', 'In Progress', 'Closed', 'Escalated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE action_status AS ENUM ('Open', 'Closed', 'Overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'CLOSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ROLES TABLE (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PLANTS TABLE
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    region VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-Plant Assignments
CREATE TABLE IF NOT EXISTS user_plant_assignments (
    user_id INT REFERENCES users(id),
    plant_id INT REFERENCES plants(id),
    PRIMARY KEY (user_id, plant_id)
);

-- 5. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    plant_id INT NOT NULL REFERENCES plants(id),
    reporter_id INT NOT NULL REFERENCES users(id),
    event_type event_category NOT NULL,
    risk_level risk_priority NOT NULL,
    impact_nature VARCHAR(100),
    description TEXT NOT NULL,
    basic_cause VARCHAR(100),
    gps_lat DECIMAL(10, 8),
    gps_lng DECIMAL(11, 8),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE NULL,
    status tracking_status DEFAULT 'Open',
    total_score INT DEFAULT 0
);

-- 6. ACTION PLANS
CREATE TABLE IF NOT EXISTS action_plans (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES events(id),
    description TEXT NOT NULL,
    assignee_id INT NOT NULL REFERENCES users(id),
    due_date DATE NOT NULL,
    status action_status DEFAULT 'Open',
    sla_hours INT DEFAULT 24,
    closed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. EVENT PHOTOS
CREATE TABLE IF NOT EXISTS event_photos (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    photo_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. AUDIT TRAIL
CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action audit_action NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_by INT REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 10. POWER BI REPORTING VIEW
CREATE OR REPLACE VIEW vw_hse_dashboard AS
SELECT 
    e.id AS event_id,
    p.name AS plant_name,
    p.code AS plant_code,
    u.fullname AS reporter_name,
    e.event_type,
    e.risk_level,
    e.status,
    e.reported_at,
    e.total_score,
    ap.due_date AS action_due_date,
    ap.status AS action_status
FROM events e
JOIN plants p ON e.plant_id = p.id
JOIN users u ON e.reporter_id = u.id
LEFT JOIN action_plans ap ON e.id = ap.event_id;

-- Seed Initial Roles
INSERT INTO roles (name, description) VALUES 
('Corporate', 'Full access to all plants and corporate reporting'),
('Plant Head', 'Management access to specific plant HSE data'),
('EHS Officer', 'Execution access for audits and incident reporting'),
('Site User', 'Basic reporting access')
ON CONFLICT (name) DO NOTHING;

-- Seed Administrative User (admin@acmesolar.com / admin123)
-- Hash generated via pbkdf2_sha256
INSERT INTO users (fullname, email, hashed_password, role_id, is_active) VALUES
('System Administrator', 'admin@acmesolar.com', '$pbkdf2-sha256$29000$MMbYu7d2ztm71xpDaC1lzA$BPuzR4crnekpzu4yKx9TwKlNxojjD8YXXtRhqyF6QG0', 1, TRUE)
ON CONFLICT (email) DO NOTHING;
