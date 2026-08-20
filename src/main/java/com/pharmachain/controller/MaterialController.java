package com.pharmachain.controller;

import com.pharmachain.entity.MaterialMaster;
import com.pharmachain.service.MaterialService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
@Tag(name = "Materials", description = "Raw-material catalog")
public class MaterialController {

    private final MaterialService service;

    @GetMapping
    public List<MaterialMaster> findAll() {
        return service.findAll();
    }

    @GetMapping("/{materialId}")
    public MaterialMaster findById(@PathVariable String materialId) {
        return service.findById(materialId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MaterialMaster create(@Valid @RequestBody MaterialMaster material) {
        return service.create(material);
    }

    @PutMapping("/{materialId}")
    public MaterialMaster update(@PathVariable String materialId, @Valid @RequestBody MaterialMaster material) {
        return service.update(materialId, material);
    }

    @DeleteMapping("/{materialId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String materialId) {
        service.delete(materialId);
        return ResponseEntity.noContent().build();
    }
}
