package com.pharmachain.ai;

/**
 * The shape ChatClient.call().entity(RecallNoticeDraft.class) asks the model to fill in.
 * Spring AI generates a JSON schema from this record and instructs the model to respond in
 * that exact shape, then parses the response back into a real object - no manual JSON
 * parsing or prompt-engineered "respond only in JSON" instructions needed.
 */
public record RecallNoticeDraft(
        String title,
        String summary,
        String affectedProduct,
        String batchInformation,
        String consumerInstructions,
        String regulatoryNote
) {
}
