package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Creating a login account is an ADMIN-only action (see AuthController) - employees don't
 * self-register in an internal manufacturing system. empId is optional: not every account
 * needs to correspond to a real Employee_Master row (e.g. a service/integration account).
 */
public record RegisterUserRequest(
        @NotBlank String username,
        @NotBlank @Size(min = 8, message = "password must be at least 8 characters") String password,
        String empId,
        @NotBlank @Pattern(regexp = "ADMIN|QC_ANALYST|WAREHOUSE_MANAGER|PRODUCTION_SUPERVISOR|SALES|AUDITOR")
        String role
) {
}
