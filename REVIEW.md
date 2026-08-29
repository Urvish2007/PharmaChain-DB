# Architecture Review — PharmaChain Backend

Scope: full read-through of every Java file, the DDL/triggers/views/procedure, `pom.xml`,
`application.yml`, `SecurityConfig`, the Dockerfile, `docker-compose.yml`, and the CI workflow,
cross-checked against the database's own `CHECK`/`UNIQUE`/`NOT NULL` constraints. 16 real issues
found and fixed; 7 new regression tests added; nothing here is theoretical - every fix below is
tied to a specific line of code or a specific `CHECK` constraint in `db/01_schema_and_data.sql`.

Static verification only (brace/paren balance via a proper tokenizer, internal import
resolution, XML/YAML well-formedness) - this sandbox has no route to Maven Central, so **`mvn
clean verify` should be the first thing run locally** before trusting any of this fully.

---

## 🔴 Critical

### 1. Duplicate client-supplied IDs were silently overwriting existing rows, not failing

The single most important finding. Every entity in this project with a manually-assigned
(non-generated) `@Id` - materials, accounts, employees, equipment, products, supplier contracts,
batches, QC reports, maintenance logs, invoices, and the `Material_Dispensing` composite key -
had the same latent bug:

Spring Data JPA's `repository.save(entity)` calls `entityManager.persist()` only when the
entity's `@Id` is `null`. Every id in this project is client-supplied and therefore always
non-null by the time `save()` is called, so `save()` was actually always calling
`entityManager.merge()` instead. `merge()` on an id that already exists doesn't throw - it
**silently UPDATEs the existing row**. Concretely, before this fix:

- `POST /api/v1/materials` twice with the same `materialId` silently overwrote the first
  material's data with the second submission's - no error, no warning.
- Submitting the same `(batchNo, itemId)` to `POST /api/v1/batches/{batchNo}/dispense` twice
  would silently change `quantity_issued` to the new value. Worse: `trg_deduct_stock_on_dispense`
  is a `BEFORE INSERT` trigger, so it **does not fire on the resulting UPDATE** - the second call
  would change the recorded quantity with no corresponding adjustment to `Warehouse.stock`,
  silently drifting the stock ledger from reality.
- A retried/duplicated `POST /api/v1/purchases` or `POST /api/v1/sales` with a repeated
  `invoiceNo` would overwrite an unrelated existing invoice's `currency`/`totalValue` (`Transactions`
  is a shared table for both directions) while still creating a brand-new `Warehouse` lot or
  `FG_Transaction` line pointing at it - leaving the invoice and its line items inconsistent.

**Fix:** an explicit `existsById(...)` pre-check added to every affected `create`/workflow method
(13 methods across `MaterialService`, `AccountService`, `EmployeeService`, `EquipmentService`,
`ProductService`, `SupplierContractService`, `MaintenanceService`, `BatchService` (both
`createBatch` and `dispenseMaterial`), `QualityCheckService` (both material and product QC), and
`PurchaseService`/`SalesService`), throwing `BusinessRuleViolationException` → a clear 422
instead of a silent overwrite. `Persistable<ID>` (making `save()` always call `persist()`) was
considered and rejected - it requires touching entity structure and JPA lifecycle callbacks
across ~15 files with no way to compile-check the result here; the explicit pre-check is a
smaller, more easily-verified-by-eye change per file, which mattered more given the constraint of
not being able to run a compiler in this environment.

**Regression tests added:** `creatingAMaterialWithAnIdThatAlreadyExistsIsRejectedNotSilentlyOverwritten`,
`dispensingTheSameLotToTheSameBatchTwiceIsRejectedNotSilentlyMerged`.

### 2. A JWT for a disabled or deleted account was still being accepted

`JwtAuthenticationFilter` decoded the token, loaded the `UserDetails`, and authenticated the
request - without ever checking `isEnabled()`/`isAccountNonLocked()`/etc. Disabling a user's
`app_user.enabled` flag had **no effect on tokens already issued** until they expired on their
own (up to an hour, per the default `JWT_EXPIRATION_MS`).

Separately, if the token named a user who had since been deleted, `loadUserByUsername` throws
`UsernameNotFoundException` - and because this filter runs *before*
`ExceptionTranslationFilter` in the security chain, nothing downstream would have caught it. It
would have escaped as an unhandled exception (an ugly container error page, not this project's
clean JSON `ApiError` shape).

