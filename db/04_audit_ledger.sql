SET search_path TO pharma_manufacturing;

CREATE TABLE audit_ledger (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    data_payload TEXT,
    performed_by VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL
);

-- We need a Genesis Block (the very first record) so subsequent hashes have something to chain from.
INSERT INTO audit_ledger (
    action, entity_name, entity_id, data_payload, performed_by, timestamp, previous_hash, current_hash
) VALUES (
    'GENESIS', 'System', '0', '{"info": "Initialization of the Cryptographic Audit Ledger"}', 'system', NOW(),
    '0000000000000000000000000000000000000000000000000000000000000000',
    '811a91e1d752edce57b01851210168393e87d15fc3a3b53e77f0c1363e8a49ba'
);
