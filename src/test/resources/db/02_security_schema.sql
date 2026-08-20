-- =====================================================================
-- Security layer for PharmaChain. This is new, added on top of the original
-- PharmaChain-DB schema - none of the original tables, triggers, views or the
-- recall procedure are touched. Login credentials are deliberately kept in
-- their own table rather than added as columns on Employee_Master: Employee_Master
-- is HR/business data (who works here, what department, when hired), while
-- app_user is purely an authentication concern. emp_id links the two loosely
-- (nullable - not every login has to correspond to a real employee row, e.g.
-- a service account) without forcing every employee to have a login or vice versa.
-- =====================================================================

SET search_path TO pharma_manufacturing;

CREATE TABLE app_user (
    user_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    emp_id        VARCHAR(20) REFERENCES employee_master(emp_id),
    role          VARCHAR(30) NOT NULL
                  CHECK (role IN ('ADMIN', 'QC_ANALYST', 'WAREHOUSE_MANAGER',
                                  'PRODUCTION_SUPERVISOR', 'SALES', 'AUDITOR')),
    enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Demo accounts for local development / grading. Passwords are the plaintext value in
-- the comment, hashed with BCrypt (strength 10) - the exact algorithm Spring Security's
-- BCryptPasswordEncoder uses by default, so these work out of the box with no app-side
-- hashing needed. CHANGE OR REMOVE THESE before deploying anywhere real.
INSERT INTO app_user (username, password_hash, role) VALUES
    -- password: Admin@123
    ('admin',      '$2b$10$K.GWQE2UX3ALVnGoYXBBieoA16uS6OikLDHRR5mxUPQ/fR6K6Uwd.', 'ADMIN'),
    -- password: Qc@12345
    ('qc.analyst', '$2b$10$Bwio3FaRgpMuJGpeFYQL3ek3TQPdc4MMQfJFV7aTYwP0iVbxkFFI2', 'QC_ANALYST'),
    -- password: Wh@12345
    ('wh.manager', '$2b$10$R8gh8NJUCzQxIuXnP1tcG.9p8fV0UNnUx3rBN5gQe9.bwH0wwaUbK', 'WAREHOUSE_MANAGER'),
    -- password: Sales@123
    ('sales.rep',  '$2b$10$xykztofz/L9ZonYmGL5Fce2BigbHdVR/YL/LlBUaAn8xkjPXxA9KW', 'SALES');
