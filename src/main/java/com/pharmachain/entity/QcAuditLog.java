package com.pharmachain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Mirrors QC_Audit_Log: the append-only, tamper-evident ledger that trg_audit_qc_changes
 * writes to whenever a Product_Quality_Check row is updated or deleted. This entity is
 * read-only from the app's perspective - nothing in this codebase ever INSERTs into it
 * directly, only the trigger does, which is exactly the point (it can't be bypassed by
 * going through the API).
 */
@Entity
@Table(name = "qc_audit_log", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Integer auditId;

    @Column(name = "report_id", length = 20)
    private String reportId;

    @Column(name = "action_type", length = 10)
    private String actionType;

    @Column(name = "old_result", length = 50)
    private String oldResult;

    @Column(name = "new_result", length = 50)
    private String newResult;

    @Column(name = "changed_by", length = 50)
    private String changedBy;

    @Column(name = "change_date")
    private LocalDateTime changeDate;
}