**Fix:** the filter now checks `isEnabled() && isAccountNonLocked() && isAccountNonExpired() &&
isCredentialsNonExpired()` before authenticating, and catches `UsernameNotFoundException`
locally - either case now falls through to a normal 401 via `RestAuthenticationEntryPoint`
instead of a silent bypass or an unhandled exception.

### 3. Master-data write endpoints had no real role restriction

`MaterialController`, `AccountController`, `EmployeeController`, `EquipmentController`,
`ProductController`, and `SupplierContractController`'s `create`/`update` methods had no
`@PreAuthorize` at all - only the base "must be authenticated" rule applied. Concretely, the
`AUDITOR` role (whose entire purpose is read-only oversight) could create or edit Employee
records, the raw-material catalog, the product catalog, supplier contracts, and financial account
records. So could `SALES` or any other low-privilege role.

**Fix:** role-appropriate `@PreAuthorize` added to every one of these endpoints (`ADMIN`-only for
Employees/Accounts; `ADMIN` + `WAREHOUSE_MANAGER` for Materials/Supplier Contracts; `ADMIN` +
`WAREHOUSE_MANAGER` + `PRODUCTION_SUPERVISOR` for Equipment; `ADMIN` + `PRODUCTION_SUPERVISOR` for
Products). See the updated table in `README.md`.

There was also no demo account for `AUDITOR` at all, despite it being a valid role in the DB's
own `CHECK` constraint - added one (`auditor` / `Audit@123`) so the restriction is actually
exercised, not just theoretical.

**Regression tests added:** `auditorCannotCreateMaterials`, `warehouseManagerCanCreateMaterials`.

---

## 🟡 Important

### 4. Client input errors were coming back as 500, not 400

Three common, entirely-expected client mistakes had no dedicated handler in
`GlobalExceptionHandler` and fell through to the generic catch-all, returning a misleading
`500 INTERNAL_ERROR`:

- A non-numeric path variable, e.g. `GET /api/v1/batches/not-a-number` (`MethodArgumentTypeMismatchException`)
- A malformed JSON body, e.g. a truncated or syntactically invalid request (`HttpMessageNotReadableException`)
- Bean Validation failures outside of `@Valid @RequestBody` - not currently reachable by any
  endpoint, but added defensively (`ConstraintViolationException`)

A fourth gap: hitting a URL that matches no controller at all was returning Spring Boot's own
default-shaped 404 body, not this project's `ApiError` format. Fixed by setting
`spring.mvc.throw-exception-if-no-handler-found=true` and `spring.web.resources.add-mappings=false`,
plus a `NoHandlerFoundException` handler.

**Regression tests added:** `aNonNumericBatchNumberInThePathReturns400NotA500`,
`malformedJsonBodyReturns400NotA500`.

### 5. Validation gaps vs. the database's own CHECK constraints

Systematically cross-referenced every `CHECK` constraint in `db/01_schema_and_data.sql` against
the application-level validation covering the same field. Found and closed:

| Field | DB constraint | Was | Now |
|---|---|---|---|
| `MaterialMaster.shelfLife` | `CHECK (Shelf_Life > 0)` | `@NotNull` only | `+ @Positive` |
| `MaterialMaster.reorderLevel` | `CHECK (Reorder_Level > 0)` | no validation | `@Positive` |
| `AccountMaster.accountType` | `CHECK (... IN ('Supplier','Distributor','Hospital'))` | `@NotBlank` only | `+ @Pattern` |
| `EquipmentMaster.status` | `CHECK (... IN ('Active','Maintenance'))` | no validation | `@NotBlank @Pattern` |
| `ProductMaster.salableOrSample` | `CHECK (... IN ('M','S'))` | no validation | `@NotBlank @Pattern` |
| `ProductMaster.genericOrBranded` | `CHECK (... IN ('G','B'))` | no validation | `@NotBlank @Pattern` |
| `SupplierContract.agreedPrice` | `NOT NULL CHECK (> 0)` | no validation | `@NotNull @Positive` |
| `MaintenanceLog.cost` | `NOT NULL CHECK (>= 0)` | no validation | `@NotNull @PositiveOrZero` |
| `SubmitMaterialQcRequest.sampleSize` | `CHECK (Sample_Size > 0)` | `@NotNull` only | `+ @Positive` |
| `SubmitProductQcRequest.sampleSize` | `CHECK (Sample_Size > 0)` | `@NotNull` only | `+ @Positive` |
| `CreateBatchRequest.stockQty` | `CHECK (Stock_Qty >= 0)` | no validation | `@PositiveOrZero` |
| `RecordPurchaseRequest.utQA` | `VARCHAR(2)` | no validation | `@Size(max = 2)` |
| `ProductionLog` start/end time | `CONSTRAINT chk_time CHECK (End_Time > Start_Time)` | no validation | `@AssertTrue` cross-field check |

