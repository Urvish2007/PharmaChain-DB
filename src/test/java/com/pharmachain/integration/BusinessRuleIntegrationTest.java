package com.pharmachain.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.Container.ExecResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import org.testcontainers.utility.MountableFile;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Boots a real, disposable PostgreSQL 16 container, loads the exact schema this project ships
 * (DDL + seed data + all four triggers + all three views + the recall procedure, plus the
 * app_user security table and its seeded demo accounts), then drives the running Spring Boot
 * app through MockMvc. An in-memory database (H2 etc.) cannot be used here because it does not
 * understand PL/pgSQL triggers - these tests would pass even if trg_deduct_stock_on_dispense or
 * trg_prevent_bad_sales were silently broken, and they'd also miss real BCrypt/JWT behavior.
 *
 * <p>The schema is loaded with a raw `psql -f` exec per file (not Testcontainers'
 * withInitScript), because withInitScript's naive statement splitter does not understand
 * Postgres's dollar-quoted ($$ ... $$) function bodies and would mangle the trigger/procedure
 * definitions.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class BusinessRuleIntegrationTest {

    private static final DockerImageName PGVECTOR_IMAGE =
            DockerImageName.parse("pgvector/pgvector:pg16").asCompatibleSubstituteFor("postgres");

    @Container
    static PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>(PGVECTOR_IMAGE)
            .withDatabaseName("pharmachain")
            .withUsername("postgres")
            .withPassword("postgres")
            .withCopyFileToContainer(
                    MountableFile.forClasspathResource("db/01_schema_and_data.sql"),
                    "/01_schema_and_data.sql")
            .withCopyFileToContainer(
                    MountableFile.forClasspathResource("db/02_security_schema.sql"),
                    "/02_security_schema.sql");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        // No Ollama in this test environment - the VectorStore bean itself still gets created
        // (schema init only touches Postgres, not the embedding model), but skip the startup
        // ingestion step, which would otherwise try to call Ollama and fail.
        registry.add("app.ai.ingest-compliance-docs-on-startup", () -> "false");
        // Guarantees AnthropicChatModel bean construction succeeds even with no real key
        // present in this environment; nothing here exercises an actual Anthropic API call.
        registry.add("spring.ai.anthropic.api-key", () -> "test-key-placeholder");
    }

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    private String adminToken;

    @BeforeAll
    void setUp() throws Exception {
        loadSchemaFile("/01_schema_and_data.sql");
        loadSchemaFile("/02_security_schema.sql");
        adminToken = login("admin", "Admin@123");
    }

    /**
     * Errors here are expected and harmless for 01_schema_and_data.sql specifically: it includes
     * a handful of demonstration statements (an over-dispense, a sale of an untested batch, a
     * future manufacturing date) that are *supposed* to be rejected by the triggers being tested.
     * psql's default (non ON_ERROR_STOP) mode logs those and keeps going, exactly as if a
     * developer had pasted the file into a psql session by hand.
     */
    private void loadSchemaFile(String containerPath) throws Exception {
        ExecResult result = POSTGRES.execInContainer(
                "psql", "-U", POSTGRES.getUsername(), "-d", POSTGRES.getDatabaseName(),
                "-f", containerPath);
        if (result.getExitCode() != 0) {
            throw new IllegalStateException("Failed to load " + containerPath + ":\n" + result.getStderr());
        }
    }

    private String login(String username, String password) throws Exception {
        String body = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "%s", "password": "%s"}
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(body);
        return node.get("token").asText();
    }

    // ---------------------------------------------------------------------
    // Auth itself
    // ---------------------------------------------------------------------

    @Test
    void loggingInWithValidCredentialsReturnsABearerToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "admin", "password": "Admin@123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void loggingInWithAWrongPasswordIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "admin", "password": "not-the-right-password"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void callingAProtectedEndpointWithNoTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"invoiceNo": 9200, "transactionDate": "2024-01-15", "currency": "INR",
                                 "accountNo": "ACC011", "totalValue": 5000.00, "batchNo": 5001, "saleQty": 10}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void aSalesAccountCannotDeleteMasterData() throws Exception {
        String salesToken = login("sales.rep", "Sales@123");
        mockMvc.perform(delete("/api/v1/materials/MAT001")
                        .header("Authorization", "Bearer " + salesToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    // ---------------------------------------------------------------------
    // Business rules, now driven through an authenticated admin session
    // ---------------------------------------------------------------------

    /**
     * Item_ID 2 (MAT002) has a Stock of 2000 in the seed data. Asking to dispense far more than
     * that must be rejected by trg_deduct_stock_on_dispense - and the app must translate that
     * into a clean 422, not a 500.
     */
    @Test
    void dispensingMoreThanAvailableStockIsBlockedByTheDatabaseTrigger() throws Exception {
        mockMvc.perform(post("/api/v1/batches/5001/dispense")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"itemId": 2, "quantityIssued": 999999}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("DB_RULE_VIOLATION"));
    }

    /** Batch 5003's only QC report (PQC003) is FAILED - trg_prevent_bad_sales must block the sale. */
    @Test
    void sellingABatchThatFailedQcIsBlockedByTheDatabaseTrigger() throws Exception {
        mockMvc.perform(post("/api/v1/sales")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"invoiceNo": 9101, "transactionDate": "2024-01-15", "currency": "INR",
                                 "accountNo": "ACC011", "totalValue": 5000.00, "batchNo": 5003, "saleQty": 10}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("DB_RULE_VIOLATION"));
    }

    /** Batch 5000 does not exist in Product_Quality_Check at all - "untested" must also be blocked. */
    @Test
    void sellingAnUntestedBatchIsBlockedByTheDatabaseTrigger() throws Exception {
        mockMvc.perform(post("/api/v1/sales")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"invoiceNo": 9102, "transactionDate": "2024-01-15", "currency": "INR",
                                 "accountNo": "ACC011", "totalValue": 5000.00, "batchNo": 5000, "saleQty": 10}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("DB_RULE_VIOLATION"));
    }

    /** Batch 5001's QC report (PQC001) is PASSED - the same sale must succeed end to end. */
    @Test
    void sellingABatchThatPassedQcSucceeds() throws Exception {
        mockMvc.perform(post("/api/v1/sales")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"invoiceNo": 9103, "transactionDate": "2024-01-15", "currency": "INR",
                                 "accountNo": "ACC011", "totalValue": 5000.00, "batchNo": 5001, "saleQty": 10}
                                """))
                .andExpect(status().isCreated());
    }

    /** A batch dated in the future must be rejected before it ever reaches the database. */
    @Test
    void creatingABatchWithAFutureManufacturingDateIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/batches")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"batchNo": 7000, "batchSize": 1000, "mfgDate": "2099-01-01",
                                 "expDate": "2099-08-01", "productId": "PRD001"}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("BUSINESS_RULE_VIOLATION"));
    }
}
