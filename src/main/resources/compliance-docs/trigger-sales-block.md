# Rule: No sale without a passed QC result (trg_prevent_bad_sales)

Applies to: the FG_Transaction table, on every INSERT.

Before a finished-goods sale (an FG_Transaction row referencing a Batch_No) is allowed to save,
the trigger looks up that batch's most relevant row in Product_Quality_Check.

- If there is no Product_Quality_Check row for the batch at all, the sale is rejected with a
  message saying the batch has not been tested by the QC lab yet.
- If the batch's QC result is anything other than PASSED (for example FAILED, or RECALLED after
  an emergency recall was executed), the sale is rejected as well.
- Only a batch whose QC result is PASSED can be sold. This check happens at the database level,
  so it cannot be bypassed even by a client that skips the application's own API and talks to
  the database directly.

Why this matters: this is the core of the compliance story for this project. In a real
pharmaceutical manufacturer, shipping an untested or failed batch is not just a business
mistake, it's a regulatory and patient-safety failure. Enforcing it as a database constraint
(rather than only as an application-level check) means the rule holds even if a future
developer forgets to add the check in a new code path.

If an API request fails with a DB_RULE_VIOLATION error when recording a sale, check the batch's
Product_Quality_Check status via GET /api/v1/quality-checks/products?batchNo=... before assuming
it's a bug.
