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
 * Mirrors Transactions: the single unified ledger of every buy (raw material purchase)
 * and sell (finished-goods sale) invoice. RM_Transaction and FG_Transaction each hang
 * off a row here via Invoice_No.
 */
@Entity
@Table(name = "transactions", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @Column(name = "invoice_no")
    private Long invoiceNo;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "currency", length = 3, nullable = false)
    private String currency;

    /** 'buy' or 'sell' - enforced by a CHECK constraint in the DB. */
    @Column(name = "transaction_type", length = 4, nullable = false)
    private String transactionType;

    @Column(name = "paid_received", nullable = false)
    private Boolean paidReceived;

    @Column(name = "account_no", length = 11, nullable = false)
    private String accountNo;

    @Column(name = "total_value", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalValue;
}
