SET search_path TO pharma_manufacturing;

-- 1. Create Facility_Master
CREATE TABLE Facility_Master (
    Facility_ID   VARCHAR(20) PRIMARY KEY,
    Facility_Name VARCHAR(100) NOT NULL,
    Location      VARCHAR(200) NOT NULL,
    Facility_Type VARCHAR(50) NOT NULL CHECK (Facility_Type IN ('Manufacturing', 'Distribution'))
);

-- Insert Default Facilities
INSERT INTO Facility_Master (Facility_ID, Facility_Name, Location, Facility_Type) VALUES 
('FAC001', 'Primary Plant (Ahmedabad)', 'Ahmedabad, Gujarat', 'Manufacturing'),
('FAC002', 'Secondary Plant (Mumbai)', 'Mumbai, Maharashtra', 'Manufacturing'),
('FAC003', 'Central Distribution Center', 'Pune, Maharashtra', 'Distribution');

-- 2. Create Stock_Transfer
CREATE TABLE Stock_Transfer (
    Transfer_ID       VARCHAR(20) PRIMARY KEY,
    From_Facility_ID  VARCHAR(20) NOT NULL REFERENCES Facility_Master(Facility_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    To_Facility_ID    VARCHAR(20) NOT NULL REFERENCES Facility_Master(Facility_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Material_ID       VARCHAR(20) NOT NULL REFERENCES Material_Master(Material_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Quantity          NUMERIC(10) NOT NULL CHECK (Quantity > 0),
    Status            VARCHAR(20) NOT NULL CHECK (Status IN ('PENDING', 'IN_TRANSIT', 'RECEIVED')),
    Transfer_Date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Receive_Date      TIMESTAMP
);

-- 3. Update Warehouse
-- Add column as nullable first
ALTER TABLE Warehouse ADD COLUMN Facility_ID VARCHAR(20) REFERENCES Facility_Master(Facility_ID) ON DELETE CASCADE ON UPDATE CASCADE;

-- Set default to Primary Plant for existing data
UPDATE Warehouse SET Facility_ID = 'FAC001' WHERE Facility_ID IS NULL;

-- Make NOT NULL
ALTER TABLE Warehouse ALTER COLUMN Facility_ID SET NOT NULL;

-- Update Unique Constraint
ALTER TABLE Warehouse DROP CONSTRAINT uq_warehouse_mat_inv;
ALTER TABLE Warehouse ADD CONSTRAINT uq_warehouse_mat_inv_fac UNIQUE (Material_ID, Invoice_No, Facility_ID);

-- 4. Update Batch
ALTER TABLE Batch ADD COLUMN Facility_ID VARCHAR(20) REFERENCES Facility_Master(Facility_ID) ON DELETE CASCADE ON UPDATE CASCADE;
UPDATE Batch SET Facility_ID = 'FAC001' WHERE Facility_ID IS NULL;
ALTER TABLE Batch ALTER COLUMN Facility_ID SET NOT NULL;

-- 5. Update Employee_Master & Equipment_Master
ALTER TABLE Employee_Master ADD COLUMN Facility_ID VARCHAR(20) REFERENCES Facility_Master(Facility_ID) ON DELETE SET NULL ON UPDATE CASCADE;
UPDATE Employee_Master SET Facility_ID = 'FAC001' WHERE Facility_ID IS NULL;

ALTER TABLE Equipment_Master ADD COLUMN Facility_ID VARCHAR(20) REFERENCES Facility_Master(Facility_ID) ON DELETE SET NULL ON UPDATE CASCADE;
UPDATE Equipment_Master SET Facility_ID = 'FAC001' WHERE Facility_ID IS NULL;
