package com.pharmachain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Mirrors Product_Quality_Check: the finished-goods lab report for a batch. This is the
 * table trg_prevent_bad_sales consults - a batch cannot be sold (no FG_Transaction insert
 * will succeed) until it has a row here with Results = 'PASSED'. Any UPDATE or DELETE on
 * this table is captured by trg_audit_qc_changes into QC_Audit_Log for FDA 21 CFR Part 11
 * traceability.
 */
@Entity
@Table(name = "product_quality_check", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductQualityCheck {

    @Id
    @Column(name = "report_id", length = 20)
    private String reportId;

    @Column(name = "batch_no")
    private Long batchNo;

    @Column(name = "analysis_date", nullable = false)
    private LocalDate analysisDate;

    @Column(name = "analyst_name", length = 20, nullable = false)
    private String analystName;

    @Column(name = "sample_size", nullable = false)
    private BigDecimal sampleSize;

    @Column(name = "process_state", length = 20, nullable = false)
    private String processState;

    @Column(name = "test", length = 20, nullable = false)
    private String test;

    @Column(name = "limits", length = 20, nullable = false)
    private String limits;

    /** PASSED | FAILED | RECALLED - read by trg_prevent_bad_sales before every sale. */
    @Column(name = "results", length = 30, nullable = false)
    private String results;

    @Column(name = "emp_id", length = 20)
    private String empId;
}
