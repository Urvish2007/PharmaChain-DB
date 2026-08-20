package com.pharmachain.controller;

import com.pharmachain.entity.SupplierContract;
import com.pharmachain.service.SupplierContractService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/supplier-contracts")
@RequiredArgsConstructor
@Tag(name = "Supplier contracts", description = "Agreed price and validity window per supplier/material")
public class SupplierContractController {

    private final SupplierContractService service;

    @GetMapping
    public List<SupplierContract> findAll(@RequestParam(required = false) String materialId) {
        return materialId != null ? service.findByMaterial(materialId) : service.findAll();
    }

    @GetMapping("/{contractId}")
    public SupplierContract findById(@PathVariable String contractId) {
        return service.findById(contractId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupplierContract create(@Valid @RequestBody SupplierContract contract) {
        return service.create(contract);
    }

    @DeleteMapping("/{contractId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String contractId) {
        service.delete(contractId);
        return ResponseEntity.noContent().build();
    }
}
