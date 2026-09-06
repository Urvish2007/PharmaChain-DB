package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ESignatureRequest(
        @NotBlank(message = "Entity ID is required")
        String entityId,
        
        @NotBlank(message = "Entity name is required")
        String entityName,
        
        @NotBlank(message = "Action is required")
        String action,
        
        @NotBlank(message = "Password is required for re-authentication")
        String password,
        
        @NotBlank(message = "Signature meaning is required")
        String meaning
) {}
