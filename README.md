# PharmaChain Backend

A Spring Boot REST + JPA layer on top of the [PharmaChain-DB](.) PostgreSQL schema - a
pharmaceutical-manufacturing database with FDA-style compliance rules enforced by triggers,
three reporting views, and an emergency-recall stored procedure. On top of that: JWT/role-based
security, and a Spring AI compliance copilot that can explain *why* a rule exists (RAG) and look
up *live* data to answer with (tool-calling).

This service does **not** re-implement the database's business logic in Java. It exposes it.
Every rule that already lives in the database (stock deduction, "can't sell an untested batch",
"no future manufacturing dates", the tamper-evident QC audit trail) still lives there - the API
layer validates fast where it can and then trusts Postgres as the final authority.

## Architecture

```
Client
  -> REST controllers        (validation, HTTP status codes, OpenAPI docs, @PreAuthorize)
  -> JWT filter               (stateless auth, roles from app_user)
  -> Service layer            (workflow orchestration, fast-fail pre-checks)
       |-> Spring Data JPA repos   (simple CRUD) + JdbcTemplate (views, the recall procedure)
       |-> Spring AI ChatClient    (compliance copilot: RAG over compliance-docs/ + tool-calls
       |                           into the dashboard views)
  -> PostgreSQL               (triggers, CHECK constraints, the 3 views, execute_product_recall,
                                app_user, the pgvector store)
```

### Design decisions worth knowing about

- **Entities map columns, not relationships.** There is no `@ManyToOne`/`@OneToMany` graph
  between entities - a `Batch` stores `productId` as a plain `String`, not a `ProductMaster`
  reference. With 19+ tables this keeps lazy-loading, N+1 queries, and cascade rules out of the
  picture entirely. Joins that matter for reporting already exist as SQL views
  (`v_fda_batch_traceability`, etc.) and are read directly through `DashboardService`.
- **`spring.jpa.hibernate.ddl-auto=none`.** The schema is owned by `db/01_schema_and_data.sql`,
  not Hibernate. Entity-to-table correctness is covered by the Testcontainers integration test,
  not by `ddl-auto=validate`, since validating exact NUMERIC precision/scale against Hibernate's
  expectations isn't something worth fighting.
- **Entities double as request/response bodies for simple master-data CRUD** (materials,
  accounts, employees, equipment, products, supplier contracts, maintenance logs). For anything
  that spans more than one table or has real business rules - creating a batch, dispensing
  material, submitting a QC result, recording a purchase/sale, initiating a recall - there's a
  dedicated request DTO in `dto/request` instead, because the request shape genuinely differs
  from any single entity.
- **`RM_Transaction.val` / `FG_Transaction.val`** are set to the invoice's whole `totalValue` in
  `PurchaseService`/`SalesService`. This assumes one line per invoice, which matches the seed
  data but is a simplification - a multi-line invoice would need `val` computed per line.
- **The recall procedure is called, not re-implemented.** `RecallService` opens a raw JDBC
  `CallableStatement` to run `execute_product_recall(...)` because Spring Data JPA has no
  first-class support for PostgreSQL `PROCEDURE`s (only `FUNCTION`s via `@Procedure`).
- **Login credentials live in a new `app_user` table, not on `Employee_Master`.**
  `Employee_Master` is HR data (who works here, what department); `app_user` is purely an
  authentication concern, linked back to an employee via an optional `emp_id`. Nothing in the
  original schema was altered - see `db/02_security_schema.sql`.
- **JWT is stateless and role-based**, with roles fixed to a small set
  (`ADMIN`, `QC_ANALYST`, `WAREHOUSE_MANAGER`, `PRODUCTION_SUPERVISOR`, `SALES`, `AUDITOR`)
  rather than reusing the free-text `Employee_Master.Role` column, which is descriptive HR data
  and was never meant to double as an authorization scheme.
- **Chat uses Anthropic; embeddings use a local Ollama model.** Anthropic doesn't expose an
  embeddings API, and requiring a second paid API key just to run the RAG demo felt like a bad
  trade-off - `nomic-embed-text` via Ollama is free and runs locally. The `ChatClient` bean in
  `AiConfig` is wired explicitly to the concrete `AnthropicChatModel` type (not the generic
  `ChatModel` interface) specifically to avoid ambiguity now that two `ChatModel`-family beans
  exist in the context.
