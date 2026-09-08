SET search_path TO pharma_manufacturing;

-- Rule 1: Prevent Future Manufacturing Dates
CREATE OR REPLACE FUNCTION check_mfg_date() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.Mfg_Date > CURRENT_DATE THEN
        RAISE EXCEPTION 'FDA Compliance Error: Manufacturing date cannot be in the future. (Batch: %)', NEW.Batch_No;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_future_mfg_date ON Batch;
CREATE TRIGGER trg_prevent_future_mfg_date
BEFORE INSERT OR UPDATE ON Batch
FOR EACH ROW EXECUTE FUNCTION check_mfg_date();

-- Rule 2: Prevent Sale of Unapproved Batches
CREATE OR REPLACE FUNCTION check_qc_before_sale() RETURNS TRIGGER AS $$
DECLARE
    v_qc_status VARCHAR(2);
BEGIN
    SELECT UT_Q_A INTO v_qc_status FROM Batch WHERE Batch_No = NEW.Batch_No;
    
    IF v_qc_status != 'A' THEN
        RAISE EXCEPTION 'FDA Compliance Error: Cannot sell Batch % because its QC Status is % (Must be A = Approved)', NEW.Batch_No, v_qc_status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_sale_without_qc ON FG_Transaction;
CREATE TRIGGER trg_prevent_sale_without_qc
BEFORE INSERT ON FG_Transaction
FOR EACH ROW EXECUTE FUNCTION check_qc_before_sale();

-- Rule 3: Deduct Stock On Dispense
CREATE OR REPLACE FUNCTION deduct_stock_on_dispense() RETURNS TRIGGER AS $$
DECLARE
    v_current_stock NUMERIC(10);
BEGIN
    -- Get current stock
    SELECT Stock INTO v_current_stock FROM Warehouse WHERE Item_ID = NEW.Item_ID FOR UPDATE;
    
    -- Check if we have enough stock
    IF v_current_stock < NEW.Quantity_Issued THEN
        RAISE EXCEPTION 'FDA Compliance Error: Insufficient stock. Attempted to dispense % units, but only % units available for Item %', NEW.Quantity_Issued, v_current_stock, NEW.Item_ID;
    END IF;
    
    -- Deduct stock
    UPDATE Warehouse SET Stock = Stock - NEW.Quantity_Issued WHERE Item_ID = NEW.Item_ID;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_stock_on_dispense ON Material_Dispensing;
CREATE TRIGGER trg_deduct_stock_on_dispense
BEFORE INSERT ON Material_Dispensing
FOR EACH ROW EXECUTE FUNCTION deduct_stock_on_dispense();

-- Rule 4: Prevent Use of Uncalibrated Equipment
CREATE OR REPLACE FUNCTION fn_prevent_uncalibrated_equipment()
RETURNS TRIGGER AS $$
DECLARE
    v_last_calibration DATE;
    v_freq_days NUMERIC(10);
BEGIN
    IF NEW.Equipment_ID IS NOT NULL THEN
        SELECT Last_Calibration_Date, Calibration_Frequency_Days
        INTO v_last_calibration, v_freq_days
        FROM Equipment_Master
        WHERE Equipment_ID = NEW.Equipment_ID;

        IF v_last_calibration + (v_freq_days * interval '1 day') < CURRENT_DATE THEN
            RAISE EXCEPTION 'FDA Compliance Violation: Equipment % is past its calibration due date (Due: %).', 
                NEW.Equipment_ID, (v_last_calibration + (v_freq_days * interval '1 day'));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_uncalibrated_equipment ON Production_Log;
CREATE TRIGGER trg_prevent_uncalibrated_equipment
BEFORE INSERT OR UPDATE ON Production_Log
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_uncalibrated_equipment();


