# The three reporting views

These are read-only SQL views, exposed through GET /api/v1/dashboards/**. They exist so that
multi-table joins and aggregation logic live in one place (the database) instead of being
re-derived independently by every report or dashboard that needs them.

## v_inventory_shortage
Lists every warehouse lot whose current stock has dropped to or below its material's configured
reorder level (Material_Master.Reorder_Level). Answers "what do we need to reorder, and how
much" - it computes units_to_order as the gap between current stock and the reorder level.

## v_inventory_expiry_risk
For every batch, compares how much was manufactured against how much has been sold so far
(summed across FG_Transaction), giving the unsold inventory still sitting in stock, plus how
many days remain until the batch's expiry date. This is what a warehouse or sales team would
check to decide which unsold stock needs to be prioritized for sale, discounted, or written off
before it expires.

## v_fda_batch_traceability
The full lifecycle record for one batch: which product it is, its manufacturing and expiry
dates, its current QC status, which raw materials (and from which suppliers) were used to make
it, and how much has been sold into the market so far. This is the view a regulator or auditor
would want if asked "trace everything about batch X" - it is the single query that answers a
full recall-impact or compliance-audit question without needing to manually join half the
schema.
