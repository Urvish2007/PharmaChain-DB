package com.pharmachain.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Issues and validates the HS256-signed JWTs this API uses for stateless authentication.
 * The token's subject is the username; a single "role" claim carries the app_user.role value
 * (ADMIN, QC_ANALYST, ...), which JwtAuthenticationFilter turns into a Spring Security
 * authority of the form ROLE_&lt;role&gt;.
 */
@Component
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                       @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public long expirationSeconds() {
        return expirationMs / 1000;
    }

    /** Returns the token's subject (username) if the signature and expiry are both valid, or empty otherwise. */
    public java.util.Optional<String> extractUsername(String token) {
        return parseClaims(token).map(Claims::getSubject);
    }

    public java.util.Optional<String> extractRole(String token) {
        return parseClaims(token).map(claims -> claims.get("role", String.class));
    }

    private java.util.Optional<Claims> parseClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return java.util.Optional.of(claims);
        } catch (JwtException | IllegalArgumentException e) {
            // Expired, malformed, or signature mismatch - all treated the same: not a valid token.
            return java.util.Optional.empty();
        }
    }
}
