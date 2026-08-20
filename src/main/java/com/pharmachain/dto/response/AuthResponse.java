package com.pharmachain.dto.response;

public record AuthResponse(
        String token,
        String tokenType,
        String username,
        String role,
        long expiresInSeconds
) {
    public static AuthResponse bearer(String token, String username, String role, long expiresInSeconds) {
        return new AuthResponse(token, "Bearer", username, role, expiresInSeconds);
    }
}
