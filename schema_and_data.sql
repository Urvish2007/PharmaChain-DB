

set search_path to pharma_manufacturing

-- 1. Master Tables
CREATE TABLE Material_Master (
    Material_ID          VARCHAR(20)   PRIMARY KEY,
    Material_Name        VARCHAR(30)   NOT NULL,
    Material_Type        VARCHAR(20)   NOT NULL,
    Storage_Condition    VARCHAR(100)  NOT NULL,
    Shelf_Life           NUMERIC(3)    NOT NULL CHECK (Shelf_Life > 0),
    Therapeutic_Category VARCHAR(30)   NOT NULL,
    Material_State       VARCHAR(10)   NOT NULL,
    isHazardous          BOOLEAN       NOT NULL,
    isInflammable        BOOLEAN       NOT NULL,
    UOM                  VARCHAR(3)    NOT NULL,
    Reorder_Level        NUMERIC(10)   DEFAULT 1000 CHECK (Reorder_Level > 0)
);

CREATE TABLE Account_Master (
    Account_No   VARCHAR(11)  PRIMARY KEY,
    Account_Name VARCHAR(50)  NOT NULL,
    Phone_No     VARCHAR(13)  NOT NULL,
    Address      VARCHAR(100) NOT NULL,
    Account_Type VARCHAR(20)  DEFAULT 'Distributor' CHECK (Account_Type IN ('Supplier', 'Distributor', 'Hospital'))
);

CREATE TABLE Employee_Master (
    Emp_ID       VARCHAR(20) PRIMARY KEY,
    Emp_Name     VARCHAR(50) NOT NULL,
    Department   VARCHAR(30) NOT NULL,
    Role         VARCHAR(30) NOT NULL,
    Hire_Date    DATE NOT NULL
);

CREATE TABLE Equipment_Master (
    Equipment_ID          VARCHAR(20) PRIMARY KEY,
    Equipment_Name        VARCHAR(50) NOT NULL,
    Equipment_Type        VARCHAR(30) NOT NULL,
    Last_Calibration_Date DATE NOT NULL,
    Status                VARCHAR(20) NOT NULL CHECK (Status IN ('Active', 'Maintenance'))
);

CREATE TABLE Product_Master (
    Product_ID       VARCHAR(20) PRIMARY KEY,
    Product_Name     VARCHAR(20) NOT NULL,
    Generic_Name     VARCHAR(100) NOT NULL,
    Product_Type     VARCHAR(20) NOT NULL,
    Packing_Type     VARCHAR(10) NOT NULL,
    Packing_Size     VARCHAR(5)  NOT NULL,
    SalableorSample  VARCHAR(1)  NOT NULL CHECK (SalableorSample IN ('M','S')),
    GenericorBranded VARCHAR(1)  NOT NULL CHECK (GenericorBranded IN ('G','B'))
);

