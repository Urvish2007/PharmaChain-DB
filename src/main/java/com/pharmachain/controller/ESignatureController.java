package com.pharmachain.controller;

import com.pharmachain.dto.request.ESignatureRequest;
import com.pharmachain.service.ESignatureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/signatures")
@RequiredArgsConstructor
public class ESignatureController {

    private final ESignatureService signatureService;

    @PostMapping
    public ResponseEntity<Map<String, String>> signRecord(@Valid @RequestBody ESignatureRequest request) {
        signatureService.signRecord(request);
        return ResponseEntity.ok(Map.of("message", "Electronic signature successfully verified and logged."));
    }
}
