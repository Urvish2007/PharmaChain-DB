package com.pharmachain.controller;

import com.pharmachain.dto.request.CreateBatchRequest;
import com.pharmachain.dto.request.DispenseMaterialRequest;
import com.pharmachain.entity.Batch;
import com.pharmachain.entity.MaterialDispensing;
import com.pharmachain.service.BatchService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/batches")
@RequiredArgsConstructor
@Tag(name = "Batches", description = "Production batches and material dispensing")
public class BatchController {

    private final BatchService service;

    @GetMapping
    public List<Batch> findAll() {
        return service.findAll();
    }

    @GetMapping("/{batchNo}")
    public Batch findById(@PathVariable Long batchNo) {
        return service.findById(batchNo);
    }

    @GetMapping("/{batchNo}/dispensing")
    public List<MaterialDispensing> dispensingHistory(@PathVariable Long batchNo) {
        return service.dispensingHistory(batchNo);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE_MANAGER','PRODUCTION_SUPERVISOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public Batch createBatch(@Valid @RequestBody CreateBatchRequest request) {
        return service.createBatch(request);
    }

    /**
     * Issues raw material to this batch from a warehouse lot. A 422 here means
     * trg_deduct_stock_on_dispense (or the service-layer pre-check) rejected the request
     * because the lot doesn't have enough stock left.
     */
    @PostMapping("/{batchNo}/dispense")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE_MANAGER','PRODUCTION_SUPERVISOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public MaterialDispensing dispense(@PathVariable Long batchNo, @Valid @RequestBody DispenseMaterialRequest request) {
        DispenseMaterialRequest scoped = new DispenseMaterialRequest(batchNo, request.itemId(), request.quantityIssued());
        return service.dispenseMaterial(scoped);
    }
}
