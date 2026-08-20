package com.pharmachain.ai;

import com.pharmachain.entity.Batch;
import com.pharmachain.entity.ProductMaster;
import com.pharmachain.entity.ProductRecall;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.BatchRepository;
import com.pharmachain.repository.ProductMasterRepository;
import com.pharmachain.repository.ProductRecallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

/**
 * Turns one real Product_Recall row into a formal draft notice. The prompt is built entirely
 * from facts already in the database (never anything the caller supplies freeform) and
 * explicitly told not to invent additional facts, so the model's job is drafting and tone,
 * not fact generation.
 */
@Service
@RequiredArgsConstructor
public class RecallNoticeService {

    private final ChatClient chatClient;
    private final ProductRecallRepository recallRepository;
    private final BatchRepository batchRepository;
    private final ProductMasterRepository productRepository;

    public RecallNoticeDraft draftNotice(String recallId) {
        ProductRecall recall = recallRepository.findById(recallId)
                .orElseThrow(() -> ResourceNotFoundException.forId("Recall", recallId));
        Batch batch = batchRepository.findById(recall.getBatchNo())
                .orElseThrow(() -> ResourceNotFoundException.forId("Batch", recall.getBatchNo()));

        String productName = batch.getProductId();
        if (productName != null) {
            productName = productRepository.findById(batch.getProductId())
                    .map(ProductMaster::getProductName)
                    .orElse(batch.getProductId());
        }

        String prompt = """
                Draft a formal, regulator-ready product recall notice using ONLY the facts below.
                Do not invent any fact that isn't given here - if something isn't provided, write
                it generically (e.g. "contact your regional distributor") rather than making it up.

                Recall ID: %s
                Reason for recall: %s
                Batch number: %d
                Product: %s
                Manufacturing date: %s
                Quantity recalled: %s
                Date initiated: %s
                """.formatted(
                recall.getRecallId(),
                recall.getReason(),
                batch.getBatchNo(),
                productName,
                batch.getMfgDate(),
                recall.getQtyRecalled(),
                recall.getDateInitiated());

        return chatClient.prompt()
                .user(prompt)
                .call()
                .entity(RecallNoticeDraft.class);
    }
}
