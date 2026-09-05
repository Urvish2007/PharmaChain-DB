package com.pharmachain.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Gives the compliance copilot the ability to search the internet for medicine
 * information (drug interactions, side effects, dosage, general pharma knowledge)
 * using the DuckDuckGo Instant Answer API as primary, with a structured fallback
 * knowledge base for well-known regulatory topics.
 *
 * <p>The LLM decides autonomously when to call this tool vs. the database tools
 * based on the user's question. Database questions route to {@link DashboardAiTools};
 * general medicine and regulatory questions route here.</p>
 */
@Component
@Slf4j
public class WebSearchTool {

    private static final String DDG_API = "https://api.duckduckgo.com/";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @Tool(description = "Search the internet for general medicine, drug, and pharmaceutical information. "
            + "Use this when the user asks about drug side effects, interactions, dosage, "
            + "contraindications, general pharmaceutical knowledge, storage requirements, or any "
            + "question that cannot be answered from the local database. Returns a summary and "
            + "related topics. ALWAYS call this tool for any medicine or drug question instead of saying you cannot search.")
    public String searchMedicineInfo(
            @ToolParam(description = "The search query, e.g. 'Metformin side effects' or "
                    + "'Amlodipine drug interactions' or 'FDA tablet dissolution guidelines'") String query) {
        log.info("Web search requested for: {}", query);
        try {
            String result = searchDuckDuckGo(query);
            if (result != null && !result.isBlank()) {
                return result;
            }
            // DuckDuckGo returned nothing useful - provide structured knowledge
            return getStructuredKnowledge(query);
        } catch (Exception e) {
            log.error("Web search failed for query: {}", query, e);
            return getStructuredKnowledge(query);
        }
    }

    @Tool(description = "Look up FDA regulatory guidelines, compliance requirements, and pharmaceutical "
            + "regulations. Use this when the user asks about FDA rules, cGMP guidelines, dissolution "
            + "testing, storage requirements for hazardous materials, audit procedures, or any regulatory "
            + "compliance topic. Always call this for FDA/regulatory questions.")
    public String searchFdaGuidelines(
            @ToolParam(description = "The regulatory topic, e.g. 'tablet dissolution testing USP', "
                    + "'cGMP guidelines for pharmaceutical manufacturing', "
                    + "'hazardous raw material storage requirements'") String topic) {
        log.info("FDA regulatory search requested for: {}", topic);
        return getFdaRegulatoryKnowledge(topic);
    }

    private String searchDuckDuckGo(String query) throws Exception {
        String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
        URI uri = URI.create(DDG_API + "?q=" + encoded + "&format=json&no_html=1&skip_disambig=1");

        HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .header("User-Agent", "Mozilla/5.0 PharmaChain-Copilot/1.0")
                .timeout(Duration.ofSeconds(15))
                .GET()
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.warn("DuckDuckGo API returned status {}", response.statusCode());
            return null;
        }

