package com.pharmachain.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

/**
 * Compliance copilot using Spring AI's tool-calling and RAG capabilities.
 * It uses the QuestionAnswerAdvisor for compliance documents (RAG) and 
 * tool calling (DashboardAiTools) to query live database data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComplianceCopilotService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public String ask(String question) {
        try {
            String answer = chatClient.prompt()
                    .user(question)
                    .advisors(new QuestionAnswerAdvisor(vectorStore))
                    .tools("getInventoryShortage", "getExpiryRisk", "getBatchTraceability")
                    .call()
                    .content();

            return (answer != null && !answer.isBlank())
                    ? answer
                    : "I wasn't able to generate a response for that question. Please try rephrasing or ask something else.";
        } catch (Exception e) {
            log.error("AI copilot call failed", e);
            return "Sorry, the AI service encountered an error: " + e.getMessage();
        }
    }
}