Each of these previously meant: a bad value would still be correctly rejected (the DB constraint
is the real backstop, as it should be), just as an opaque `DB_RULE_VIOLATION` after a wasted
round-trip instead of an immediate, specific 400. `Formula_Master`'s own `CHECK (Weight_per_tablet
> 0)` and `Batch.Yield_Percentage`'s range check weren't touched - neither field is currently
writable through any endpoint, so there's no live code path to validate.

---

## 🟢 Infrastructure

### 6. `spring-boot-starter-actuator` was referenced by the Dockerfile but never added

The Dockerfile's `HEALTHCHECK` and `docker-compose.yml`'s `service_healthy` condition both depend
on the app responding to a health check, but the actuator dependency wasn't in `pom.xml`, so
`/actuator/health` didn't exist. Added the dependency, exposed only `health` (not `env`/`beans`/
anything sensitive) with `show-details: never` in `application.yml`, permitted
`/actuator/health` in `SecurityConfig` (it can't carry a JWT), and upgraded the Dockerfile's
`HEALTHCHECK` from a bare "is port 8080 open" TCP probe to a real check of the JSON response body
for `"status":"UP"`, sent by hand over bash's `/dev/tcp` so the image doesn't need curl/wget
installed.

---

## ℹ️ Verified correct (no action needed)

Worth stating plainly, since a review like this can otherwise read as all-bad-news:

- **CORS + credentials:** `setAllowedOriginPatterns(List.of("*"))` (not `setAllowedOrigins`) is
  the correct API for combining a wildcard with `allowCredentials(true)` - Spring reflects the
  actual request origin rather than a literal `*`, satisfying the browser requirement. Confirmed
  correct as written.
- **JWT secret length:** the default local-dev HMAC secret is 66 bytes - comfortably over the
  32-byte minimum HS256 requires. `Keys.hmacShaKeyFor()` would not fail on it.
- **Token role claim vs. DB role:** the JWT carries a `role` claim, but `JwtAuthenticationFilter`
  never trusts it - every request re-loads the current role from the database via
  `AppUserDetailsService`. An admin changing a user's role takes effect on that user's very next
  request, not after their old token expires.
- **`AuthenticationManager`/`DaoAuthenticationProvider` wiring:** explicitly defining a
  `DaoAuthenticationProvider` bean means Spring Boot's autoconfiguration uses exactly that one
  provider rather than also building a redundant implicit default from the `UserDetailsService` +
  `PasswordEncoder` beans.
- **Generic "invalid username or password" on every login failure** (wrong password, wrong
  username, or a disabled account all produce the identical message): this is intentional, not
  an oversight - it avoids leaking account-existence/status information to an attacker probing
  usernames.
- **SQL injection surface:** every raw-SQL code path (`DashboardService`, `RecallService`) uses
  parameterized `?` placeholders; nothing concatenates user input into a query string.
- **Composite-key `@Embeddable` classes** correctly implement `Serializable` and
  `@EqualsAndHashCode`, which JPA requires for composite ids to work at all.

---

## 📋 Recommendations (not implemented - flagging rather than scope-creeping)

- **Pagination:** every list endpoint (`GET /api/v1/materials`, `/batches`, etc.) returns an
  unbounded `List`. Fine at seed-data scale; would need `Pageable` before this schema held
  production-scale row counts.
- **Login rate limiting:** no brute-force protection on `POST /api/v1/auth/login`. Bucket4j (or
  equivalent) would be the natural fit, scoped to this specific review as out-of-scope net-new
  infrastructure rather than a "fix."
- **`Formula_Master` (bill-of-materials) has no REST endpoint at all** - not a bug (nothing calls
  it, so nothing is broken), but a real coverage gap if BOM management is ever needed.
- **`Batch.Yield_Percentage`** is similarly not writable through any current endpoint.
