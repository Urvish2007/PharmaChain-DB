# Rule: Batch date sanity checks (trg_strict_batch_dates)

Applies to: the Batch table, on INSERT and UPDATE.

Two independent checks run whenever a batch's manufacturing or expiry date is set or changed:

1. Manufacturing date cannot be in the future. A batch cannot claim to have been made on a date
   that hasn't happened yet - this rule exists to catch data-entry errors (like a typo'd year)
   before they corrupt downstream traceability records.
2. Expiry date must be at least six months after the manufacturing date. Pharmaceutical shelf
   life is a regulated, product-specific value, but requiring a sane minimum window catches
   obviously wrong entries (like an expiry date accidentally set before the manufacturing date,
   or only days after it).

If either check fails, the INSERT or UPDATE is rejected with an exception describing which of
the two rules was violated. The application's own BatchService re-checks both conditions before
even sending the request to the database, purely so the error comes back fast with a clear
message - but the database trigger is what actually guarantees the rule can never be violated,
regardless of which code path tries to write the row.
