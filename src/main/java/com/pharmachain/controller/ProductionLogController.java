package com.pharmachain.controller;

import com.pharmachain.entity.ProductionLog;
import com.pharmachain.service.ProductionLogService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/production-logs")
@RequiredArgsConstructor
@Tag(name = "Production log", description = "Timestamped process steps for a batch")
public class ProductionLogController {

    private final ProductionLogService service;

    @GetMapping
    public List<ProductionLog> findByBatch(@RequestParam Long batchNo) {
        return service.findByBatch(batchNo);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCTION_SUPERVISOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductionLog create(@Valid @RequestBody ProductionLog log) {
        return service.create(log);
    }
}
