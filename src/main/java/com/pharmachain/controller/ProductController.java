package com.pharmachain.controller;

import com.pharmachain.entity.ProductMaster;
import com.pharmachain.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Finished-goods catalog")
public class ProductController {

    private final ProductService service;

    @GetMapping
    public List<ProductMaster> findAll() {
        return service.findAll();
    }

    @GetMapping("/{productId}")
    public ProductMaster findById(@PathVariable String productId) {
        return service.findById(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductMaster create(@Valid @RequestBody ProductMaster product) {
        return service.create(product);
    }

    @PutMapping("/{productId}")
    public ProductMaster update(@PathVariable String productId, @Valid @RequestBody ProductMaster product) {
        return service.update(productId, product);
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String productId) {
        service.delete(productId);
        return ResponseEntity.noContent().build();
    }
}
