# Why this system is designed this way: FDA 21 CFR Part 11 in plain terms

21 CFR Part 11 is the FDA regulation governing electronic records and electronic signatures in
FDA-regulated industries, including pharmaceutical manufacturing. It does not mandate any
specific software design, but it does set expectations that heavily influenced how this
project's database layer is built:

- **Audit trails that can't be turned off or bypassed.** Changes to critical records (like a
  finished-goods QC result) need a secure, computer-generated, time-stamped record of what
  changed, by whom, without relying on the application remembering to log it. That is exactly
  what trg_audit_qc_changes and QC_Audit_Log implement.
- **Records that accurately reflect what happened.** A batch record should not be able to claim
  a manufacturing date in the future, or an implausible shelf life - trg_strict_batch_dates
  exists for this reason.
- **Preventing unauthorized or premature release of product.** A batch should not be sellable
  before it has been verified safe - trg_prevent_bad_sales is a direct implementation of this
  idea, generalized from paper-based QA release processes into a database constraint.
- **Traceability.** Being able to reconstruct exactly what a batch was made from, tested as, and
  sold as, on demand - v_fda_batch_traceability exists specifically to answer that question in
  one query.

None of this is a full Part 11 compliance implementation (that also covers electronic
signatures, validation documentation, and organizational procedures well outside what a database
schema can enforce) - it is a demonstration of how the *database-level* half of that philosophy
translates into concrete schema design: constraints and triggers as the last line of defense,
not just application code that could be bypassed or have a bug.
