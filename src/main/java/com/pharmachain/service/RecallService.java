package com.pharmachain.service;

import com.pharmachain.dto.request.InitiateRecallRequest;
import com.pharmachain.entity.ProductRecall;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.ProductRecallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.CallableStatement;
import java.util.List;

/**
 * Initiates an emergency recall by calling the execute_product_recall stored procedure
 * directly, rather than re-implementing its logic in Java. The procedure atomically:
 * inserts the Product_Recall row, zeroes out Batch.stock_qty, and flips the batch's
 * Product_Quality_Check.results to 'RECALLED' - all three in a single database transaction.
 * Spring Data JPA has no first-class support for calling PostgreSQL PROCEDUREs (as opposed
 * to FUNCTIONs), so this uses a plain JDBC CallableStatement via JdbcTemplate.
 */
@Service
@RequiredArgsConstructor
public class RecallService {

    private final JdbcTemplate jdbcTemplate;
    private final ProductRecallRepository recallRepository;

    @Transactional
    public void initiateRecall(InitiateRecallRequest request) {
        jdbcTemplate.execute((ConnectionCallback<Void>) connection -> {
            try (CallableStatement cs = connection.prepareCall(
                    "{call execute_product_recall(?, ?, ?)}")) {
                cs.setString(1, request.recallId());
                cs.setLong(2, request.batchNo());
                cs.setString(3, request.reason());
                cs.execute();
            }
            return null;
        });
    }

    public List<ProductRecall> findAll() {
        return recallRepository.findAll();
    }

    public ProductRecall findById(String recallId) {
        return recallRepository.findById(recallId)
                .orElseThrow(() -> ResourceNotFoundException.forId("Recall", recallId));
    }
}
