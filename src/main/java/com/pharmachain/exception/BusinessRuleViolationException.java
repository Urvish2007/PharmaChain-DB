package com.pharmachain.exception;

/**
 * Thrown by the service layer when a request violates a domain rule -
 * e.g. dispensing more stock than is on hand, or selling a batch that
 * failed QC. The same rules are also enforced by Postgres triggers
 * (trg_deduct_stock_on_dispense, trg_prevent_bad_sales, trg_strict_batch_dates)
 * as a last line of defense; this exception lets the service layer fail
 * fast with a clean message before the round-trip to the database.
 * Mapped to HTTP 422 by {@link GlobalExceptionHandler}.
 */
public class BusinessRuleViolationException extends RuntimeException {

    public BusinessRuleViolationException(String message) {
        super(message);
    }
}
