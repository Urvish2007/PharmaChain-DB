package com.pharmachain.controller;

import com.pharmachain.dto.response.ExpiryRiskRow;
import com.pharmachain.dto.response.InventoryShortageRow;
import com.pharmachain.dto.response.TraceabilityRow;
import com.pharmachain.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Thin REST wrapper around the three reporting views defined in Views.sql. */
@RestController
@RequestMapping("/api/v1/dashboards")
@RequiredArgsConstructor
@Tag(name = "Dashboards", description = "Read-only reporting endpoints backed by SQL views")
public class DashboardController {

    private final DashboardService service;

    @GetMapping("/inventory-shortage")
    public List<InventoryShortageRow> inventoryShortage() {
        return service.inventoryShortage();
    }

    @GetMapping("/expiry-risk")
    public List<ExpiryRiskRow> expiryRisk() {
        return service.expiryRisk();
    }

    @GetMapping("/traceability/{batchNo}")
    public List<TraceabilityRow> traceability(@PathVariable Long batchNo) {
        return service.traceability(batchNo);
    }
}
