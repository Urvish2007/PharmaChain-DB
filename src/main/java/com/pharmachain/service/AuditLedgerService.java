package com.pharmachain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmachain.entity.AuditLedger;
import com.pharmachain.repository.AuditLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLedgerService {

    private final AuditLedgerRepository auditLedgerRepository;
    private final ObjectMapper objectMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized void logAction(String action, String entityName, String entityId, Object payload) {
        String dataPayload = "";
        try {
            if (payload != null) {
                dataPayload = objectMapper.writeValueAsString(payload);
            }
        } catch (Exception e) {
            dataPayload = "Error serializing payload: " + e.getMessage();
        }

        String performedBy = "System";
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            performedBy = authentication.getName();
        }

        LocalDateTime timestamp = LocalDateTime.now();

        // Get the latest block for the previous hash
        AuditLedger lastRecord = auditLedgerRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new IllegalStateException("Audit Ledger genesis block is missing!"));

        String previousHash = lastRecord.getCurrentHash();
        
        // Calculate current hash
        String dataToHash = previousHash + action + entityName + entityId + dataPayload + performedBy + timestamp.toString();
        String currentHash = calculateSHA256(dataToHash);

        AuditLedger newRecord = AuditLedger.builder()
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .dataPayload(dataPayload)
                .performedBy(performedBy)
                .timestamp(timestamp)
                .previousHash(previousHash)
                .currentHash(currentHash)
                .build();

        auditLedgerRepository.save(newRecord);
    }

    private String calculateSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (int i = 0; i < hash.length; i++) {
            String hex = Integer.toHexString(0xff & hash[i]);
            if(hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    @Transactional(readOnly = true)
    public boolean verifyLedgerIntegrity() {
        var allRecords = auditLedgerRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
        if (allRecords.isEmpty()) return true;
        
        String expectedPreviousHash = "0000000000000000000000000000000000000000000000000000000000000000"; 
        
        for (AuditLedger record : allRecords) {
            if (!record.getPreviousHash().equals(expectedPreviousHash)) {
                return false; // Chain broken
            }
            
            if (!record.getAction().equals("GENESIS")) {
                String dataToHash = record.getPreviousHash() + record.getAction() + record.getEntityName() + 
                                    record.getEntityId() + record.getDataPayload() + record.getPerformedBy() + 
                                    record.getTimestamp().toString();
                String calculatedHash = calculateSHA256(dataToHash);
                if (!calculatedHash.equals(record.getCurrentHash())) {
                    return false; // Hash mismatch
                }
            }
            
            expectedPreviousHash = record.getCurrentHash();
        }
        return true;
    }
}
