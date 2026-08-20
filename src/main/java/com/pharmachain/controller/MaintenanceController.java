package com.pharmachain.controller;

import com.pharmachain.entity.MaintenanceLog;
import com.pharmachain.service.MaintenanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maintenance-logs")
@RequiredArgsConstructor
@Tag(name = "Maintenance", description = "Equipment maintenance history")
public class MaintenanceController {

    private final MaintenanceService service;

    @GetMapping
    public List<MaintenanceLog> findAll(@RequestParam(required = false) String equipmentId) {
        return equipmentId != null ? service.findByEquipment(equipmentId) : service.findAll();
    }

    @GetMapping("/{maintenanceId}")
    public MaintenanceLog findById(@PathVariable String maintenanceId) {
        return service.findById(maintenanceId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCTION_SUPERVISOR','WAREHOUSE_MANAGER')")
    @ResponseStatus(HttpStatus.CREATED)
    public MaintenanceLog create(@Valid @RequestBody MaintenanceLog log) {
        return service.create(log);
    }
}
