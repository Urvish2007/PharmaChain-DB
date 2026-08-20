package com.pharmachain.exception;

import java.time.Instant;
import java.util.List;

/**
 * Uniform error body returned by every failed endpoint.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        List<String> details
) {
    public static ApiError of(int status, String code, String message) {
        return new ApiError(Instant.now(), status, code, message, List.of());
    }

    public static ApiError of(int status, String code, String message, List<String> details) {
        return new ApiError(Instant.now(), status, code, message, details);
    }
}
