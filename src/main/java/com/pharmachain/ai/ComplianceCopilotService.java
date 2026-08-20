package com.pharmachain.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

/**
 * A single chat call does two things at once: QuestionAnswerAdvisor retrieves the most relevant
 * compliance documents (why a rule exists, what it does) from pgvector and stuffs them into the
 * prompt, while DashboardAiTools lets the model pull live numbers (current shortages, expiry
 * risk, a specific batch's traceability) if the question needs them. A question like "why can't
 * I sell batch 5003" ends up grounded in both: the retrieved trg_prevent_bad_sales explanation
 * *and* a live lookup of batch 5003's actual QC status.
 */
@Service
@RequiredArgsConstructor
public class ComplianceCopilotService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final DashboardAiTools dashboardAiTools;

    public String ask(String question) {
        QuestionAnswerAdvisor ragAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
                .searchRequest(SearchRequest.builder()
                        .topK(4)
                        .similarityThreshold(0.5)
                        .build())
                .build();

        return chatClient.prompt()
                .user(question)
                .advisors(ragAdvisor)
                .tools(dashboardAiTools)
                .call()
                .content();
    }
}
