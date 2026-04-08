/* 
  🔹 Database Migration Script
  Use these queries to prepare your PostgreSQL database for ZKTeco device integration.
*/

-- 1. Create mapping table to link device IDs to internal employee UUIDs
CREATE TABLE IF NOT EXISTS zk_users (
  id SERIAL PRIMARY KEY,
  device_user_id INT NOT NULL,
  employee_id UUID REFERENCES employees(id),
  company_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Alter attendance logs table to include biometric data
-- If your main attendance table is named 'attendance_logs', use this:
ALTER TABLE attendance_logs 
ADD COLUMN IF NOT EXISTS method VARCHAR(20) DEFAULT 'face',
ADD COLUMN IF NOT EXISTS device_user_id INT;

-- If your table name is exactly 'attendance', use this:
-- ALTER TABLE attendance 
-- ADD COLUMN IF NOT EXISTS method VARCHAR(20) DEFAULT 'face',
-- ADD COLUMN IF NOT EXISTS device_user_id INT;

-- 3. Optional: Create a table for raw logs (useful for debugging)
CREATE TABLE IF NOT EXISTS zk_raw_logs (
  id SERIAL PRIMARY KEY,
  device_user_id INT,
  record_time TIMESTAMP,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payroll Updates: Add PF and ESI
ALTER TABLE employee_salaries 
ADD COLUMN IF NOT EXISTS "pfAmount" DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "esiAmount" DECIMAL(12, 2) DEFAULT 0;

ALTER TABLE payrolls 
ADD COLUMN IF NOT EXISTS "pfDeduction" DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "esiDeduction" DECIMAL(10, 2) DEFAULT 0;
