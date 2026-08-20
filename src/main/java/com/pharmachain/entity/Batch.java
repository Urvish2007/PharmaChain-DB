package com.pharmachain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Mirrors Batch: one production run of a product. trg_strict_batch_dates rejects any
 * INSERT/UPDATE where Mfg_Date is in the future or Exp_Date is less than 6 months after
 * Mfg_Date, so those two rules do not need to be re-implemented in the service layer -
 * they are still validated client-side for a fast error message, but the DB is authoritative.
 */
@Entity
@Table(name = "batch", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// BatchService never sets yieldPercentage when creating a batch (it's a post-production
// figure, not something specified up front) and leaves it null. Without @DynamicInsert,
// Hibernate includes every mapped column in the INSERT - including yield_percentage as an
// explicit NULL - which overwrites the column's `DEFAULT 98.50` instead of letting it apply.
// @DynamicInsert makes Hibernate omit null fields from the INSERT so the DB default is used.
@DynamicInsert
public class Batch {

    @Id
    @Column(name = "batch_no")
    private Long batchNo;

    @Column(name = "batch_size", nullable = false)
    private BigDecimal batchSize;

    @Column(name = "mfg_date", nullable = false)
    private LocalDate mfgDate;

    @Column(name = "exp_date")
    private LocalDate expDate;

    @Column(name = "product_id", length = 20)
    private String productId;

    @Column(name = "stock_qty", nullable = false)
    private BigDecimal stockQty;

    @Column(name = "ut_q_a", length = 2, nullable = false)
    private String utQA;

    @Column(name = "yield_percentage", precision = 5, scale = 2)
    private BigDecimal yieldPercentage;
}
