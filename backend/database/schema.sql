-- ACME Solar HSE Management System - Normalized Schema (Senior Developer Level)
-- Author: Antigravity AI
-- Date: 2026-04-01

CREATE DATABASE IF NOT EXISTS acme_hse;
USE acme_hse;

-- 1. ROLES TABLE (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'Corporate', 'Plant Head', 'EHS Officer', 'Site User'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. PLANTS TABLE
CREATE TABLE IF NOT EXISTS plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'PKD' for Pattikonda
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    region VARCHAR(50), -- e.g., 'Andhra Pradesh'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assign users to specific plants (nullable for Corporate users)
CREATE TABLE IF NOT EXISTS user_plant_assignments (
    user_id INT,
    plant_id INT,
    PRIMARY KEY (user_id, plant_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);

-- 4. EVENTS TABLE (The Core Table)
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    reporter_id INT NOT NULL,
    event_type ENUM('Unsafe Act', 'Unsafe Condition', 'Near Miss', 'First Aid', 'Medical Treatment', 'Fatal') NOT NULL,
    risk_level ENUM('Low', 'Medium', 'High') NOT NULL,
    impact_nature VARCHAR(100), -- e.g., 'Fire', 'Fall', 'Electric Shock'
    description TEXT NOT NULL,
    basic_cause VARCHAR(100), -- e.g., 'Lack of Training', 'Faulty Equipment'
    gps_lat DECIMAL(10, 8),
    gps_lng DECIMAL(11, 8),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP NULL,
    status ENUM('Open', 'In Progress', 'Closed', 'Escalated') DEFAULT 'Open',
    -- Analytical Totals Consistency Logic (calculated fields mirror Excel)
    total_score INT DEFAULT 0, 
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (reporter_id) REFERENCES users(id)
);

-- 5. ACTION PLANS
CREATE TABLE IF NOT EXISTS action_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    description TEXT NOT NULL,
    assignee_id INT NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Open', 'Closed', 'Overdue') DEFAULT 'Open',
    sla_hours INT DEFAULT 24, -- Configurable SLA based on Risk Level
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- 6. EVENT PHOTOS
CREATE TABLE IF NOT EXISTS event_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 7. AUDIT TRAIL (Compliance Requirement)
CREATE TABLE IF NOT EXISTS audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE', 'CLOSE') NOT NULL,
    old_value JSON,
    new_value JSON,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- 8. POWER BI REPORTING VIEW (Flattened)
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
('Site User', 'Basic reporting access');

-- Seed Administrative User (admin@acmesolar.com / admin123)
-- Hash generated via pbkdf2_sha256 (Senior Developer Choice for Python 3.13 stability)
INSERT INTO users (fullname, email, hashed_password, role_id, is_active) VALUES
('System Administrator', 'admin@acmesolar.com', '$pbkdf2-sha256$29000$MMbYu7d2ztm71xpDaC1lzA$BPuzR4crnekpzu4yKx9TwKlNxojjD8YXXtRhqyF6QG0', 1, TRUE);
