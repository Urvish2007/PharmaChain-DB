package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InitiateRecallRequest(
        @NotBlank String recallId,
        @NotNull Long batchNo,
        @NotBlank String reason
) {
}
