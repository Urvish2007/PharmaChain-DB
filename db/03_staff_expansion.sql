-- =====================================================================
-- 03_staff_expansion.sql
-- Expands Employee_Master with 6 new HR columns and adds 10 new
-- realistic pharmaceutical employees (EMP021–EMP030), bringing the
-- total to 30 staff across 9 departments.
--
-- Run AFTER 01_schema_and_data.sql and 02_security_schema.sql:
--   psql -h localhost -U postgres -d pharmachain -f db/03_staff_expansion.sql
-- =====================================================================

SET search_path TO pharma_manufacturing;

-- ── 1. Add new columns ──────────────────────────────────────────────
ALTER TABLE Employee_Master
    ADD COLUMN IF NOT EXISTS Email          VARCHAR(80),
    ADD COLUMN IF NOT EXISTS Phone          VARCHAR(15),
    ADD COLUMN IF NOT EXISTS Status         VARCHAR(15) DEFAULT 'Active'
                                            CHECK (Status IN ('Active', 'On Leave', 'Terminated')),
    ADD COLUMN IF NOT EXISTS Shift          VARCHAR(10) DEFAULT 'Day'
                                            CHECK (Shift IN ('Day', 'Night', 'Rotational')),
    ADD COLUMN IF NOT EXISTS Salary_Grade   VARCHAR(5),
    ADD COLUMN IF NOT EXISTS Reporting_To   VARCHAR(20) REFERENCES Employee_Master(Emp_ID)
                                            ON DELETE SET NULL ON UPDATE CASCADE;

-- ── 2. Backfill existing 20 employees ───────────────────────────────
UPDATE Employee_Master SET Email = 'ajay.sharma@pharmachain.in',   Phone = '+91-9820100001', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L5', Reporting_To = 'EMP010' WHERE Emp_ID = 'EMP001';
UPDATE Employee_Master SET Email = 'hitesh.patel@pharmachain.in',  Phone = '+91-9820100002', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L3', Reporting_To = 'EMP001' WHERE Emp_ID = 'EMP002';
UPDATE Employee_Master SET Email = 'sunil.desai@pharmachain.in',   Phone = '+91-9820100003', Status = 'Active',     Shift = 'Rotational', Salary_Grade = 'L2', Reporting_To = 'EMP005' WHERE Emp_ID = 'EMP003';
UPDATE Employee_Master SET Email = 'vikram.singh@pharmachain.in',  Phone = '+91-9820100004', Status = 'Active',     Shift = 'Rotational', Salary_Grade = 'L2', Reporting_To = 'EMP005' WHERE Emp_ID = 'EMP004';
UPDATE Employee_Master SET Email = 'anita.roy@pharmachain.in',     Phone = '+91-9820100005', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L4', Reporting_To = 'EMP020' WHERE Emp_ID = 'EMP005';
UPDATE Employee_Master SET Email = 'ramesh.kumar@pharmachain.in',  Phone = '+91-9820100006', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L3', Reporting_To = 'EMP007' WHERE Emp_ID = 'EMP006';
UPDATE Employee_Master SET Email = 'suresh.pillai@pharmachain.in', Phone = '+91-9820100007', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L4', Reporting_To = NULL     WHERE Emp_ID = 'EMP007';
UPDATE Employee_Master SET Email = 'kavita.menon@pharmachain.in',  Phone = '+91-9820100008', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L4', Reporting_To = NULL     WHERE Emp_ID = 'EMP008';
UPDATE Employee_Master SET Email = 'nitin.gadkari@pharmachain.in', Phone = '+91-9820100009', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L4', Reporting_To = NULL     WHERE Emp_ID = 'EMP009';
UPDATE Employee_Master SET Email = 'meera.iyer@pharmachain.in',    Phone = '+91-9820100010', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L6', Reporting_To = NULL     WHERE Emp_ID = 'EMP010';
UPDATE Employee_Master SET Email = 'rahul.verma@pharmachain.in',   Phone = '+91-9820100011', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L3', Reporting_To = 'EMP001' WHERE Emp_ID = 'EMP011';
UPDATE Employee_Master SET Email = 'priya.singh@pharmachain.in',   Phone = '+91-9820100012', Status = 'Active',     Shift = 'Rotational', Salary_Grade = 'L3', Reporting_To = 'EMP005' WHERE Emp_ID = 'EMP012';
UPDATE Employee_Master SET Email = 'amit.shah@pharmachain.in',     Phone = '+91-9820100013', Status = 'Active',     Shift = 'Rotational', Salary_Grade = 'L1', Reporting_To = 'EMP009' WHERE Emp_ID = 'EMP013';
UPDATE Employee_Master SET Email = 'neha.gupta@pharmachain.in',    Phone = '+91-9820100014', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L5', Reporting_To = 'EMP010' WHERE Emp_ID = 'EMP014';
UPDATE Employee_Master SET Email = 'sanjay.dutt@pharmachain.in',   Phone = '+91-9820100015', Status = 'On Leave',   Shift = 'Day',        Salary_Grade = 'L2', Reporting_To = 'EMP007' WHERE Emp_ID = 'EMP015';
UPDATE Employee_Master SET Email = 'pooja.reddy@pharmachain.in',   Phone = '+91-9820100016', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L3', Reporting_To = 'EMP008' WHERE Emp_ID = 'EMP016';
UPDATE Employee_Master SET Email = 'arjun.nair@pharmachain.in',    Phone = '+91-9820100017', Status = 'Active',     Shift = 'Night',      Salary_Grade = 'L2', Reporting_To = 'EMP020' WHERE Emp_ID = 'EMP017';
UPDATE Employee_Master SET Email = 'karan.johar@pharmachain.in',   Phone = '+91-9820100018', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L2', Reporting_To = 'EMP009' WHERE Emp_ID = 'EMP018';
UPDATE Employee_Master SET Email = 'riya.sen@pharmachain.in',      Phone = '+91-9820100019', Status = 'Active',     Shift = 'Day',        Salary_Grade = 'L4', Reporting_To = 'EMP001' WHERE Emp_ID = 'EMP019';
UPDATE Employee_Master SET Email = 'manoj.bajpayee@pharmachain.in',Phone = '+91-9820100020', Status = 'Active',     Shift = 'Night',      Salary_Grade = 'L5', Reporting_To = NULL     WHERE Emp_ID = 'EMP020';

