package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Records a finished-goods sale end-to-end: a 'sell' row in Transactions plus the FG_Transaction
 * line. The FG_Transaction insert is what trg_prevent_bad_sales inspects - if the batch hasn't
 * passed QC, this whole request fails with a 422 before anything is committed.
 */
public record RecordSaleRequest(
        @NotNull Long invoiceNo,
        @NotNull LocalDate transactionDate,
        @NotBlank String currency,
        @NotBlank String accountNo,
        @NotNull @Positive BigDecimal totalValue,
        @NotNull Long batchNo,
        @NotNull @Positive BigDecimal saleQty
) {
}
