package com.pharmachain.controller;

import com.pharmachain.entity.EquipmentMaster;
import com.pharmachain.service.EquipmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment")
@RequiredArgsConstructor
@Tag(name = "Equipment", description = "Production and lab equipment")
public class EquipmentController {

    private final EquipmentService service;

    @GetMapping
    public List<EquipmentMaster> findAll() {
        return service.findAll();
    }

    @GetMapping("/{equipmentId}")
    public EquipmentMaster findById(@PathVariable String equipmentId) {
        return service.findById(equipmentId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EquipmentMaster create(@Valid @RequestBody EquipmentMaster equipment) {
        return service.create(equipment);
    }

    @PutMapping("/{equipmentId}")
    public EquipmentMaster update(@PathVariable String equipmentId, @Valid @RequestBody EquipmentMaster equipment) {
        return service.update(equipmentId, equipment);
    }

    @DeleteMapping("/{equipmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String equipmentId) {
        service.delete(equipmentId);
        return ResponseEntity.noContent().build();
    }
}