-- ── 3. Insert 10 new employees (EMP021–EMP030) ─────────────────────
INSERT INTO Employee_Master (Emp_ID, Emp_Name, Department, Role, Hire_Date, Email, Phone, Status, Shift, Salary_Grade, Reporting_To) VALUES
('EMP021', 'Dr. Priyanka Kapoor', 'R&D',                'Formulation Scientist',       '2016-03-18', 'priyanka.kapoor@pharmachain.in', '+91-9820100021', 'Active',   'Day',        'L6', NULL),
('EMP022', 'Arun Joshi',          'Quality Control',     'Stability Testing Analyst',   '2021-06-01', 'arun.joshi@pharmachain.in',      '+91-9820100022', 'Active',   'Day',        'L3', 'EMP001'),
('EMP023', 'Deepak Malhotra',     'Regulatory Affairs',  'Regulatory Affairs Manager',  '2014-09-12', 'deepak.malhotra@pharmachain.in', '+91-9820100023', 'Active',   'Day',        'L6', NULL),
('EMP024', 'Sangeeta Rao',        'Quality Assurance',   'Validation Specialist',       '2019-01-22', 'sangeeta.rao@pharmachain.in',    '+91-9820100024', 'Active',   'Day',        'L4', 'EMP010'),
('EMP025', 'Farhan Qureshi',      'Production',          'Process Engineer',            '2020-04-15', 'farhan.qureshi@pharmachain.in',  '+91-9820100025', 'Active',   'Day',        'L4', 'EMP020'),
('EMP026', 'Lata Bhosle',         'Production',          'Granulation Operator',        '2022-08-10', 'lata.bhosle@pharmachain.in',     '+91-9820100026', 'Active',   'Rotational', 'L2', 'EMP005'),
('EMP027', 'Rajesh Tiwari',       'EHS',                 'EHS Officer',                 '2017-11-03', 'rajesh.tiwari@pharmachain.in',   '+91-9820100027', 'Active',   'Day',        'L4', NULL),
('EMP028', 'Meghna Sehgal',       'Supply Chain',        'Demand Planner',              '2021-02-14', 'meghna.sehgal@pharmachain.in',   '+91-9820100028', 'Active',   'Day',        'L4', 'EMP008'),
('EMP029', 'Vikas Chauhan',       'Maintenance',         'HVAC Technician',             '2019-07-20', 'vikas.chauhan@pharmachain.in',   '+91-9820100029', 'On Leave', 'Day',        'L3', 'EMP007'),
('EMP030', 'Pallavi Deshmukh',    'Warehouse',           'Cold Chain Specialist',       '2020-10-05', 'pallavi.deshmukh@pharmachain.in','+91-9820100030', 'Active',   'Day',        'L4', 'EMP009');
