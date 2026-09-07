SET search_path TO pharma_manufacturing;

-- 1. Create Product_Serialization
CREATE TABLE Product_Serialization (
    Serial_No  VARCHAR(36) PRIMARY KEY, -- e.g. UUID
    Batch_No   NUMERIC(10) NOT NULL REFERENCES Batch(Batch_No) ON DELETE CASCADE ON UPDATE CASCADE,
    Status     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (Status IN ('ACTIVE', 'RECALLED', 'CONSUMED')),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
