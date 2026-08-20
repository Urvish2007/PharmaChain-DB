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
 * Mirrors Product_Recall: an emergency recall record. Rows here are written by the
 * execute_product_recall stored procedure, not by a direct INSERT from the app - see
 * RecallService, which calls the procedure so the batch's stock zero-out and QC
 * quarantine (Results = 'RECALLED') stay atomic with the recall record itself.
 */
@Entity
@Table(name = "product_recall", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRecall {

    @Id
    @Column(name = "recall_id", length = 20)
    private String recallId;

    @Column(name = "batch_no", nullable = false)
    private Long batchNo;

    @Column(name = "date_initiated", nullable = false)
    private LocalDate dateInitiated;

    @Column(name = "reason", length = 255, nullable = false)
    private String reason;

    @Column(name = "qty_recalled", nullable = false)
    private BigDecimal qtyRecalled;
}
