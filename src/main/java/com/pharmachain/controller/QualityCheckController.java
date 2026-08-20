package com.pharmachain.controller;

import com.pharmachain.dto.request.SubmitMaterialQcRequest;
import com.pharmachain.dto.request.SubmitProductQcRequest;
import com.pharmachain.entity.MaterialQualityCheck;
import com.pharmachain.entity.ProductQualityCheck;
import com.pharmachain.entity.QcAuditLog;
import com.pharmachain.service.QualityCheckService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quality-checks")
@RequiredArgsConstructor
@Tag(name = "Quality checks", description = "Incoming-material and finished-goods QC reports")
public class QualityCheckController {

    private final QualityCheckService service;

    @GetMapping("/materials")
    public List<MaterialQualityCheck> materialChecks(@RequestParam Long itemId) {
        return service.materialChecksFor(itemId);
    }

    @PostMapping("/materials")
    @PreAuthorize("hasAnyRole('ADMIN','QC_ANALYST')")
    @ResponseStatus(HttpStatus.CREATED)
    public MaterialQualityCheck submitMaterialCheck(@Valid @RequestBody SubmitMaterialQcRequest request) {
        return service.submitMaterialCheck(request);
    }

    @GetMapping("/products")
    public List<ProductQualityCheck> productChecks(@RequestParam Long batchNo) {
        return service.productChecksFor(batchNo);
    }

    @GetMapping("/products/{reportId}")
    public ProductQualityCheck productCheck(@PathVariable String reportId) {
        return service.findProductCheck(reportId);
    }

    /**
     * Submitting results = PASSED here is what unlocks a sale for the batch via
     * trg_prevent_bad_sales; submitting FAILED locks it out just as immediately.
     */
    @PostMapping("/products")
    @PreAuthorize("hasAnyRole('ADMIN','QC_ANALYST')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductQualityCheck submitProductCheck(@Valid @RequestBody SubmitProductQcRequest request) {
        return service.submitProductCheck(request);
    }

    /** Tamper-evident change history for one QC report, written automatically by trg_audit_qc_changes. */
    @GetMapping("/products/{reportId}/audit-trail")
    public List<QcAuditLog> auditTrail(@PathVariable String reportId) {
        return service.auditTrailFor(reportId);
    }
}
