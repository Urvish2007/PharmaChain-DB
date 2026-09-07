package com.pharmachain.controller;

import com.pharmachain.dto.TrackingResponse;
import com.pharmachain.entity.ProductSerialization;
import com.pharmachain.service.SerializationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PublicTrackingController {

    @Autowired
    private SerializationService serializationService;

    // Public endpoint (No JWT required)
    @GetMapping("/public/tracking/{serialNo}")
    public ResponseEntity<TrackingResponse> trackMedicine(@PathVariable String serialNo) {
        TrackingResponse response = serializationService.trackMedicine(serialNo);
        return ResponseEntity.ok(response);
    }

    // Internal endpoint (Requires JWT)
    @PostMapping("/serialization/generate/{batchNo}")
    public ResponseEntity<List<ProductSerialization>> generateSerials(
            @PathVariable Long batchNo,
            @RequestParam(defaultValue = "10") int count) {
        List<ProductSerialization> generated = serializationService.generateSerialNumbers(batchNo, count);
        return ResponseEntity.ok(generated);
    }
}
