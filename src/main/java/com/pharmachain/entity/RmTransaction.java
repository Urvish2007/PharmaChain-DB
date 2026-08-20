package com.pharmachain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Mirrors RM_Transaction: the raw-material purchase line linking an invoice to a warehouse lot. */
@Entity
@Table(name = "rm_transaction", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RmTransaction {

    @EmbeddedId
    private RmTransactionId id;

    @Column(name = "rm_qty", nullable = false)
    private BigDecimal rmQty;

    @Column(name = "val", precision = 10, scale = 2, nullable = false)
    private BigDecimal val;
}
