package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Records an incoming raw-material purchase end-to-end: a 'buy' row in Transactions, a new
 * Warehouse lot for the received material, and the RM_Transaction line joining the two.
 * See PurchaseService - this is one logical operation split across three tables.
 */
public record RecordPurchaseRequest(
        @NotNull Long invoiceNo,
        @NotNull LocalDate transactionDate,
        @NotBlank String currency,
        @NotBlank String accountNo,
        @NotNull @Positive BigDecimal totalValue,
        @NotBlank String materialId,
        @NotNull @Positive BigDecimal quantity,
        String utQA
) {
}
