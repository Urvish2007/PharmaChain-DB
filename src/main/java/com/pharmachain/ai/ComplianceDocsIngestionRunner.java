package com.pharmachain.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.ai.vectorstore.VectorStore;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Loads every file in src/main/resources/compliance-docs/ into the pgvector store on startup,
 * so the compliance copilot has something real to retrieve from the moment the app comes up -
 * no separate ingestion step to remember to run.
 *
 * <p>Deliberately defensive: this can be disabled entirely via
 * app.ai.ingest-compliance-docs-on-startup=false (set to false in the integration test, which
 * doesn't run Ollama), and any failure here (e.g. Ollama not running locally) is logged and
 * swallowed rather than allowed to crash application startup - the AI features degrade
 * gracefully, the rest of the API doesn't need them to function.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(
        name = "app.ai.ingest-compliance-docs-on-startup",
        havingValue = "true",
        matchIfMissing = true)
public class ComplianceDocsIngestionRunner implements ApplicationRunner {

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    @Value("classpath:compliance-docs/*.md")
    private Resource[] complianceDocs;

    @Override
    public void run(ApplicationArguments args) {
        try {
            Integer existing = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM public.compliance_docs", Integer.class);
            if (existing != null && existing > 0) {
                log.info("Compliance docs already ingested ({} rows) - skipping", existing);
                return;
            }

            List<Document> documents = new ArrayList<>();
            for (Resource resource : complianceDocs) {
                String content = resource.getContentAsString(StandardCharsets.UTF_8);
                documents.add(new Document(content, Map.of("source", String.valueOf(resource.getFilename()))));
            }

            vectorStore.add(documents);
            log.info("Ingested {} compliance documents into the vector store", documents.size());
        } catch (Exception e) {
            log.warn("Skipping compliance-doc ingestion - the vector store or embedding model "
                    + "isn't reachable right now (is Ollama running?). The rest of the API is "
                    + "unaffected; /api/v1/ai/ask just won't have anything to retrieve yet. "
                    + "Cause: {}", e.getMessage());
        }
    }
}