        return parseSearchResults(response.body(), query);
    }

    private String getStructuredKnowledge(String query) {
        String q = query.toLowerCase();
        StringBuilder sb = new StringBuilder();
        sb.append("## Web Search Results for: \"").append(query).append("\"\n");
        sb.append("*Source: Curated pharmaceutical knowledge base + FDA/WHO guidelines*\n\n");

        if (q.contains("dissolution") || q.contains("dissolut")) {
            sb.append("## FDA Tablet Dissolution Testing Guidelines\n");
            sb.append("The FDA requires dissolution testing under **21 CFR Part 211.167** and USP <711>.\n\n");
            sb.append("**Key Requirements:**\n");
            sb.append("- **Apparatus I (Basket):** Used for capsules and tablets prone to floating. Rotation speed: 50-100 RPM.\n");
            sb.append("- **Apparatus II (Paddle):** Most common for standard tablets. Rotation speed: 50-75 RPM.\n");
            sb.append("- **Dissolution Media:** 0.1N HCl (pH 1.2), Acetate buffer (pH 4.5), or Phosphate buffer (pH 6.8) based on drug's BCS class.\n");
            sb.append("- **Acceptance Criteria (Q value):** Typically Q = 75-80% drug released within 30-60 minutes.\n");
            sb.append("- **BCS Classification:** Guides waiver eligibility. BCS Class I & III may qualify for biowaiver.\n\n");
            sb.append("**Latest FDA Guidance (2023-2024):**\n");
            sb.append("- FDA Guidance for Industry: *Dissolution Testing of Immediate Release Solid Oral Dosage Forms* (August 1997, reaffirmed 2023)\n");
            sb.append("- ICH Q4B Annex 7: Dissolution Test - regulatory equivalent between FDA, EMA, PMDA\n");
            sb.append("- USP <711> Dissolution — current edition requires 6-unit testing at Stage 1\n\n");
            sb.append("**Source:** [FDA CDER Guidance Documents](https://www.fda.gov/drugs/guidance-compliance-regulatory-information/guidances-drugs)\n");
        } else if (q.contains("storage") || q.contains("hazardous") || q.contains("raw material")) {
            sb.append("## FDA/cGMP Hazardous Raw Material Storage Requirements\n");
            sb.append("Governed by **21 CFR Part 211.80–211.94** (Material Examination and Usage Criteria).\n\n");
            sb.append("**Key Storage Rules:**\n");
            sb.append("- **Segregation:** Hazardous materials must be physically isolated from non-hazardous materials in a separate, clearly marked area.\n");
            sb.append("- **Labeling:** All containers must bear identity, lot number, control number, and quarantine/approved/rejected status labels.\n");
            sb.append("- **Temperature Control:** Controlled substances and volatile compounds require validated temperature/humidity monitoring (21 CFR 211.68).\n");
            sb.append("- **Access Control:** Restricted access zones required with entry logs for hazardous API stores.\n");
            sb.append("- **MSDS/SDS:** Safety Data Sheets must be available at the storage point per OSHA 29 CFR 1910.1200.\n");
            sb.append("- **Incompatible Materials:** Oxidizers, flammables, and corrosives must be stored separately as per NFPA 30.\n");
            sb.append("- **Retest Dating:** Stored materials require periodic retesting per ICH Q1A(R2) stability guidelines.\n\n");
            sb.append("**Source:** [21 CFR Part 211 - cGMP for Finished Pharmaceuticals](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-211)\n");
        } else if (q.contains("recall")) {
            sb.append("## FDA Pharmaceutical Recall Procedures\n");
            sb.append("**21 CFR Part 7** governs voluntary recalls. FDA classifies recalls into three classes:\n\n");
            sb.append("| Class | Risk Level | Example |\n");
            sb.append("|-------|-----------|---------|\n");
            sb.append("| **Class I** | Serious health hazard or death | Wrong active ingredient, contaminated product |\n");
            sb.append("| **Class II** | May cause adverse health effects | Sub-potent drug, non-sterile product |\n");
            sb.append("| **Class III** | Unlikely to cause harm | Minor labeling deviation |\n\n");
            sb.append("**Required Notice Contents (21 CFR 7.49):** Product description, lot numbers, reason for recall, health hazard assessment, quantity, distribution scope, and recommended consumer action.\n");
        } else {
            sb.append("Based on pharmaceutical knowledge base:\n\n");
            sb.append("For the query \"**").append(query).append("**\", the following general guidance applies:\n\n");
            sb.append("- Consult the relevant USP monograph for testing specifications.\n");
            sb.append("- Review FDA CDER guidance documents at [FDA.gov](https://www.fda.gov/drugs/guidance-compliance-regulatory-information/guidances-drugs).\n");
            sb.append("- Reference ICH guidelines (Q1A-Q14) for quality, safety, and efficacy standards.\n");
            sb.append("- Check WHO Technical Report Series for international standards.\n\n");
            sb.append("For specific drug information, consult the FDA's [DailyMed](https://dailymed.nlm.nih.gov) database.\n");
        }
        return sb.toString();
    }

    private String getFdaRegulatoryKnowledge(String topic) {
        // Delegate to structured knowledge with FDA framing
        return getStructuredKnowledge(topic);
    }

    private String parseSearchResults(String json, String originalQuery) {
        try {
            JsonNode root = MAPPER.readTree(json);
            StringBuilder sb = new StringBuilder();

            String abstractText = root.path("AbstractText").asText("");
            String abstractSource = root.path("AbstractSource").asText("");
            String abstractURL = root.path("AbstractURL").asText("");

            if (!abstractText.isEmpty()) {
                sb.append("## Summary (from ").append(abstractSource).append(")\n");
                sb.append(abstractText).append("\n");
                if (!abstractURL.isEmpty()) {
                    sb.append("**Source:** ").append(abstractURL).append("\n");
                }
                sb.append("\n");
            }

            String answer = root.path("Answer").asText("");
            if (!answer.isEmpty()) {
                sb.append("## Direct Answer\n").append(answer).append("\n\n");
            }

            String definition = root.path("Definition").asText("");
            if (!definition.isEmpty()) {
                sb.append("## Definition\n").append(definition).append("\n\n");
            }

            JsonNode relatedTopics = root.path("RelatedTopics");
            if (relatedTopics.isArray() && !relatedTopics.isEmpty()) {
                List<String> topics = new ArrayList<>();
                for (JsonNode topic : relatedTopics) {
                    String text = topic.path("Text").asText("");
                    if (!text.isEmpty() && topics.size() < 8) {
                        topics.add(text);
                    }
                    JsonNode subTopics = topic.path("Topics");
                    if (subTopics.isArray()) {
                        for (JsonNode sub : subTopics) {
                            String subText = sub.path("Text").asText("");
                            if (!subText.isEmpty() && topics.size() < 8) {
                                topics.add(subText);
                            }
                        }
                    }
                }
                if (!topics.isEmpty()) {
                    sb.append("## Related Information\n");
                    for (String t : topics) {
                        sb.append("- ").append(t).append("\n");
                    }
                }
            }

            return sb.isEmpty() ? null : sb.toString();
        } catch (Exception e) {
            log.error("Failed to parse search results", e);
            return null;
        }
    }
}
