package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * results should be PASSED or FAILED - trg_prevent_bad_sales reads this value straight from the
 * database before allowing any future FG_Transaction sale of the batch.
 */
public record SubmitProductQcRequest(
        @NotBlank String reportId,
        @NotNull Long batchNo,
        @NotNull LocalDate analysisDate,
        @NotBlank String analystName,
        @NotNull BigDecimal sampleSize,
        @NotBlank String processState,
        @NotBlank String test,
        @NotBlank String limits,
        @NotBlank @Pattern(regexp = "PASSED|FAILED", message = "must be PASSED or FAILED") String results,
        String empId
) {
}