- **The vector store lives in Postgres's default `public` schema, not `pharma_manufacturing`.**
  `PgVectorStore`'s schema initialization runs during Spring context startup, before this
  project's own SQL scripts are guaranteed to have created the `pharma_manufacturing` schema
  (that ordering is inverted in the Testcontainers test, and easy to get wrong in a fresh local
  setup too) - keeping it in `public` sidesteps that hazard entirely, and it's arguably cleaner
  anyway since the vector store is a Spring-AI-managed concern, not part of the hand-designed
  business schema.
- **The AI model calls tools, not raw SQL.** `DashboardAiTools` exposes the same three
  dashboard views as `@Tool`-annotated methods rather than giving the model a SQL execution
  capability - it can only ever return what `DashboardService` (and by extension the REST API)
  could already return, which avoids the classic "LLM writes arbitrary SQL" injection surface.
- **Startup ingestion of the compliance docs is defensive.** If Ollama isn't running, ingestion
  logs a warning and the app starts normally anyway - `/api/v1/ai/ask` just won't have anything
  to retrieve yet. AI features degrade gracefully; they were never allowed to be a single point
  of failure for the rest of the API.
- **`application.yml` had a duplicate top-level `spring:` key** (one for `datasource`/`jpa`,
  a second, separate one added later for `ai`), which is invalid YAML - SnakeYAML throws
  `DuplicateKeyException` on it, so the app could not start at all with the file in that shape
  (not locally, not in the Testcontainers test, not in a container). Fixed by merging both
  under one `spring:` key. Worth knowing about specifically because none of the earlier
  static-only reviews of this project could have caught it - it only shows up the moment
  something actually tries to start the app, which nothing had done yet in any sandboxed
  build step up to that point.

## Getting started

### Prerequisites
- Java 21
- Maven 3.9+ (or use the included `./mvnw` if you generate a wrapper)
- PostgreSQL 16+ with the pgvector extension available - the provided `docker-compose.yml`
  uses the `pgvector/pgvector:pg16` image, which is a drop-in Postgres 16 with pgvector
  pre-installed
