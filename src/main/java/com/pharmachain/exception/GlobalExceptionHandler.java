package com.pharmachain.exception;

import jakarta.validation.ConstraintViolationException;
import org.postgresql.util.PSQLException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

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
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
     * Bean Validation failures that aren't on a @Valid @RequestBody - e.g. a future
     * @Validated @RequestParam/@PathVariable constraint. Not currently reachable by any
     * endpoint in this project, but cheap to have ready for the next one that needs it.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex) {
        List<String> details = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "VALIDATION_FAILED", "One or more parameters are invalid", details));
    }

    /**
     * A path variable or query param that can't be converted to its target type - e.g.
     * GET /api/v1/batches/not-a-number, where {batchNo} is a Long. Without this, Spring's
     * conversion failure was falling through to the generic 500 handler, which is misleading:
     * this is a malformed request, not a server error.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String expected = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "a different type";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "INVALID_PARAMETER",
                        "'%s' is not a valid value for '%s' - expected %s"
                                .formatted(ex.getValue(), ex.getName(), expected)));
    }

    /** Malformed JSON, or a value that doesn't match the target type, in a request body. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleMalformedBody(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "MALFORMED_REQUEST_BODY", "The request body is missing or not valid JSON"));
    }

    /**
     * A route that doesn't match any controller at all. Spring Boot only throws this (instead of
     * quietly delegating to its own default 404 handling, which returns a differently-shaped
     * body) when spring.mvc.throw-exception-if-no-handler-found and
     * spring.web.resources.add-mappings=false are both set - see application.yml - specifically
     * so a request to a nonexistent endpoint still gets this project's normal ApiError shape.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiError> handleNoHandler(NoHandlerFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.of(404, "NOT_FOUND", "No endpoint matches " + ex.getHttpMethod() + " " + ex.getRequestURL()));
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
        log.error("Unexpected exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of(500, "INTERNAL_ERROR", "Something went wrong: " + ex.getMessage()));
    }

    private Throwable rootCause(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause;
    }
}
