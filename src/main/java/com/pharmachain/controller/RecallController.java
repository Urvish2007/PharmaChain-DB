package com.pharmachain.controller;

import com.pharmachain.dto.request.InitiateRecallRequest;
import com.pharmachain.dto.response.ApiMessage;
import com.pharmachain.entity.ProductRecall;
import com.pharmachain.service.RecallService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recalls")
@RequiredArgsConstructor
@Tag(name = "Recalls", description = "Emergency product recalls")
public class RecallController {

    private final RecallService service;

    @GetMapping
    public List<ProductRecall> findAll() {
        return service.findAll();
    }

    @GetMapping("/{recallId}")
    public ProductRecall findById(@PathVariable String recallId) {
        return service.findById(recallId);
    }

    /**
     * Runs the execute_product_recall stored procedure: quarantines the batch (QC results ->
     * RECALLED), zeroes its warehouse stock, and logs the recall - all atomically in Postgres.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','QC_ANALYST')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiMessage initiateRecall(@Valid @RequestBody InitiateRecallRequest request) {
        service.initiateRecall(request);
        return new ApiMessage("Recall " + request.recallId() + " initiated for batch " + request.batchNo());
    }
}
