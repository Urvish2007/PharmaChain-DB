package com.pharmachain.exception;

import org.postgresql.util.PSQLException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Every exception in the app funnels through here so the API never leaks a raw stack
 * trace or a bare Postgres error string to a client.
 *
 * <p>Two layers of business-rule protection exist in this project: the service layer
 * checks rules up front for a fast, friendly error, and the Postgres triggers
 * (trg_deduct_stock_on_dispense, trg_prevent_bad_sales, trg_strict_batch_dates,
 * plus every CHECK constraint) re-enforce the same rules as a non-bypassable last
 * line of defense. The {@link #handleDataAccess} handler below is what makes that
 * second layer visible to API clients as a normal 422 response instead of a 500.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.of(404, "NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<ApiError> handleBusinessRule(BusinessRuleViolationException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiError.of(422, "BUSINESS_RULE_VIOLATION", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "VALIDATION_FAILED", "One or more fields are invalid", details));
    }

    /**
     * Catches everything that comes back from the database layer - unique/foreign-key/CHECK
     * constraint violations, and the custom RAISE EXCEPTION messages thrown by the four
     * PL/pgSQL triggers. Postgres reports RAISE EXCEPTION under SQLSTATE P0001, which Spring's
     * default translator doesn't map to a specific DataAccessException subtype, so this handler
     * targets the broad DataAccessException and unwraps the root PSQLException itself to recover
     * the human-readable message the trigger actually raised.
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> handleDataAccess(DataAccessException ex) {
        Throwable root = rootCause(ex);
        String message = (root instanceof PSQLException psql && psql.getServerErrorMessage() != null)
                ? psql.getServerErrorMessage().getMessage()
                : "The request violates a database business rule";
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiError.of(422, "DB_RULE_VIOLATION", message));
    }

    /**
     * Handles @PreAuthorize denials. Because method security is an AOP proxy around the
     * controller/service bean, this exception is thrown *during* handler invocation - inside
     * DispatcherServlet's own try/catch - so it reaches this @RestControllerAdvice before it
     * would ever reach the security filter chain's ExceptionTranslationFilter. Without this
     * handler, an authenticated user with the wrong role would see a generic 500, not a 403.
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.of(403, "FORBIDDEN", "Your account role does not have permission to perform this action"));
    }

    /** Covers BadCredentialsException from AuthService.login() and any other Spring Security auth failure. */
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthenticationFailure(org.springframework.security.core.AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.of(401, "UNAUTHENTICATED", "Invalid username or password"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of(500, "INTERNAL_ERROR", "Something went wrong. Please try again."));
    }

    private Throwable rootCause(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause;
    }
}
