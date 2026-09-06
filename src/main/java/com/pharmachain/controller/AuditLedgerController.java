package com.pharmachain.controller;

import com.pharmachain.entity.AuditLedger;
import com.pharmachain.repository.AuditLedgerRepository;
import com.pharmachain.service.AuditLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/audit-ledger")
@RequiredArgsConstructor
public class AuditLedgerController {

    private final AuditLedgerRepository auditLedgerRepository;
    private final AuditLedgerService auditLedgerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR', 'QC_ANALYST', 'WAREHOUSE_MANAGER', 'SALES')")
    public ResponseEntity<List<AuditLedger>> getLedger() {
        return ResponseEntity.ok(auditLedgerRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
    }

    @GetMapping("/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> verifyLedger() {
        boolean isValid = auditLedgerService.verifyLedgerIntegrity();
        return ResponseEntity.ok(Map.of(
            "isValid", isValid,
            "message", isValid ? "Cryptographic ledger integrity verified successfully." : "INTEGRITY COMPROMISED: Hash mismatch detected!"
        ));
    }
}
