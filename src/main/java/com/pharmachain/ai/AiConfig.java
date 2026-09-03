package com.pharmachain.ai;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Both spring-ai-starter-model-openai (pointed at Groq's OpenAI-compatible API) and
 * spring-ai-starter-model-ollama are on the classpath (Groq for chat, Ollama purely for
 * local/free embeddings - Groq has no embeddings API), which means the context ends up
 * with two ChatModel-family beans. Rather than lean on Spring AI's own auto-configured
 * ChatClient.Builder (which would be ambiguous about which ChatModel to use), this bean
 * is wired explicitly to the concrete OpenAiChatModel type, sidestepping the ambiguity
 * entirely.
 */
@Configuration
public class AiConfig {

    private static final String SYSTEM_PROMPT = """
            You are the PharmaChain compliance copilot. You answer questions about
            inventory, batches, quality control, materials, warehouse stock, and
            recalls using the LIVE DATABASE DATA provided in each message.

            Rules:
            - Use ONLY the data provided. Never invent or guess data.
            - Be concise and give direct answers with specific numbers.
            - When asked about stock, shortages, or expiry, reference the exact data.
            - Format tables or lists when appropriate for readability.
            """;

    @Bean
    public ChatClient chatClient(OpenAiChatModel openAiChatModel) {
        return ChatClient.builder(openAiChatModel)
                .defaultSystem(SYSTEM_PROMPT)
                .build();
    }
}
