package com.pharmachain.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

/**
 * Compliance copilot using Spring AI's tool-calling and RAG capabilities.
 * It uses the QuestionAnswerAdvisor for compliance documents (RAG),
 * tool calling (DashboardAiTools) to query live database data, and
 * WebSearchTool to search the internet for general medicine information.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComplianceCopilotService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final DashboardAiTools dashboardAiTools;
    private final WebSearchTool webSearchTool;

    public String ask(String question) {
        try {
            String answer = chatClient.prompt()
                    .user(question)
                    .advisors(new QuestionAnswerAdvisor(vectorStore))
                    .tools(dashboardAiTools, webSearchTool)
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
