package com.pharmachain.controller;

import com.pharmachain.dto.request.RecordPurchaseRequest;
import com.pharmachain.entity.Warehouse;
import com.pharmachain.service.PurchaseService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/purchases")
@RequiredArgsConstructor
@Tag(name = "Purchases", description = "Raw-material intake: invoice + new warehouse lot in one call")
public class PurchaseController {

    private final PurchaseService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE_MANAGER')")
    @ResponseStatus(HttpStatus.CREATED)
    public Warehouse recordPurchase(@Valid @RequestBody RecordPurchaseRequest request) {
        return service.recordPurchase(request);
    }
}