- Docker, only if you want to run the integration test (it uses Testcontainers)
- [Ollama](https://ollama.com) running locally with `nomic-embed-text` pulled, for the AI
  features: `ollama pull nomic-embed-text`
- An `ANTHROPIC_API_KEY` for the AI features' chat model (get one at
  [console.anthropic.com](https://console.anthropic.com))

### 1. Start Postgres

```bash
docker compose up -d
```

This starts Postgres 16 on `localhost:5432` with database `pharmachain` / user `postgres` /
password `postgres` (override via env vars - see `docker-compose.yml`).

### 2. Load the schema

```bash
psql -h localhost -U postgres -d pharmachain -f db/01_schema_and_data.sql
psql -h localhost -U postgres -d pharmachain -f db/02_security_schema.sql
```

> **Note on `01_schema_and_data.sql`:** this is the original PharmaChain-DB `schema_and_data.sql`
> with one fix: the original's `set search_path to pharma_manufacturing` line has no trailing
> semicolon and assumes the schema already exists, which breaks a standalone `psql -f` run. This
> copy replaces it with an explicit `CREATE SCHEMA IF NOT EXISTS` + `SET search_path` pair.
> Nothing else changed - same tables, seed data, triggers, views, and procedure.
>
> You'll see a handful of `ERROR` lines scroll by during the load. That's expected: the script
> includes demonstration statements (an intentional over-dispense, a sale of an untested batch, a
> future-dated batch) written to prove the triggers reject them. `psql` logs the error and moves
> to the next statement, which is exactly what should happen.

> **`02_security_schema.sql`** adds the `app_user` login table (new, on top of the original
> schema) and seeds four demo accounts - see [Demo accounts](#demo-accounts) below.

### 3. Run the app

```bash
export ANTHROPIC_API_KEY=sk-ant-...
mvn spring-boot:run
```

The API comes up on `http://localhost:8080`. Swagger UI is at
`http://localhost:8080/swagger-ui.html`. Every endpoint except `POST /api/v1/auth/login` and the
Swagger/OpenAPI paths requires a `Authorization: Bearer <token>` header - get a token first:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@123"}'
```

On first startup (with Ollama running), the app automatically ingests
`src/main/resources/compliance-docs/*.md` into the vector store - no separate step needed.
Without `ANTHROPIC_API_KEY` set, or without Ollama running, the rest of the API works fine;
only the `/api/v1/ai/**` endpoints will fail.

### 4. Run the tests

```bash
mvn test
```

`BusinessRuleIntegrationTest` boots a throwaway Postgres container via Testcontainers, loads the
real schema (triggers and the security tables included), logs in as the seeded admin account,
and drives the API through MockMvc to prove both the triggers and the role checks are actually
enforced - not just that the Java compiles. It needs Docker running locally.

### Demo accounts

Seeded by `db/02_security_schema.sql`, for local development and grading only.
**Change or remove these before deploying anywhere real:**

| Username | Password | Role |
|---|---|---|
| `admin` | `Admin@123` | `ADMIN` - can do everything, including deleting master data and creating new accounts |
| `qc.analyst` | `Qc@12345` | `QC_ANALYST` - submits QC results, initiates recalls |
| `wh.manager` | `Wh@12345` | `WAREHOUSE_MANAGER` - records purchases, dispenses material, creates batches |
| `sales.rep` | `Sales@123` | `SALES` - records sales |

## API reference

Every endpoint below requires `Authorization: Bearer <token>` unless marked **public**.

### Auth

| Endpoint | Access | What it does |
|---|---|---|
| `POST /api/v1/auth/login` | public | Exchanges username/password for a JWT |
| `POST /api/v1/auth/register` | `ADMIN` | Creates a new login account |

### Master data (plain CRUD)

| Resource | Base path | Write access |
|---|---|---|
| Materials | `GET/POST /api/v1/materials`, `GET/PUT/DELETE /api/v1/materials/{materialId}` | any authenticated role to create/update; `ADMIN` to delete |
| Accounts | `GET/POST /api/v1/accounts`, `GET/PUT/DELETE /api/v1/accounts/{accountNo}` | `ADMIN` to delete |
| Employees | `GET/POST /api/v1/employees`, `GET/PUT/DELETE /api/v1/employees/{empId}` | `ADMIN` to delete |
| Equipment | `GET/POST /api/v1/equipment`, `GET/PUT/DELETE /api/v1/equipment/{equipmentId}` | `ADMIN` to delete |
| Products | `GET/POST /api/v1/products`, `GET/PUT/DELETE /api/v1/products/{productId}` | `ADMIN` to delete |
| Supplier contracts | `GET/POST /api/v1/supplier-contracts`, `GET/DELETE /.../{contractId}`, `?materialId=` filter | `ADMIN` to delete |
| Maintenance logs | `GET/POST /api/v1/maintenance-logs`, `?equipmentId=` filter | `ADMIN`, `PRODUCTION_SUPERVISOR`, `WAREHOUSE_MANAGER` |

### Production workflow

| Endpoint | What it does | Write access |
|---|---|---|
| `GET /api/v1/batches` / `/{batchNo}` | List / fetch a batch | any authenticated role |
| `POST /api/v1/batches` | Create a batch. Rejects future `mfgDate` or `<6`-month shelf life before hitting the DB, then `trg_strict_batch_dates` guarantees it regardless | `ADMIN`, `WAREHOUSE_MANAGER`, `PRODUCTION_SUPERVISOR` |
| `GET /api/v1/batches/{batchNo}/dispensing` | Dispensing history for a batch | any authenticated role |
| `POST /api/v1/batches/{batchNo}/dispense` | Issue material from a warehouse lot. `trg_deduct_stock_on_dispense` decrements stock and blocks over-issuing | `ADMIN`, `WAREHOUSE_MANAGER`, `PRODUCTION_SUPERVISOR` |
| `GET/POST /api/v1/production-logs` | Process-stage log entries, `?batchNo=` filter | `ADMIN`, `PRODUCTION_SUPERVISOR` |
| `GET /api/v1/quality-checks/materials?itemId=` / `POST .../materials` | Incoming raw-material QC | `ADMIN`, `QC_ANALYST` |
| `GET /api/v1/quality-checks/products?batchNo=` / `POST .../products` | Finished-goods QC. `results=PASSED` is what unlocks a sale | `ADMIN`, `QC_ANALYST` |
| `GET /api/v1/quality-checks/products/{reportId}/audit-trail` | Tamper-evident change history written by `trg_audit_qc_changes` | any authenticated role |

### Commerce

| Endpoint | What it does | Write access |
|---|---|---|
| `POST /api/v1/purchases` | Records an invoice + a new warehouse lot + the RM_Transaction line, atomically | `ADMIN`, `WAREHOUSE_MANAGER` |
| `POST /api/v1/sales` | Records an invoice + FG_Transaction line. `trg_prevent_bad_sales` blocks it if the batch hasn't passed QC | `ADMIN`, `SALES` |
| `GET /api/v1/recalls` / `/{recallId}` | List / fetch recalls | any authenticated role |
| `POST /api/v1/recalls` | Runs `execute_product_recall`: quarantines the batch, zeroes its stock, logs the recall | `ADMIN`, `QC_ANALYST` |

### AI (compliance copilot, powered by Spring AI)

| Endpoint | What it does | Access |
|---|---|---|
| `POST /api/v1/ai/ask` | Ask a natural-language question. Combines RAG over `compliance-docs/*.md` (why a rule exists) with live tool-calls into the dashboard views (current data) in one answer | any authenticated role |
| `GET /api/v1/ai/recall-notice/{recallId}` | Drafts a formal recall notice as structured JSON, built only from that recall's real data | `ADMIN`, `QC_ANALYST` |

### Dashboards (read-only, backed by the 3 SQL views)

| Endpoint | View |
|---|---|
| `GET /api/v1/dashboards/inventory-shortage` | `v_inventory_shortage` |
| `GET /api/v1/dashboards/expiry-risk` | `v_inventory_expiry_risk` |
| `GET /api/v1/dashboards/traceability/{batchNo}` | `v_fda_batch_traceability` |

## Docker

`docker-compose.yml` now runs the app itself, not just the dev database.

```bash
cp .env.example .env        # fill in ANTHROPIC_API_KEY at least
docker compose up -d --build
```

This starts `postgres` (pgvector-enabled) and `app`, built from the `Dockerfile` in this repo
(multi-stage: `maven:3.9-eclipse-temurin-21-noble` to build the jar, `eclipse-temurin:21-jre-noble`
to run it as a non-root user). It does **not** load the schema for you - run the two `psql -f`
commands from [Getting started](#2-load-the-schema) against this container the same way, then hit
`http://localhost:8080`.

Ollama still isn't containerized by default - the `app` service is wired to reach it on your
*host* machine via `host.docker.internal` (see `.env.example`). If you'd rather not install
Ollama locally at all, an optional profile containerizes it too:

```bash
docker compose --profile with-ai up -d
docker compose exec ollama ollama pull nomic-embed-text   # one-time
```
(and set `OLLAMA_BASE_URL=http://ollama:11434` in `.env` when using this profile).

Building just the image, without compose:

```bash
docker build -t pharmachain-backend .
docker run -p 8080:8080 --env-file .env pharmachain-backend
```

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`:

1. **Build & test** - `mvn -B clean verify`, including `BusinessRuleIntegrationTest`'s real
   Testcontainers Postgres. GitHub-hosted runners have Docker natively, so this needs no extra
   setup - and it's genuinely the first place this test suite gets to run end to end, since no
   sandboxed build step along the way had both Docker and Maven Central access to run it.
2. **Build & push image** *(main only, after tests pass)* - builds the `Dockerfile` and pushes
   to GHCR as `ghcr.io/<owner>/<repo>:latest` and `:<commit-sha>`. Uses the built-in
   `GITHUB_TOKEN`, so no extra registry credentials to set up.
3. **Deploy** *(optional, off by default)* - a no-op unless you add a `RENDER_DEPLOY_HOOK_URL`
   repository secret. Render's deploy hook is just a webhook URL from the service dashboard;
   swap the `curl` step for Railway/Fly.io's equivalent if you go with one of those instead.

## What's next

Done so far: REST + JPA, JWT/role-based security, Spring AI, and now containerization + CI/CD.
Still open, from the original plan, and worth being upfront about rather than implying they're
done:

- **AOP request-level audit logging** (Section 19) - `QC_Audit_Log` still only captures DB-level
  changes (trigger-driven); there's no `@Audited`/aspect layer recording *who called the API*
  on top of that yet.
- **Redis caching** for the three dashboard views - no cache-aside layer exists yet; every
  dashboard call hits Postgres directly. Fine at this scale, but was on the original plan.
- **Daily digest scheduler** - no `@Scheduled` job summarizing shortage/expiry data exists yet.
- **FEFO priority-queue dispensing and BFS recall-impact traversal** (Section 28, DSA) - stock
  deduction currently trusts whatever row Postgres returns first, not soonest-expiring-first;
  and a bad raw-material lot doesn't yet have a graph traversal to find every downstream batch
  that needs a proactive recall.
- **Actually deploying somewhere** (Render/Railway/Fly.io) - the CI pipeline is ready for it
  (see the optional `deploy` job above), but nothing is deployed yet; that's a one-time manual
  step (create the service, point it at the GHCR image, add the deploy-hook secret).

None of these block anything above - they're additive, not fixes.
