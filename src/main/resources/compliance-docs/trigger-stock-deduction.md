# Rule: Stock deduction on material dispensing (trg_deduct_stock_on_dispense)

Applies to: the Material_Dispensing table, on every INSERT.

When production issues raw material from a warehouse lot to a batch, a row is inserted into
Material_Dispensing (Batch_No, Item_ID, Quantity_Issued). Before that row is allowed to save,
the trigger looks up the current Stock on the referenced Warehouse lot (by Item_ID).

- If Quantity_Issued is greater than the lot's current Stock, the insert is rejected outright
  with an exception. No partial dispensing happens - it's all or nothing.
- If there is enough stock, the trigger decrements Warehouse.Stock by Quantity_Issued in the
  same transaction as the insert, so the ledger and the physical stock count can never drift
  apart, even under concurrent access.

Why this matters: without this rule, two people could dispense against the same lot at the same
time and the system could report negative stock, or production could "issue" material that
doesn't physically exist. This is the same class of problem inventory systems generically call
overselling, applied to raw materials instead of finished goods.

If an API request fails with a DB_RULE_VIOLATION error mentioning insufficient stock, this is
the rule that blocked it - the fix is to either request less material or dispense from a
different lot that has enough stock.
