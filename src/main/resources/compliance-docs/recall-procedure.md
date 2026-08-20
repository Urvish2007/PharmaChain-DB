# Emergency recall procedure (execute_product_recall)

This is a stored procedure in the database, not just an application function - it is called
directly (via a raw JDBC CallableStatement in RecallService, not re-implemented in Java) so that
its three effects always happen together, atomically, no matter which client invokes it:

1. Inserts a new row into Product_Recall recording the recall ID, the affected batch number,
   the reason, the date initiated, and the quantity recalled (the batch's full stock quantity
   at the time of the recall).
2. Sets the affected Batch's Stock_Qty to zero, so the batch immediately shows as having no
   sellable inventory in every dashboard and query that reads current stock.
3. Updates the batch's Product_Quality_Check result to RECALLED. Because trg_prevent_bad_sales
   only allows selling a batch whose QC result is PASSED, this one change is also what makes it
   impossible to sell the batch going forward - the sales block and the recall quarantine reuse
   the exact same mechanism.

Initiating a recall requires the ADMIN or QC_ANALYST role (POST /api/v1/recalls). Recalls cannot
be undone through the API - if a recall was a mistake, the fix is a new, correct
Product_Quality_Check entry for the batch, not deleting the recall record, since the recall
itself is part of the batch's permanent traceability history.
