package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubmitMaterialQcRequest(
        @NotBlank String reportId,
        @NotNull Long itemId,
        @NotNull LocalDate analysisDate,
        @NotBlank String analystName,
        @NotNull BigDecimal sampleSize,
        @NotBlank String test,
        @NotBlank String limits,
        @NotBlank String results,
        String empId
) {
}
