package com.pharmachain.controller;

import com.pharmachain.dto.request.IotTemperatureReading;
import com.pharmachain.service.IotTelemetryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/iot")
@RequiredArgsConstructor
@Tag(name = "IoT Telemetry", description = "Endpoints for IoT sensor data ingestion")
public class IotController {

    private final IotTelemetryService telemetryService;

    @PostMapping("/telemetry/temperature")
    @PreAuthorize("hasAnyRole('ADMIN', 'QC_ANALYST', 'WAREHOUSE_MANAGER', 'PRODUCTION_SUPERVISOR')")
    public ResponseEntity<Map<String, String>> ingestTemperature(@Valid @RequestBody IotTemperatureReading request) {
        telemetryService.processTemperatureReading(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
            "status", "success",
            "message", "Telemetry reading received and queued for processing"
        ));
    }
}