-- 2. Transaction & Contract Tables
CREATE TABLE Transactions (
    Invoice_No       NUMERIC(10)   PRIMARY KEY,
    Transaction_Date DATE          NOT NULL,
    Currency         VARCHAR(3)    NOT NULL,
    Transaction_Type VARCHAR(4)    NOT NULL CHECK (Transaction_Type IN ('buy','sell')),
    Paid_Received    BOOLEAN       NOT NULL,
    Account_No       VARCHAR(11)   REFERENCES Account_Master(Account_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Total_Value      NUMERIC(10,2) NOT NULL CHECK (Total_Value > 0)
);

CREATE TABLE Supplier_Contract (
    Contract_ID   VARCHAR(20) PRIMARY KEY,
    Account_No    VARCHAR(11) NOT NULL REFERENCES Account_Master(Account_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Material_ID   VARCHAR(20) NOT NULL REFERENCES Material_Master(Material_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Agreed_Price  NUMERIC(10,2) NOT NULL CHECK (Agreed_Price > 0),
    Valid_Until   DATE NOT NULL
);

-- 3. Warehouse & Inventory
CREATE TABLE Warehouse (
    Item_ID     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Material_ID VARCHAR(20) NOT NULL REFERENCES Material_Master(Material_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Invoice_No  NUMERIC(10) NOT NULL REFERENCES Transactions(Invoice_No) ON DELETE CASCADE ON UPDATE CASCADE,
    UT_Q_A      VARCHAR(2)  NOT NULL,
    Stock       NUMERIC(10) NOT NULL CHECK (Stock > 0),
    CONSTRAINT uq_warehouse_mat_inv UNIQUE (Material_ID, Invoice_No)
);

CREATE TABLE RM_Transaction (
    Invoice_No NUMERIC(10) NOT NULL REFERENCES Transactions(Invoice_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Item_ID    BIGINT      NOT NULL REFERENCES Warehouse(Item_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    RM_Qty     NUMERIC(10)   NOT NULL CHECK (RM_Qty > 0),
    Val        NUMERIC(10,2) NOT NULL CHECK (Val > 0),
    CONSTRAINT pk_rm_transaction PRIMARY KEY (Invoice_No, Item_ID)
);

CREATE TABLE Material_Quality_Check (
    Report_ID     VARCHAR(20)  PRIMARY KEY,
    Item_ID       BIGINT       NOT NULL,
    Analysis_Date DATE         NOT NULL,
    Analyst_Name  VARCHAR(20)  NOT NULL,
    Sample_Size   NUMERIC(10)  NOT NULL CHECK (Sample_Size > 0),
    Test          VARCHAR(20)  NOT NULL,
    Limits        VARCHAR(20)  NOT NULL,
    Results       VARCHAR(30)  NOT NULL,
    Emp_ID        VARCHAR(20)  REFERENCES Employee_Master(Emp_ID) ON DELETE SET NULL,
    CONSTRAINT fk_mqc_warehouse FOREIGN KEY (Item_ID) REFERENCES Warehouse(Item_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Manufacturing & Production
CREATE TABLE Formula_Master (
    Product_ID        VARCHAR(20) NOT NULL REFERENCES Product_Master(Product_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Material_ID       VARCHAR(20) NOT NULL REFERENCES Material_Master(Material_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Weight_per_tablet NUMERIC(10) NOT NULL CHECK (Weight_per_tablet > 0),
    CONSTRAINT pk_formula_master PRIMARY KEY (Product_ID, Material_ID)
);

CREATE TABLE Batch (
    Batch_No         NUMERIC(10) PRIMARY KEY,
    Batch_Size       NUMERIC(10) NOT NULL CHECK (Batch_Size > 0),
    Mfg_Date         DATE        NOT NULL,
    Exp_Date         DATE,
    Product_ID       VARCHAR(20) REFERENCES Product_Master(Product_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Stock_Qty        NUMERIC(10) NOT NULL CHECK (Stock_Qty >= 0),
    UT_Q_A           VARCHAR(2)  NOT NULL,
    Yield_Percentage NUMERIC(5,2) DEFAULT 98.50 CHECK (Yield_Percentage >= 0 AND Yield_Percentage <= 100)
);

CREATE TABLE Material_Dispensing (
    Batch_No         NUMERIC(10) NOT NULL REFERENCES Batch(Batch_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Item_ID          BIGINT      NOT NULL REFERENCES Warehouse(Item_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Quantity_Issued  NUMERIC(10) NOT NULL CHECK (Quantity_Issued > 0),
    CONSTRAINT pk_material_dispensing PRIMARY KEY (Batch_No, Item_ID)
);

CREATE TABLE Production_Log (
    Log_ID        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Batch_No      NUMERIC(10) NOT NULL REFERENCES Batch(Batch_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Equipment_ID  VARCHAR(20) REFERENCES Equipment_Master(Equipment_ID) ON DELETE SET NULL ON UPDATE CASCADE,
    Emp_ID        VARCHAR(20) REFERENCES Employee_Master(Emp_ID) ON DELETE SET NULL ON UPDATE CASCADE,
    Process_Stage VARCHAR(30) NOT NULL,
    Start_Time    TIMESTAMP NOT NULL,
    End_Time      TIMESTAMP NOT NULL,
    CONSTRAINT chk_time CHECK (End_Time > Start_Time)
);

-- 5. Final Quality & Post-Production
CREATE TABLE Product_Quality_Check (
    Report_ID     VARCHAR(20)  PRIMARY KEY,
    Batch_No      NUMERIC(10)  REFERENCES Batch(Batch_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Analysis_Date DATE         NOT NULL,
    Analyst_Name  VARCHAR(20)  NOT NULL,
    Sample_Size   NUMERIC(10)  NOT NULL CHECK (Sample_Size > 0),
    Process_State VARCHAR(20)  NOT NULL,
    Test          VARCHAR(20)  NOT NULL,
    Limits        VARCHAR(20)  NOT NULL,
    Results       VARCHAR(30)  NOT NULL,
    Emp_ID        VARCHAR(20)  REFERENCES Employee_Master(Emp_ID) ON DELETE SET NULL
);

CREATE TABLE FG_Transaction (
    Invoice_No NUMERIC(10) NOT NULL REFERENCES Transactions(Invoice_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Batch_No   NUMERIC(10) NOT NULL REFERENCES Batch(Batch_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Sale_Qty   NUMERIC(10)   NOT NULL CHECK (Sale_Qty > 0),
    Val        NUMERIC(10,2) NOT NULL CHECK (Val > 0),
    CONSTRAINT pk_fg_transaction PRIMARY KEY (Invoice_No, Batch_No)
);

CREATE TABLE Product_Recall (
    Recall_ID      VARCHAR(20) PRIMARY KEY,
    Batch_No       NUMERIC(10) NOT NULL REFERENCES Batch(Batch_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Date_Initiated DATE NOT NULL,
    Reason         VARCHAR(255) NOT NULL,
    Qty_Recalled   NUMERIC(10) NOT NULL CHECK (Qty_Recalled > 0)
);

CREATE TABLE Maintenance_Log (
    Maintenance_ID   VARCHAR(20) PRIMARY KEY,
    Equipment_ID     VARCHAR(20) NOT NULL REFERENCES Equipment_Master(Equipment_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Emp_ID           VARCHAR(20) REFERENCES Employee_Master(Emp_ID) ON DELETE SET NULL ON UPDATE CASCADE,
    Maintenance_Date DATE NOT NULL,
    Cost             NUMERIC(10,2) NOT NULL CHECK (Cost >= 0)
);

-- =====================================================================
-- TABLE: Quality Control Audit Log (The Hidden Vault)
-- =====================================================================
CREATE TABLE QC_Audit_Log (
    Audit_ID SERIAL PRIMARY KEY,      -- Auto-increments 1, 2, 3...
    Report_ID VARCHAR(20),            -- Which report was altered?
    Action_Type VARCHAR(10),          -- Was it an UPDATE or a DELETE?
    Old_Result VARCHAR(50),           -- What was the original grade?
    New_Result VARCHAR(50),           -- What did they change it to?
    Changed_By VARCHAR(50),           -- Who is logged into the database?
    Change_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Exact millisecond it happened
);

INSERT INTO Employee_Master (Emp_ID, Emp_Name, Department, Role, Hire_Date) VALUES
('EMP001', 'Dr. Ajay Sharma', 'Quality Control', 'Lead Analyst', '2015-04-12'),
('EMP002', 'Hitesh Patel', 'Quality Control', 'Lab Technician', '2018-01-10'),
('EMP003', 'Sunil Desai', 'Production', 'Machine Operator', '2017-06-22'),
('EMP004', 'Vikram Singh', 'Production', 'Machine Operator', '2019-03-15'),
('EMP005', 'Anita Roy', 'Production', 'Floor Supervisor', '2014-11-05'),
('EMP006', 'Ramesh Kumar', 'Maintenance', 'Senior Mechanic', '2016-08-19'),
('EMP007', 'Suresh Pillai', 'Maintenance', 'Electrical Engineer', '2020-02-01'),
('EMP008', 'Kavita Menon', 'Supply Chain', 'Procurement Officer', '2018-09-11'),
('EMP009', 'Nitin Gadkari', 'Warehouse', 'Inventory Manager', '2015-07-07'),
('EMP010', 'Dr. Meera Iyer', 'Quality Assurance', 'QA Director', '2012-05-30'),
('EMP011', 'Rahul Verma', 'Quality Control', 'Analyst', '2021-03-10'),
('EMP012', 'Priya Singh', 'Production', 'Packaging Specialist', '2020-07-15'),
('EMP013', 'Amit Shah', 'Warehouse', 'Forklift Operator', '2019-11-20'),
('EMP014', 'Neha Gupta', 'Quality Assurance', 'Compliance Officer', '2016-02-14'),
('EMP015', 'Sanjay Dutt', 'Maintenance', 'Plumbing Tech', '2018-05-05'),
('EMP016', 'Pooja Reddy', 'Supply Chain', 'Vendor Liaison', '2022-01-10'),
('EMP017', 'Arjun Nair', 'Production', 'Machine Operator', '2021-08-25'),
('EMP018', 'Karan Johar', 'Warehouse', 'Logistics Clerk', '2020-12-01'),
('EMP019', 'Riya Sen', 'Quality Control', 'Microbiologist', '2017-09-15'),
('EMP020', 'Manoj Bajpayee', 'Production', 'Shift Manager', '2013-04-20');

INSERT INTO Equipment_Master (Equipment_ID, Equipment_Name, Equipment_Type, Last_Calibration_Date, Status) VALUES
('EQ001', 'High Shear Mixer A', 'Mixer', '2023-01-15', 'Active'),
('EQ002', 'High Shear Mixer B', 'Mixer', '2023-01-20', 'Active'),
('EQ003', 'Fluid Bed Granulator 1', 'Granulator', '2023-01-10', 'Maintenance'),
('EQ004', 'Rotary Tablet Press 1', 'Compressor', '2023-01-05', 'Active'),
('EQ005', 'Rotary Tablet Press 2', 'Compressor', '2023-01-12', 'Active'),
('EQ006', 'Auto Film Coater', 'Coater', '2023-01-01', 'Active'),
('EQ007', 'Blister Packaging Line A', 'Packaging', '2023-01-28', 'Active'),
('EQ008', 'Bottle Filling Line B', 'Packaging', '2023-01-15', 'Active'),
('EQ009', 'Liquid Mixing Tank 500L', 'Liquid Processor', '2023-01-10', 'Active'),
('EQ010', 'Syrup Bottling Station', 'Packaging', '2023-01-01', 'Active'),
('EQ011', 'Capsule Filling Machine', 'Filler', '2023-01-11', 'Active'),
('EQ012', 'V-Cone Blender', 'Mixer', '2023-01-09', 'Active'),
('EQ013', 'Fluid Bed Granulator 2', 'Granulator', '2023-01-18', 'Active'),
('EQ014', 'Tablet Checking Machine', 'QA Equipment', '2023-01-22', 'Active'),
('EQ015', 'Cartoning Machine', 'Packaging', '2023-01-30', 'Maintenance'),
('EQ016', 'Purified Water System', 'Utility', '2023-01-02', 'Active'),
('EQ017', 'Air Handling Unit', 'Utility', '2023-01-03', 'Active'),
('EQ018', 'Industrial Autoclave', 'Sterilizer', '2023-01-14', 'Active'),
('EQ019', 'Metal Detector Line', 'QA Equipment', '2023-01-25', 'Active'),
('EQ020', 'Shrink Wrapping Machine', 'Packaging', '2023-01-29', 'Active');

INSERT INTO Account_Master (Account_No, Account_Name, Phone_No, Address, Account_Type) VALUES
('ACC001', 'AK Pharma Raw Materials', '911023456789', 'Vatva, Gujarat', 'Supplier'),
('ACC002', 'Stallion Chemical Corp', '919099234567', 'Changodar, Gujarat', 'Supplier'),
('ACC003', 'West Coast API Labs', '913243423342', 'Business Park, Ahmedabad', 'Supplier'),
('ACC004', 'Sagar Bulk Drugs', '913891819333', 'Pharma Hub, Mumbai', 'Supplier'),
('ACC005', 'Sehat-E-Zafran Labs', '651231312312', 'ADNEC, Abu Dhabi', 'Supplier'),
('ACC006', 'Justeen Excipients', '233312311333', 'Kosad Road, Nigeria', 'Supplier'),
('ACC007', 'Global Chemicals Ltd', '912233445566', 'Navi Mumbai', 'Supplier'),
('ACC008', 'Pure APIs Inc', '18005551234', 'New York, USA', 'Supplier'),
('ACC009', 'EuroPharma Raw', '442071234567', 'London, UK', 'Supplier'),
('ACC010', 'Zhengzhou Organics', '861012345678', 'Zhengzhou, China', 'Supplier'),
('ACC011', 'Zydus Hospitals', '915685685887', 'Ahmedabad', 'Hospital'),
('ACC012', 'Apollo Pharmacy Chain', '918565655675', 'Ahmedabad', 'Distributor'),
('ACC013', 'Silis Global Distributors', '311312312312', 'Jaipur', 'Distributor'),
('ACC014', 'Danadams Africa Supply', '651308080809', 'Lagos', 'Distributor'),
('ACC015', 'Fortis Healthcare', '911122334455', 'Delhi', 'Hospital'),
('ACC016', 'MedPlus Network', '919988776655', 'Hyderabad', 'Distributor'),
('ACC017', 'Max Super Speciality', '917766554433', 'Gurgaon', 'Hospital'),
('ACC018', 'NetMeds Delivery', '918877665544', 'Chennai', 'Distributor'),
('ACC019', 'Pharmeasy Logistics', '916655443322', 'Mumbai', 'Distributor'),
('ACC020', 'AIIMS Central', '911123456789', 'New Delhi', 'Hospital');

INSERT INTO Material_Master (Material_ID, Material_Name, Material_Type, Storage_Condition, Shelf_Life, Therapeutic_Category, Material_State, isHazardous, isInflammable, UOM, Reorder_Level) VALUES
('MAT001', 'Paracetamol API', 'Drug', 'Room Temp < 30C', 24, 'Antipyretic', 'Solid', FALSE, FALSE, 'kg', 5000),
('MAT002', 'Omeprazole', 'Drug', 'Room Temp < 25C', 24, 'Anti-ulcer', 'Solid', FALSE, FALSE, 'kg', 2000),
('MAT003', 'Azithromycin Dihydrate', 'Drug', 'Room Temp < 25C', 12, 'Antibiotic', 'Solid', FALSE, FALSE, 'kg', 1500),
('MAT004', 'Atorvastatin', 'Drug', 'Protect from light', 18, 'Cardio-vascular', 'Solid', FALSE, FALSE, 'kg', 1000),
('MAT005', 'Amoxycillin Trihydrate', 'Drug', 'Store in dry conditions', 18, 'Antibiotic', 'Solid', TRUE, FALSE, 'kg', 3000),
('MAT006', 'Diphenhydramine', 'Drug', 'Room Temp < 25C', 12, 'Anti-cold', 'Solid', FALSE, FALSE, 'kg', 1000),
('MAT007', 'Sodium Starch Glycolate', 'Excipient', 'Cool and dry place', 36, 'Disintegrating Agent', 'Solid', FALSE, FALSE, 'kg', 8000),
('MAT008', 'Methyl Cellulose', 'Excipient', 'Cool and dry place', 48, 'Binder', 'Solid', FALSE, FALSE, 'kg', 10000),
('MAT009', 'Sucrose', 'Excipient', 'Cool and dry place', 36, 'Sweetener', 'Solid', FALSE, FALSE, 'kg', 15000),
('MAT010', 'Starch', 'Excipient', 'Cool and dry place', 48, 'Filler', 'Solid', FALSE, FALSE, 'kg', 20000),
('MAT011', 'Isopropyl Alcohol', 'Excipient', 'Protect from light', 24, 'Solvent', 'Liquid', TRUE, TRUE, 'ltr', 5000),
('MAT012', 'Vitamin A', 'Supplement', 'Room Temp < 30C', 36, 'Nutritional', 'Solid', FALSE, FALSE, 'kg', 500),
('MAT013', 'Vitamin D3', 'Supplement', 'Room Temp < 30C', 24, 'Nutritional', 'Solid', FALSE, FALSE, 'kg', 500),
('MAT014', 'Lactose Monohydrate', 'Excipient', 'Dry place', 48, 'Diluent', 'Solid', FALSE, FALSE, 'kg', 5000),
('MAT015', 'Magnesium Stearate', 'Excipient', 'Dry place', 36, 'Lubricant', 'Solid', FALSE, FALSE, 'kg', 2000),
('MAT016', 'Talc', 'Excipient', 'Dry place', 60, 'Glidant', 'Solid', FALSE, FALSE, 'kg', 3000),
('MAT017', 'Ciprofloxacin', 'Drug', 'Protect from light', 24, 'Antibiotic', 'Solid', FALSE, FALSE, 'kg', 1500),
('MAT018', 'Ibuprofen', 'Drug', 'Room Temp < 25C', 36, 'Analgesic', 'Solid', FALSE, FALSE, 'kg', 4000),
('MAT019', 'Glimepiride', 'Drug', 'Room Temp < 25C', 24, 'Anti-diabetic', 'Solid', FALSE, FALSE, 'kg', 1000),
('MAT020', 'Propylene Glycol', 'Excipient', 'Room Temp < 25C', 24, 'Solvent', 'Liquid', FALSE, TRUE, 'ltr', 2500);

INSERT INTO Product_Master (Product_ID, Product_Name, Generic_Name, Product_Type, Packing_Type, Packing_Size, SalableorSample, GenericorBranded) VALUES
('PRD001', 'Parabufen', 'Paracetamol Ibuprofen', 'Tablet', 'BLI', '3x10', 'M', 'B'),
('PRD002', 'Omsergy', 'Omeprazole', 'Capsule', 'ALU', '10x10', 'M', 'B'),
('PRD003', 'Exicof', 'Cough Syrup', 'Syrup', 'BOT', '1x1', 'M', 'B'),
('PRD004', 'Atorvastatin 20', 'Atorvastatin', 'Tablet', 'ALU', '3x10', 'M', 'G'),
('PRD005', 'Amoxyn', 'Amoxycillin Oral Susp', 'Syrup', 'BOT', '1x1', 'M', 'B'),
('PRD006', 'Vitarich', 'Multivitamin', 'Tablet', 'ALU', '2x10', 'M', 'B'),
('PRD007', 'Zithrol 500', 'Azithromycin', 'Tablet', 'BLI', '1x3', 'M', 'B'),
('PRD008', 'Aller-D', 'Diphenhydramine', 'Capsule', 'BLI', '2x10', 'M', 'B'),
('PRD009', 'Cipro-Max', 'Ciprofloxacin', 'Tablet', 'ALU', '10x10', 'M', 'B'),
('PRD010', 'Ibupro-G', 'Ibuprofen', 'Tablet', 'BLI', '5x10', 'M', 'G'),
('PRD011', 'Glimeta 2', 'Glimepiride', 'Tablet', 'ALU', '3x15', 'M', 'B'),
('PRD012', 'Para-500', 'Paracetamol', 'Tablet', 'BLI', '10x10', 'S', 'G'),
('PRD013', 'Para-650', 'Paracetamol', 'Tablet', 'BLI', '10x10', 'M', 'G'),
('PRD014', 'Vit-D Core', 'Vitamin D3', 'Capsule', 'BOT', '1x30', 'M', 'B'),
('PRD015', 'Ome-Protect', 'Omeprazole', 'Capsule', 'ALU', '2x15', 'S', 'B'),
('PRD016', 'Amox-500', 'Amoxycillin', 'Capsule', 'BLI', '3x10', 'M', 'G'),
('PRD017', 'Atorva-10', 'Atorvastatin', 'Tablet', 'ALU', '3x10', 'S', 'G'),
('PRD018', 'Zithro-Susp', 'Azithromycin', 'Syrup', 'BOT', '1x1', 'M', 'B'),
('PRD019', 'Glime-M', 'Glimepiride', 'Tablet', 'ALU', '5x10', 'M', 'G'),
('PRD020', 'Cipro-Drops', 'Ciprofloxacin', 'Liquid', 'BOT', '1x1', 'M', 'B');

INSERT INTO Transactions (Invoice_No, Transaction_Date, Currency, Transaction_Type, Paid_Received, Account_No, Total_Value) VALUES

(1001, '2023-02-01', 'INR', 'buy', TRUE, 'ACC001', 150000.00),
(1002, '2023-02-02', 'INR', 'buy', TRUE, 'ACC002', 120000.00),
(1003, '2023-02-03', 'INR', 'buy', FALSE, 'ACC003', 180000.00),
(1004, '2023-02-04', 'USD', 'buy', TRUE, 'ACC004', 50000.00),
(1005, '2023-02-05', 'AED', 'buy', TRUE, 'ACC005', 75000.00),
(1006, '2023-02-06', 'INR', 'buy', TRUE, 'ACC006', 40000.00),
(1007, '2023-02-07', 'INR', 'buy', TRUE, 'ACC007', 95000.00),
(1008, '2023-02-08', 'USD', 'buy', FALSE, 'ACC008', 110000.00),
(1009, '2023-02-09', 'EUR', 'buy', TRUE, 'ACC009', 200000.00),
(1010, '2023-02-10', 'CNY', 'buy', TRUE, 'ACC010', 130000.00),
(1011, '2023-02-11', 'INR', 'buy', TRUE, 'ACC001', 60000.00),
(1012, '2023-02-12', 'INR', 'buy', TRUE, 'ACC002', 70000.00),
(1013, '2023-02-13', 'INR', 'buy', TRUE, 'ACC003', 80000.00),
(1014, '2023-02-14', 'INR', 'buy', FALSE, 'ACC004', 90000.00),
(1015, '2023-02-15', 'INR', 'buy', TRUE, 'ACC005', 100000.00),
(1016, '2023-02-16', 'INR', 'buy', TRUE, 'ACC006', 110000.00),
(1017, '2023-02-17', 'INR', 'buy', TRUE, 'ACC007', 120000.00),
(1018, '2023-02-18', 'INR', 'buy', TRUE, 'ACC008', 130000.00),
(1019, '2023-02-19', 'INR', 'buy', FALSE, 'ACC009', 140000.00),
(1020, '2023-02-20', 'INR', 'buy', TRUE, 'ACC010', 150000.00),
(2001, '2023-04-01', 'INR', 'sell', TRUE, 'ACC011', 250000.00),
(2002, '2023-04-02', 'INR', 'sell', TRUE, 'ACC012', 300000.00),
(2003, '2023-04-03', 'INR', 'sell', FALSE, 'ACC013', 150000.00),
(2004, '2023-04-04', 'INR', 'sell', TRUE, 'ACC014', 400000.00),
(2005, '2023-04-05', 'INR', 'sell', TRUE, 'ACC015', 500000.00),
(2006, '2023-04-06', 'INR', 'sell', TRUE, 'ACC016', 200000.00),
(2007, '2023-04-07', 'INR', 'sell', TRUE, 'ACC017', 350000.00),
(2008, '2023-04-08', 'INR', 'sell', FALSE, 'ACC018', 450000.00),
(2009, '2023-04-09', 'INR', 'sell', TRUE, 'ACC019', 120000.00),
(2010, '2023-04-10', 'INR', 'sell', TRUE, 'ACC020', 280000.00),
(2011, '2023-04-11', 'INR', 'sell', TRUE, 'ACC011', 110000.00),
(2012, '2023-04-12', 'INR', 'sell', TRUE, 'ACC012', 220000.00),
(2013, '2023-04-13', 'INR', 'sell', TRUE, 'ACC013', 330000.00),
(2014, '2023-04-14', 'INR', 'sell', FALSE, 'ACC014', 440000.00),
(2015, '2023-04-15', 'INR', 'sell', TRUE, 'ACC015', 550000.00),
(2016, '2023-04-16', 'INR', 'sell', TRUE, 'ACC016', 660000.00),
(2017, '2023-04-17', 'INR', 'sell', TRUE, 'ACC017', 770000.00),
(2018, '2023-04-18', 'INR', 'sell', FALSE, 'ACC018', 880000.00),
(2019, '2023-04-19', 'INR', 'sell', TRUE, 'ACC019', 990000.00),
(2020, '2023-04-20', 'INR', 'sell', TRUE, 'ACC020', 1000000.00);

INSERT INTO Supplier_Contract (Contract_ID, Account_No, Material_ID, Agreed_Price, Valid_Until) VALUES
('CON001', 'ACC001', 'MAT001', 15.50, '2024-12-31'),
('CON002', 'ACC002', 'MAT002', 45.00, '2024-12-31'),
('CON003', 'ACC003', 'MAT003', 120.00, '2025-06-30'),
('CON004', 'ACC004', 'MAT004', 85.00, '2025-12-31'),
('CON005', 'ACC005', 'MAT005', 30.00, '2024-12-31'),
('CON006', 'ACC006', 'MAT006', 22.50, '2024-08-15'),
('CON007', 'ACC007', 'MAT007', 5.00, '2025-01-01'),
('CON008', 'ACC008', 'MAT008', 8.50, '2024-11-30'),
('CON009', 'ACC009', 'MAT009', 2.00, '2026-12-31'),
('CON010', 'ACC010', 'MAT010', 1.50, '2026-12-31'),
('CON011', 'ACC001', 'MAT011', 12.00, '2024-10-31'),
('CON012', 'ACC002', 'MAT012', 65.00, '2025-05-31'),
('CON013', 'ACC003', 'MAT013', 55.00, '2025-05-31'),
('CON014', 'ACC004', 'MAT014', 4.00, '2024-12-31'),
('CON015', 'ACC005', 'MAT015', 6.00, '2024-12-31'),
('CON016', 'ACC006', 'MAT016', 3.50, '2024-12-31'),
('CON017', 'ACC007', 'MAT017', 110.00, '2025-02-28'),
('CON018', 'ACC008', 'MAT018', 18.00, '2025-03-31'),
('CON019', 'ACC009', 'MAT019', 95.00, '2025-04-30'),
('CON020', 'ACC010', 'MAT020', 14.00, '2024-09-30');

INSERT INTO Warehouse OVERRIDING SYSTEM VALUE VALUES
(1, 'MAT001', 1001, 'UT', 10000),
(2, 'MAT002', 1002, 'UT', 2000),
(3, 'MAT003', 1003, 'UT', 1500),
(4, 'MAT004', 1004, 'UT', 1000),
(5, 'MAT005', 1005, 'UT', 3000),
(6, 'MAT006', 1006, 'UT', 1000),
(7, 'MAT007', 1007, 'UT', 8000),
(8, 'MAT008', 1008, 'UT', 10000),
(9, 'MAT009', 1009, 'UT', 15000),
(10, 'MAT010', 1010, 'UT', 20000),
(11, 'MAT011', 1011, 'UT', 5000),
(12, 'MAT012', 1012, 'UT', 500),
(13, 'MAT013', 1013, 'UT', 500),
(14, 'MAT014', 1014, 'UT', 5000),
(15, 'MAT015', 1015, 'UT', 2000),
(16, 'MAT016', 1016, 'UT', 3000),
(17, 'MAT017', 1017, 'UT', 1500),
(18, 'MAT018', 1018, 'UT', 4000),
(19, 'MAT019', 1019, 'UT', 1000),
(20, 'MAT020', 1020, 'UT', 2500);

INSERT INTO RM_Transaction (Invoice_No, Item_ID, RM_Qty, Val) VALUES
(1001, 1, 10000, 150000.00),
(1002, 2, 2000, 120000.00),
(1003, 3, 1500, 180000.00),
(1004, 4, 1000, 50000.00),
(1005, 5, 3000, 75000.00),
(1006, 6, 1000, 40000.00),
(1007, 7, 8000, 95000.00),
(1008, 8, 10000, 110000.00),
(1009, 9, 15000, 200000.00),
(1010, 10, 20000, 130000.00),
(1011, 11, 5000, 60000.00),
(1012, 12, 500, 70000.00),
(1013, 13, 500, 80000.00),
(1014, 14, 5000, 90000.00),
(1015, 15, 2000, 100000.00),
(1016, 16, 3000, 110000.00),
(1017, 17, 1500, 120000.00),
(1018, 18, 4000, 130000.00),
(1019, 19, 1000, 140000.00),
(1020, 20, 2500, 150000.00);

INSERT INTO Material_Quality_Check (Report_ID, Item_ID, Analysis_Date, Analyst_Name, Sample_Size, Test, Limits, Results, Emp_ID) VALUES
('MQC001', 1, '2023-02-02', 'Legacy_Name', 5, 'Potency', '>95%', 'PASSED', 'EMP001'),
('MQC002', 2, '2023-02-03', 'Legacy_Name', 2, 'Potency', '>98%', 'PASSED', 'EMP002'),
('MQC003', 3, '2023-02-04', 'Legacy_Name', 10, 'Purity', '>99%', 'PASSED', 'EMP011'),
('MQC004', 4, '2023-02-05', 'Legacy_Name', 10, 'Viscosity', 'Standard', 'PASSED', 'EMP019'),
('MQC005', 5, '2023-02-06', 'Legacy_Name', 5, 'Purity', '>99.9%', 'FAILED', 'EMP001'),
('MQC006', 6, '2023-02-07', 'Legacy_Name', 5, 'Potency', '>95%', 'PASSED', 'EMP002'),
('MQC007', 7, '2023-02-08', 'Legacy_Name', 20, 'Moisture', '<5%', 'PASSED', 'EMP011'),
('MQC008', 8, '2023-02-09', 'Legacy_Name', 20, 'Moisture', '<5%', 'PASSED', 'EMP019'),
('MQC009', 9, '2023-02-10', 'Legacy_Name', 30, 'Granularity', 'Standard', 'PASSED', 'EMP001'),
('MQC010', 10, '2023-02-11', 'Legacy_Name', 30, 'Granularity', 'Standard', 'PASSED', 'EMP002'),
('MQC011', 11, '2023-02-12', 'Legacy_Name', 5, 'Purity', '>99%', 'PASSED', 'EMP011'),
('MQC012', 12, '2023-02-13', 'Legacy_Name', 2, 'Assay', '95-105%', 'PASSED', 'EMP019'),
('MQC013', 13, '2023-02-14', 'Legacy_Name', 2, 'Assay', '95-105%', 'PASSED', 'EMP001'),
('MQC014', 14, '2023-02-15', 'Legacy_Name', 10, 'Moisture', '<2%', 'PASSED', 'EMP002'),
('MQC015', 15, '2023-02-16', 'Legacy_Name', 5, 'Purity', '>99%', 'PASSED', 'EMP011'),
('MQC016', 16, '2023-02-17', 'Legacy_Name', 5, 'Purity', '>99%', 'PASSED', 'EMP019'),
('MQC017', 17, '2023-02-18', 'Legacy_Name', 5, 'Potency', '>98%', 'PASSED', 'EMP001'),
('MQC018', 18, '2023-02-19', 'Legacy_Name', 10, 'Potency', '>95%', 'PASSED', 'EMP002'),
('MQC019', 19, '2023-02-20', 'Legacy_Name', 5, 'Potency', '>99%', 'PASSED', 'EMP011'),
('MQC020', 20, '2023-02-21', 'Legacy_Name', 10, 'Viscosity', 'Standard', 'FAILED', 'EMP019');

INSERT INTO Formula_Master (Product_ID, Material_ID, Weight_per_tablet) VALUES
('PRD001', 'MAT001', 500),
('PRD001', 'MAT018', 200),
('PRD002', 'MAT002', 200),
('PRD003', 'MAT006', 1000),
('PRD004', 'MAT004', 20),
('PRD005', 'MAT005', 250),
('PRD006', 'MAT012', 100),
('PRD007', 'MAT003', 500),
('PRD008', 'MAT006', 25),
('PRD009', 'MAT017', 500),
('PRD010', 'MAT018', 400),
('PRD011', 'MAT019', 2),
('PRD012', 'MAT001', 500),
('PRD013', 'MAT001', 650),
('PRD014', 'MAT013', 10),
('PRD015', 'MAT002', 150),
('PRD016', 'MAT005', 500),
('PRD017', 'MAT004', 10),
('PRD018', 'MAT003', 200),
('PRD019', 'MAT019', 1),
('PRD020', 'MAT017', 100);

INSERT INTO Batch (Batch_No, Batch_Size, Mfg_Date, Exp_Date, Product_ID, Stock_Qty, UT_Q_A, Yield_Percentage) VALUES
(5001, 50000, '2023-03-01', '2025-02-28', 'PRD001', 49000, 'UT', 98.00),
(5002, 25000, '2023-03-02', '2025-02-28', 'PRD002', 24800, 'UT', 99.20),
(5003, 10000, '2023-03-03', '2024-03-02', 'PRD003', 9500, 'UT', 95.00),
(5004, 30000, '2023-03-04', '2025-03-03', 'PRD004', 29500, 'UT', 98.33),
(5005, 40000, '2023-03-05', '2024-03-04', 'PRD005', 39000, 'UT', 97.50),
(5006, 50000, '2023-03-06', '2026-03-05', 'PRD006', 48000, 'UT', 96.00),
(5007, 15000, '2023-03-07', '2024-03-06', 'PRD007', 14900, 'UT', 99.33),
(5008, 20000, '2023-03-08', '2024-03-07', 'PRD008', 19800, 'UT', 99.00),
(5009, 60000, '2023-03-09', '2025-03-08', 'PRD009', 59000, 'UT', 98.33),
(5010, 45000, '2023-03-10', '2026-03-09', 'PRD010', 44000, 'UT', 97.77),
(5011, 25000, '2023-03-11', '2025-03-10', 'PRD011', 24500, 'UT', 98.00),
(5012, 80000, '2023-03-12', '2025-03-11', 'PRD012', 79000, 'UT', 98.75),
(5013, 75000, '2023-03-13', '2025-03-12', 'PRD013', 74000, 'UT', 98.66),
(5014, 10000, '2023-03-14', '2025-03-13', 'PRD014', 9800, 'UT', 98.00),
(5015, 20000, '2023-03-15', '2025-03-14', 'PRD015', 19500, 'UT', 97.50),
(5016, 35000, '2023-03-16', '2025-03-15', 'PRD016', 34000, 'UT', 97.14),
(5017, 30000, '2023-03-17', '2025-03-16', 'PRD017', 29000, 'UT', 96.66),
(5018, 15000, '2023-03-18', '2024-03-17', 'PRD018', 14500, 'UT', 96.66),
(5019, 25000, '2023-03-19', '2025-03-18', 'PRD019', 24000, 'UT', 96.00),
(5020, 10000, '2023-03-20', '2024-03-19', 'PRD020', 9500, 'UT', 95.00);

INSERT INTO Material_Dispensing (Batch_No, Item_ID, Quantity_Issued) VALUES
(5001, 7, 500),  -- Dispensing Sodium Starch Glycolate (Disintegrant)
(5001, 8, 200),  -- Dispensing Methyl Cellulose (Binder)
(5001, 15, 50);  -- Dispensing Magnesium Stearate (Lubricant)
(5001, 1, 2500),
(5002, 2, 500),
(5003, 6, 1000),
(5004, 4, 600),
(5005, 5, 1000),
(5006, 12, 50),
(5007, 3, 750),
(5008, 6, 500),
(5009, 17, 3000),
(5010, 18, 1800),
(5011, 19, 50),
(5012, 1, 4000),
(5013, 1, 4875),
(5014, 13, 10),
(5015, 2, 300),
(5016, 5, 1750),
(5017, 4, 300),
(5018, 3, 300),
(5019, 19, 25),
(5020, 17, 100);

INSERT INTO Production_Log (Batch_No, Equipment_ID, Emp_ID, Process_Stage, Start_Time, End_Time) VALUES
(5001, 'EQ001', 'EMP003', 'Dry Mixing', '2023-03-01 08:00:00', '2023-03-01 10:30:00'),
(5002, 'EQ002', 'EMP004', 'Wet Granulation', '2023-03-02 11:00:00', '2023-03-02 15:00:00'),
(5003, 'EQ009', 'EMP005', 'Liquid Processing', '2023-03-03 08:00:00', '2023-03-03 16:30:00'),
(5004, 'EQ004', 'EMP003', 'Compression', '2023-03-04 09:00:00', '2023-03-04 17:00:00'),
(5005, 'EQ009', 'EMP004', 'Liquid Processing', '2023-03-05 08:00:00', '2023-03-05 11:00:00'),
(5006, 'EQ004', 'EMP017', 'Compression', '2023-03-06 08:00:00', '2023-03-06 14:00:00'),
(5007, 'EQ005', 'EMP003', 'Compression', '2023-03-07 10:00:00', '2023-03-07 18:00:00'),
(5008, 'EQ011', 'EMP004', 'Capsule Filling', '2023-03-08 08:00:00', '2023-03-08 16:00:00'),
(5009, 'EQ005', 'EMP017', 'Compression', '2023-03-09 09:00:00', '2023-03-09 17:00:00'),
(5010, 'EQ004', 'EMP003', 'Compression', '2023-03-10 08:00:00', '2023-03-10 15:00:00'),
(5011, 'EQ006', 'EMP004', 'Coating', '2023-03-11 11:00:00', '2023-03-11 19:00:00'),
(5012, 'EQ005', 'EMP017', 'Compression', '2023-03-12 08:00:00', '2023-03-12 20:00:00'),
(5013, 'EQ004', 'EMP003', 'Compression', '2023-03-13 08:00:00', '2023-03-13 19:00:00'),
(5014, 'EQ011', 'EMP004', 'Capsule Filling', '2023-03-14 09:00:00', '2023-03-14 13:00:00'),
(5015, 'EQ011', 'EMP017', 'Capsule Filling', '2023-03-15 14:00:00', '2023-03-15 18:00:00'),
(5016, 'EQ011', 'EMP003', 'Capsule Filling', '2023-03-16 08:00:00', '2023-03-16 16:00:00'),
(5017, 'EQ004', 'EMP004', 'Compression', '2023-03-17 10:00:00', '2023-03-17 16:00:00'),
(5018, 'EQ009', 'EMP017', 'Liquid Processing', '2023-03-18 08:00:00', '2023-03-18 12:00:00'),
(5019, 'EQ005', 'EMP003', 'Compression', '2023-03-19 13:00:00', '2023-03-19 18:00:00'),
(5020, 'EQ009', 'EMP004', 'Liquid Processing', '2023-03-20 08:00:00', '2023-03-20 11:00:00');

INSERT INTO Product_Quality_Check (Report_ID, Batch_No, Analysis_Date, Analyst_Name, Sample_Size, Process_State, Test, Limits, Results, Emp_ID) VALUES
('PQC001', 5001, '2023-03-02', 'Legacy_Name', 100, 'Finished Good', 'Dissolution', '>85% in 30m', 'PASSED', 'EMP001'),
('PQC002', 5002, '2023-03-03', 'Legacy_Name', 50, 'Finished Good', 'Assay', '95%-105%', 'PASSED', 'EMP002'),
('PQC003', 5003, '2023-03-04', 'Legacy_Name', 20, 'Finished Good', 'Viscosity', 'Standard', 'FAILED', 'EMP011'),
('PQC004', 5004, '2023-03-05', 'Legacy_Name', 100, 'Finished Good', 'Hardness', '4-8 kp', 'PASSED', 'EMP019'),
('PQC005', 5005, '2023-03-06', 'Legacy_Name', 20, 'Finished Good', 'pH Level', '5.0-7.0', 'PASSED', 'EMP001'),
('PQC006', 5006, '2023-03-07', 'Legacy_Name', 100, 'Finished Good', 'Assay', '90%-110%', 'PASSED', 'EMP002'),
('PQC007', 5007, '2023-03-08', 'Legacy_Name', 100, 'Finished Good', 'Dissolution', '>80% in 30m', 'PASSED', 'EMP011'),
('PQC008', 5008, '2023-03-09', 'Legacy_Name', 50, 'Finished Good', 'Disintegration', '<15m', 'PASSED', 'EMP019'),
('PQC009', 5009, '2023-03-10', 'Legacy_Name', 100, 'Finished Good', 'Assay', '95%-105%', 'PASSED', 'EMP001'),
('PQC010', 5010, '2023-03-11', 'Legacy_Name', 100, 'Finished Good', 'Hardness', '4-8 kp', 'PASSED', 'EMP002'),
('PQC011', 5011, '2023-03-12', 'Legacy_Name', 50, 'Finished Good', 'Assay', '90%-110%', 'FAILED', 'EMP011'),
('PQC012', 5012, '2023-03-13', 'Legacy_Name', 100, 'Finished Good', 'Dissolution', '>85% in 30m', 'PASSED', 'EMP019'),
('PQC013', 5013, '2023-03-14', 'Legacy_Name', 100, 'Finished Good', 'Hardness', '4-8 kp', 'PASSED', 'EMP001'),
('PQC014', 5014, '2023-03-15', 'Legacy_Name', 50, 'Finished Good', 'Disintegration', '<15m', 'PASSED', 'EMP002'),
('PQC015', 5015, '2023-03-16', 'Legacy_Name', 50, 'Finished Good', 'Assay', '95%-105%', 'PASSED', 'EMP011'),
('PQC016', 5016, '2023-03-17', 'Legacy_Name', 100, 'Finished Good', 'Disintegration', '<15m', 'PASSED', 'EMP019'),
('PQC017', 5017, '2023-03-18', 'Legacy_Name', 100, 'Finished Good', 'Hardness', '4-8 kp', 'PASSED', 'EMP001'),
('PQC018', 5018, '2023-03-19', 'Legacy_Name', 20, 'Finished Good', 'pH Level', '5.0-7.0', 'PASSED', 'EMP002'),
('PQC019', 5019, '2023-03-20', 'Legacy_Name', 100, 'Finished Good', 'Assay', '95%-105%', 'FAILED', 'EMP011'),
('PQC020', 5020, '2023-03-21', 'Legacy_Name', 20, 'Finished Good', 'Viscosity', 'Standard', 'PASSED', 'EMP019');

INSERT INTO FG_Transaction (Invoice_No, Batch_No, Sale_Qty, Val) VALUES
(2001, 5001, 20000, 250000.00),
(2002, 5002, 10000, 300000.00),
(2003, 5003, 5000, 150000.00),
(2004, 5004, 15000, 400000.00),
(2005, 5005, 20000, 500000.00),
(2006, 5006, 25000, 200000.00),
(2007, 5007, 10000, 350000.00),
(2008, 5008, 10000, 450000.00),
(2009, 5009, 30000, 120000.00),
(2010, 5010, 20000, 280000.00),
(2011, 5011, 12000, 110000.00),
(2012, 5012, 40000, 220000.00),
(2013, 5013, 35000, 330000.00),
(2014, 5014, 5000, 440000.00),
(2015, 5015, 10000, 550000.00),
(2016, 5016, 15000, 660000.00),
(2017, 5017, 15000, 770000.00),
(2018, 5018, 7000, 880000.00),
(2019, 5019, 12000, 990000.00),
(2020, 5020, 4000, 1000000.00);

INSERT INTO Product_Recall (Recall_ID, Batch_No, Date_Initiated, Reason, Qty_Recalled) VALUES
('REC001', 5003, '2023-05-01', 'Failed viscosity stability tests.', 5000),
('REC002', 5011, '2023-05-02', 'Assay degraded below 90% in market.', 12000),
('REC003', 5019, '2023-05-03', 'Contamination warning from raw supplier.', 12000),
('REC004', 5001, '2023-05-04', 'Packaging label misprint.', 1000),
('REC005', 5002, '2023-05-05', 'Seal integrity failure reported.', 500),
('REC006', 5004, '2023-05-06', 'Customer reports of bad odor.', 2000),
('REC007', 5005, '2023-05-07', 'pH level dropped out of spec.', 3000),
('REC008', 5006, '2023-05-08', 'Voluntary recall - updated formulation.', 4000),
('REC009', 5007, '2023-05-09', 'Failed 3-month dissolution test.', 1500),
('REC010', 5008, '2023-05-10', 'Capsule shells brittle.', 2500),
('REC011', 5009, '2023-05-11', 'Incorrect expiry date printed.', 5000),
('REC012', 5010, '2023-05-12', 'Discoloration of tablets.', 1000),
('REC013', 5012, '2023-05-13', 'Failed friability test post-shipping.', 8000),
('REC014', 5013, '2023-05-14', 'Blister pack foil delamination.', 4500),
('REC015', 5014, '2023-05-15', 'Sub-potent assay reported by distributor.', 500),
('REC016', 5015, '2023-05-16', 'Cross-contamination suspected.', 2000),
('REC017', 5016, '2023-05-17', 'Failed microbial limits test.', 3500),
('REC018', 5017, '2023-05-18', 'Foreign particle found in bottle.', 100),
('REC019', 5018, '2023-05-19', 'Syrup crystallized prematurely.', 3000),
('REC020', 5020, '2023-05-20', 'Dropper malfunction reported.', 1500);

INSERT INTO Maintenance_Log (Maintenance_ID, Equipment_ID, Emp_ID, Maintenance_Date, Cost) VALUES
('ML001', 'EQ003', 'EMP006', '2023-01-11', 4500.00),
('ML002', 'EQ015', 'EMP007', '2023-01-31', 1200.50),
('ML003', 'EQ001', 'EMP015', '2023-02-15', 850.00),
('ML004', 'EQ002', 'EMP006', '2023-02-20', 300.00),
('ML005', 'EQ004', 'EMP007', '2023-03-05', 1500.00),
('ML006', 'EQ005', 'EMP015', '2023-03-10', 900.00),
('ML007', 'EQ006', 'EMP006', '2023-03-15', 2100.00),
('ML008', 'EQ007', 'EMP007', '2023-03-20', 400.00),
('ML009', 'EQ008', 'EMP015', '2023-03-25', 650.00),
('ML010', 'EQ009', 'EMP006', '2023-04-01', 5000.00),
('ML011', 'EQ010', 'EMP007', '2023-04-05', 750.00),
('ML012', 'EQ011', 'EMP015', '2023-04-10', 1100.00),
('ML013', 'EQ012', 'EMP006', '2023-04-15', 300.00),
('ML014', 'EQ013', 'EMP007', '2023-04-20', 4200.00),
('ML015', 'EQ014', 'EMP015', '2023-04-25', 800.00),
('ML016', 'EQ016', 'EMP006', '2023-05-01', 6000.00),
('ML017', 'EQ017', 'EMP007', '2023-05-05', 2500.00),
('ML018', 'EQ018', 'EMP015', '2023-05-10', 1800.00),
('ML019', 'EQ019', 'EMP006', '2023-05-15', 950.00),
('ML020', 'EQ020', 'EMP007', '2023-05-20', 450.00);



--- Trigger - 1 is based on material dispensing : this trigger is getting firee
-- when we deduct stock

-- =====================================================================
-- FUNCTION: Automate Warehouse Stock Deduction
-- DESCRIPTION: When a batch takes material, deduct it from the warehouse.
--              If there isn't enough stock, block the transaction.
-- =====================================================================

CREATE OR REPLACE FUNCTION automate_warehouse_stock()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_stock NUMERIC(10);
BEGIN
    -- 1. Find out how much stock we currently have for this specific item
    SELECT Stock INTO v_current_stock 
    FROM Warehouse 
    WHERE Item_ID = NEW.Item_ID;

    -- 2. Safety Check: Do we have enough stock to fulfill this request?
    IF v_current_stock < NEW.Quantity_Issued THEN
        RAISE EXCEPTION 'Transaction Blocked: Not enough stock! Item % only has % units left, but you tried to dispense %.', 
                        NEW.Item_ID, v_current_stock, NEW.Quantity_Issued;
    END IF;

    -- 3. If we have enough stock, safely deduct it from the Warehouse
    UPDATE Warehouse
    SET Stock = Stock - NEW.Quantity_Issued
    WHERE Item_ID = NEW.Item_ID;

    -- 4. Allow the original INSERT into Material_Dispensing to finish
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deduct_stock_on_dispense
AFTER INSERT ON Material_Dispensing
FOR EACH ROW
EXECUTE FUNCTION automate_warehouse_stock();

--- This is an example of trigger when
INSERT INTO Material_Dispensing (Batch_No, Item_ID, Quantity_Issued) VALUES (5001, 2, 999999);


--- Trigger-2 :

-- =====================================================================
-- FUNCTION: FDA Compliance Enforcer
-- DESCRIPTION: Prevents the sale of any batch in FG_Transaction if it 
--              failed Quality Control or hasn't been tested yet.
-- =====================================================================

CREATE OR REPLACE FUNCTION enforce_quality_control()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    v_qa_result VARCHAR(30);
BEGIN
    -- 1. Look up the official lab result for the batch they are trying to sell
    SELECT Results INTO v_qa_result
    FROM Product_Quality_Check
    WHERE Batch_No = NEW.Batch_No;

    -- 2. Safety Rule A: Has it been tested at all?
    IF v_qa_result IS NULL THEN
        RAISE EXCEPTION 'COMPLIANCE BLOCK: Batch % has not been tested by the QC Lab yet. Sale is illegal!', NEW.Batch_No;
    END IF;

    -- 3. Safety Rule B: Did it fail the test?
    IF v_qa_result = 'FAILED' THEN
        RAISE EXCEPTION 'SAFETY BLOCK: Batch % FAILED quality control. This batch must be quarantined, not sold!', NEW.Batch_No;
    END IF;

    -- 4. If it exists and didn't fail (i.e., 'PASSED'), allow the sale to proceed
    RETURN NEW;
END;
$$;

-- Bind the trigger to fire BEFORE the sale is finalized
CREATE TRIGGER trg_prevent_bad_sales
BEFORE INSERT ON FG_Transaction
FOR EACH ROW
EXECUTE FUNCTION enforce_quality_control();


-- Trying to sell Batch 5003 to Invoice 2020
INSERT INTO FG_Transaction (Invoice_No, Batch_No, Sale_Qty, Val) 
VALUES (2020, 5003, 1000, 50000.00);

-- Trying to sell an unverified Batch 5000
INSERT INTO FG_Transaction (Invoice_No, Batch_No, Sale_Qty, Val) 
VALUES (2020, 5000, 1000, 50000.00);

-- Selling a safe batch
INSERT INTO FG_Transaction (Invoice_No, Batch_No, Sale_Qty, Val) 
VALUES (2020, 5001, 1000, 50000.00);

-- =====================================================================
-- FUNCTION: Strict Batch Date Enforcer
-- DESCRIPTION: Prevents setting manufacturing dates in the future, and 
--              ensures a minimum 6-month shelf life.
-- =====================================================================

CREATE OR REPLACE FUNCTION enforce_batch_dates()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Rule 1: Prevent "Time Travel" (Manufacturing in the future)
    IF NEW.Mfg_Date > CURRENT_DATE THEN
        RAISE EXCEPTION 'TIME TRAVEL DETECTED: You cannot set a Manufacturing Date (%) in the future!', NEW.Mfg_Date;
    END IF;

    -- Rule 2: Ensure minimum 6-month shelf life
    -- (We add 6 months to the Mfg_Date and compare it to Exp_Date)
    IF NEW.Exp_Date < (NEW.Mfg_Date + INTERVAL '6 months') THEN
        RAISE EXCEPTION 'QUALITY BLOCK: The Expiry Date (%) must be at least 6 months after the Manufacturing Date (%).', NEW.Exp_Date, NEW.Mfg_Date;
    END IF;

    -- If both rules pass, allow the INSERT or UPDATE to finish
    RETURN NEW;
END;
$$;

-- Bind the trigger to fire BEFORE BOTH Inserts and Updates!
CREATE TRIGGER trg_strict_batch_dates
BEFORE INSERT OR UPDATE ON Batch
FOR EACH ROW
EXECUTE FUNCTION enforce_batch_dates();

UPDATE Batch  SET Mfg_Date = '2099-01-01' WHERE Batch_No = 5001;

INSERT INTO Batch (Batch_No, Batch_Size, Mfg_Date, Exp_Date, Product_ID, Stock_Qty) 
VALUES (9999, 10000, '2024-01-01', '2024-02-01', 'PRD001', 10000);


-- =====================================================================
-- FUNCTION: The Silent Auditor
-- DESCRIPTION: Tracks any modifications or deletions of Lab Results.
-- =====================================================================
CREATE OR REPLACE FUNCTION track_qc_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    -- SCENARIO A: Someone is trying to UPDATE a lab result
    IF TG_OP = 'UPDATE' THEN
        -- If the result actually changed, log the evidence!
        IF OLD.Results IS DISTINCT FROM NEW.Results THEN
            INSERT INTO QC_Audit_Log (Report_ID, Action_Type, Old_Result, New_Result, Changed_By)
            VALUES (OLD.Report_ID, 'UPDATE', OLD.Results, NEW.Results, CURRENT_USER);
        END IF;
        RETURN NEW;

    -- SCENARIO B: Someone is trying to totally DELETE a lab record
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO QC_Audit_Log (Report_ID, Action_Type, Old_Result, New_Result, Changed_By)
        VALUES (OLD.Report_ID, 'DELETE', OLD.Results, 'RECORD DESTROYED', CURRENT_USER);
        RETURN OLD;
    END IF;
END;
$$;

-- Bind the trigger to listen AFTER someone touches the QC table
CREATE TRIGGER trg_audit_qc_changes
AFTER UPDATE OR DELETE ON Product_Quality_Check
FOR EACH ROW
EXECUTE FUNCTION track_qc_changes();


UPDATE Product_Quality_Check SET Results = 'PASSED' WHERE Report_ID = 'PQC003';

DELETE FROM Product_Quality_Check WHERE Report_ID = 'PQC005';

SELECT * FROM QC_Audit_Log;



-- =====================================================================
-- VIEW: FDA End-to-End Batch Traceability
-- DESCRIPTION: A complete lifecycle map of every batch, showing its 
--              ingredients, QC status, and market sales.
-- =====================================================================

CREATE OR REPLACE VIEW v_fda_batch_traceability AS
SELECT 
    B.Batch_No,
    PM.Product_Name,
    B.Mfg_Date,
    B.Exp_Date,
    COALESCE(QC.Results, 'UNTESTED') AS QC_Status,
    STRING_AGG(DISTINCT MM.Material_Name, ', ') AS Raw_Materials_Used,
    COALESCE(SUM(FGT.Sale_Qty), 0) AS Total_Sold_To_Market
FROM Batch B
JOIN Product_Master PM ON B.Product_ID = PM.Product_ID
LEFT JOIN Product_Quality_Check QC ON B.Batch_No = QC.Batch_No
LEFT JOIN Material_Dispensing MD ON B.Batch_No = MD.Batch_No
LEFT JOIN Warehouse W ON MD.Item_ID = W.Item_ID
LEFT JOIN Material_Master MM ON W.Material_ID = MM.Material_ID
LEFT JOIN FG_Transaction FGT ON B.Batch_No = FGT.Batch_No
GROUP BY 
    B.Batch_No, 
    PM.Product_Name, 
    B.Mfg_Date, 
    B.Exp_Date, 
    QC.Results;

SELECT * FROM v_fda_batch_traceability;

-- =====================================================================
-- VIEW: Procurement Dashboard (Low Stock Alert)
-- DESCRIPTION: Instantly shows the purchasing team exactly which 
--              materials have dropped below their safe reorder limit.
-- =====================================================================

CREATE OR REPLACE VIEW v_inventory_shortage AS
SELECT 
    w.Item_ID,
    m.Material_Name,
    m.Material_Type,
    w.Stock AS Current_Stock,
    m.Reorder_Level AS Minimum_Required,
    (m.Reorder_Level - w.Stock) AS Units_To_Order
FROM Warehouse w
JOIN Material_Master m ON w.Material_ID = m.Material_ID
WHERE w.Stock <= m.Reorder_Level;

SELECT * FROM v_inventory_shortage;


-- =====================================================================
-- VIEW: Expiry Risk & Inventory Liability Dashboard
-- DESCRIPTION: Tracks unsold finished goods, calculates days until 
--              expiry, and flags high-risk inventory using status codes.
-- =====================================================================

CREATE OR REPLACE VIEW v_inventory_expiry_risk AS
SELECT 
    B.Batch_No,
    PM.Product_Name,
    B.Exp_Date,
    (B.Exp_Date - CURRENT_DATE) AS Days_Remaining,
    
    -- Professional Status Codes
    CASE 
        WHEN (B.Exp_Date - CURRENT_DATE) < 0 THEN 'EXPIRED - DO NOT SELL'
        WHEN (B.Exp_Date - CURRENT_DATE) <= 30 THEN 'CRITICAL - UNDER 30 DAYS'
        WHEN (B.Exp_Date - CURRENT_DATE) <= 90 THEN 'WARNING - UNDER 90 DAYS'
        ELSE 'SAFE'
    END AS Risk_Status,
    
    B.Stock_Qty AS Manufactured_Qty,
    COALESCE(SUM(FGT.Sale_Qty), 0) AS Total_Sold_Qty,
    
    -- Calculate exactly how many units are sitting unsold on the shelf
    (B.Stock_Qty - COALESCE(SUM(FGT.Sale_Qty), 0)) AS Unsold_Inventory

FROM Batch B
JOIN Product_Master PM ON B.Product_ID = PM.Product_ID
LEFT JOIN FG_Transaction FGT ON B.Batch_No = FGT.Batch_No

GROUP BY 
    B.Batch_No, 
    PM.Product_Name, 
    B.Exp_Date, 
    B.Stock_Qty

-- ONLY show batches where we still have unsold inventory
HAVING (B.Stock_Qty - COALESCE(SUM(FGT.Sale_Qty), 0)) > 0

-- Sort the most dangerous (expiring soonest) to the top
ORDER BY Days_Remaining ASC;

SELECT * from v_inventory_expiry_risk;

-- 1. Test "CRITICAL" (Set Expiry to 15 days from today)
UPDATE Batch 
SET Exp_Date = CURRENT_DATE + INTERVAL '15 days' 
WHERE Batch_No = 5001;

-- 2. Test "WARNING" (Set Expiry to 60 days from today)
UPDATE Batch 
SET Exp_Date = CURRENT_DATE + INTERVAL '60 days' 
WHERE Batch_No = 5002;

-- 3. Test "SAFE" (Set Expiry to 1 year from today)
UPDATE Batch 
SET Exp_Date = CURRENT_DATE + INTERVAL '1 year' 
WHERE Batch_No = 5004;


-- =====================================================================
-- PROCEDURE: Execute Emergency Product Recall (Tailored)
-- DESCRIPTION: Integrates exactly with the user's Product_Recall table,
--              enforcing all custom constraints and VARCHAR keys.
-- =====================================================================

CREATE OR REPLACE PROCEDURE execute_product_recall(
    p_recall_id VARCHAR(20),  -- Added to satisfy your Primary Key
    p_batch_no NUMERIC,
    p_reason VARCHAR(255)     -- Matched to your 255 character limit
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_unsold_qty NUMERIC;
BEGIN
    -- 1. Find out exactly how many units are currently in the warehouse
    SELECT Stock_Qty INTO v_unsold_qty 
    FROM Batch 
    WHERE Batch_No = p_batch_no;

    -- Safety Check A: Does this batch exist?
    IF v_unsold_qty IS NULL THEN
        RAISE EXCEPTION 'RECALL FAILED: Batch % does not exist in the system.', p_batch_no;
    END IF;

    -- Safety Check B: Satisfy your CHECK (Qty_Recalled > 0) constraint
    IF v_unsold_qty <= 0 THEN
         RAISE EXCEPTION 'RECALL FAILED: Batch % has 0 stock in the warehouse. Nothing left to quarantine!', p_batch_no;
    END IF;

    -- 2. Log the event into YOUR exact table
    INSERT INTO Product_Recall (Recall_ID, Batch_No, Date_Initiated, Reason, Qty_Recalled)
    VALUES (p_recall_id, p_batch_no, CURRENT_DATE, p_reason, v_unsold_qty);

    -- 3. Zero out the warehouse stock
    UPDATE Batch 
    SET Stock_Qty = 0 
    WHERE Batch_No = p_batch_no;

    -- 4. Overwrite the Quality Control lab result to quarantine the batch
    UPDATE Product_Quality_Check 
    SET Results = 'RECALLED' 
    WHERE Batch_No = p_batch_no;

END;
$$;

CALL execute_product_recall(
    'REC-5004-A', 
    5004, 
    'CRITICAL: Stability test failed at 6 months. Active ingredient degraded.'
);

SELECT * FROM Product_Recall;

