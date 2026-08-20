package com.pharmachain.exception;

/**
 * Thrown when a lookup by id (batch, material, employee, ...) finds nothing.
 * Mapped to HTTP 404 by {@link GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException forId(String entity, Object id) {
        return new ResourceNotFoundException(entity + " '" + id + "' was not found");
    }
}
