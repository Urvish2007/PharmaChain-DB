package com.pharmachain.ai;

import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Both spring-ai-starter-model-anthropic and spring-ai-starter-model-ollama are on the
 * classpath (Anthropic for chat, Ollama purely for local/free embeddings - Anthropic has no
 * embeddings API), which means the context ends up with two ChatModel-family beans. Rather
 * than lean on Spring AI's own auto-configured ChatClient.Builder (which would be ambiguous
 * about which ChatModel to use), this bean is wired explicitly to the concrete
 * AnthropicChatModel type, sidestepping the ambiguity entirely.
 */
@Configuration
public class AiConfig {

    private static final String SYSTEM_PROMPT = """
            You are the PharmaChain compliance copilot, embedded in a pharmaceutical
            manufacturing system. You answer questions about inventory, batches, quality
            control, and recalls using the tools and reference documents you're given.

            Rules:
            - Ground every factual claim in the tool results or retrieved documents you were
              given for this request. If you don't have the information, say so plainly instead
              of guessing.
            - When asked why something is blocked or not allowed (e.g. why a batch can't be
              sold), explain the specific business rule responsible, in plain English.
            - Be concise. This is an operational tool, not a chat companion.
            """;

    @Bean
    public ChatClient chatClient(AnthropicChatModel anthropicChatModel) {
        return ChatClient.builder(anthropicChatModel)
                .defaultSystem(SYSTEM_PROMPT)
                .build();
    }
}
