package com.pharmachain.controller;

import com.pharmachain.dto.request.RecordSaleRequest;
import com.pharmachain.entity.FgTransaction;
import com.pharmachain.service.SalesService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
@Tag(name = "Sales", description = "Finished-goods sales; blocked server- and DB-side for un-QC'd or failed batches")
public class SalesController {

    private final SalesService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES')")
    @ResponseStatus(HttpStatus.CREATED)
    public FgTransaction recordSale(@Valid @RequestBody RecordSaleRequest request) {
        return service.recordSale(request);
    }
}
