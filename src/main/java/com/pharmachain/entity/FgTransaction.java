package com.pharmachain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Mirrors FG_Transaction: a finished-goods sale line linking an invoice to a batch.
 * Every INSERT here fires trg_prevent_bad_sales, which blocks the sale outright if the
 * batch has no Product_Quality_Check row yet, or if its result is FAILED.
 */
@Entity
@Table(name = "fg_transaction", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FgTransaction {

    @EmbeddedId
    private FgTransactionId id;

    @Column(name = "sale_qty", nullable = false)
    private BigDecimal saleQty;

    @Column(name = "val", precision = 10, scale = 2, nullable = false)
    private BigDecimal val;
}
