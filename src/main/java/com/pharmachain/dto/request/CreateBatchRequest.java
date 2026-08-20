package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * stockQty is optional and defaults to batchSize (nothing sold yet at creation time).
 * Date rules (no future mfg date, >= 6 month shelf life) are enforced by trg_strict_batch_dates
 * regardless of what the service layer checks.
 */
public record CreateBatchRequest(
        @NotNull Long batchNo,
        @NotNull @Positive BigDecimal batchSize,
        @NotNull LocalDate mfgDate,
        @NotNull LocalDate expDate,
        @NotBlank String productId,
        BigDecimal stockQty
) {
}
