-- Create Database
DROP DATABASE IF EXISTS meditrack_hospital;
CREATE DATABASE meditrack_hospital;
USE meditrack_hospital;

-- Users (for login - doctors, nurses, admin, receptionist)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin','doctor','nurse','receptionist') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Sessions table for authentication
CREATE TABLE sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Patients
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    gender ENUM('Male','Female','Other'),
    contact VARCHAR(20),
    address TEXT,
    admission_date DATETIME not null,
    discharge_date DATETIME null,
    status ENUM('Admitted','Discharged') DEFAULT 'Admitted'
);

-- Doctors
CREATE TABLE doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    contact VARCHAR(20)
);

-- Assign Doctors to Patients
CREATE TABLE patient_doctor (
    pd_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- Vitals (BP, HR, Temperature, etc.)
CREATE TABLE vitals (
    vital_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    heart_rate INT,
    blood_pressure VARCHAR(20),
    temperature DECIMAL(4,1),
    oxygen_level INT,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Medicines
CREATE TABLE medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stock INT DEFAULT 0
);

-- Prescribed Medicines
CREATE TABLE prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    medicine_id INT,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);

-- Billing
CREATE TABLE bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    room_charges DECIMAL(10,2),
    medicine_charges DECIMAL(10,2),
    doctor_fee DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    status ENUM('Pending','Paid') DEFAULT 'Pending',
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Reports (final summary on discharge)
CREATE TABLE reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    diagnosis TEXT,
    treatment_summary TEXT,
    follow_up_instructions TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- -------------------
-- DEMO DATA SEEDING
-- -------------------

-- Users (password for all: password123)
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
('admin', '$2b$10$rOzJqKqVQxnQVqQVqQVqQOzJqKqVQxnQVqQVqQVqQOzJqKqVQxnQV', 'System Administrator', 'admin@meditrack.com', 'admin'),
('doctor1', '$2b$10$rOzJqKqVQxnQVqQVqQVqQOzJqKqVQxnQVqQVqQVqQOzJqKqVQxnQV', 'Dr. Sharma', 'sharma@meditrack.com', 'doctor'),
('nurse1', '$2b$10$rOzJqKqVQxnQVqQVqQVqQOzJqKqVQxnQVqQVqQOzJqKqVQxnQV', 'Nurse Neha', 'neha@meditrack.com', 'nurse'),
('reception1', '$2b$10$rOzJqKqVQxnQVqQVqQVqQOzJqKqVQxnQVqQVqQVqQOzJqKqVQxnQV', 'Reception Staff', 'reception@meditrack.com', 'receptionist');

-- Doctors
INSERT INTO doctors (name, specialization, contact) VALUES
('Dr. Sharma', 'Cardiologist', '9876543210'),
('Dr. Verma', 'Physician', '9876501234');

-- Patients
INSERT INTO patients (name, age, gender, contact, address, admission_date, status) VALUES
('Rahul Mehta', 45, 'Male', '9876541111', 'Pune, MH', NOW(), 'Admitted'),
('Anita Desai', 60, 'Female', '9876542222', 'Mumbai, MH', NOW(), 'Admitted'),
('Suresh Patil', 35, 'Male', '9876543333', 'Solapur, MH', NOW() - INTERVAL 10 DAY, 'Discharged');

-- Assign Doctors
INSERT INTO patient_doctor (patient_id, doctor_id) VALUES
(1,1), (2,2), (3,1);

-- Vitals
INSERT INTO vitals (patient_id, heart_rate, blood_pressure, temperature, oxygen_level) VALUES
(1, 85, '120/80', 98.6, 97),
(1, 90, '130/85', 99.1, 95),
(2, 78, '110/70', 98.4, 98),
(3, 100, '140/90', 100.2, 92);

-- Medicines
INSERT INTO medicines (name, description, stock) VALUES
('Paracetamol', 'Fever reducer', 200),
('Atorvastatin', 'Cholesterol medicine', 100),
('Amlodipine', 'Blood pressure medicine', 150);

-- Prescriptions
INSERT INTO prescriptions (patient_id, medicine_id, dosage, frequency, start_date, end_date) VALUES
(1, 1, '500mg', '2 times/day', CURDATE(), CURDATE() + INTERVAL 5 DAY),
(2, 3, '10mg', '1 time/day', CURDATE(), CURDATE() + INTERVAL 10 DAY),
(3, 2, '20mg', '1 time/day', CURDATE() - INTERVAL 7 DAY, CURDATE());

-- Bills
INSERT INTO bills (patient_id, room_charges, medicine_charges, doctor_fee, total_amount, status) VALUES
(1, 5000, 1500, 2000, 8500, 'Pending'),
(2, 3000, 1000, 1500, 5500, 'Pending'),
(3, 7000, 2000, 2500, 11500, 'Paid');

-- Reports
INSERT INTO reports (patient_id, diagnosis, treatment_summary, follow_up_instructions) VALUES
(3, 'High BP & Cholesterol', 'Given medication & lifestyle advice', 'Check BP weekly, follow diet plan');