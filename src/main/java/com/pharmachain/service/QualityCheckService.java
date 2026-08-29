package com.pharmachain.service;

import com.pharmachain.dto.request.SubmitMaterialQcRequest;
import com.pharmachain.dto.request.SubmitProductQcRequest;
import com.pharmachain.entity.MaterialQualityCheck;
import com.pharmachain.entity.ProductQualityCheck;
import com.pharmachain.entity.QcAuditLog;
import com.pharmachain.exception.BusinessRuleViolationException;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.MaterialQualityCheckRepository;
import com.pharmachain.repository.ProductQualityCheckRepository;
import com.pharmachain.repository.QcAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QualityCheckService {

    private final MaterialQualityCheckRepository materialQcRepository;
    private final ProductQualityCheckRepository productQcRepository;
    private final QcAuditLogRepository auditLogRepository;

    public List<MaterialQualityCheck> materialChecksFor(Long itemId) {
        return materialQcRepository.findByItemId(itemId);
    }

    /**
     * reportId is client-supplied, so save() would call merge() (not persist()) on a duplicate
     * id and silently UPDATE an unrelated existing report instead of failing - there's no audit
     * table for Material_Quality_Check the way there is for Product_Quality_Check, so that
     * overwrite would leave no trace at all without this check.
     */
    @Transactional
    public MaterialQualityCheck submitMaterialCheck(SubmitMaterialQcRequest request) {
        if (materialQcRepository.existsById(request.reportId())) {
            throw new BusinessRuleViolationException("QC report '" + request.reportId() + "' already exists");
        }
        MaterialQualityCheck check = MaterialQualityCheck.builder()
                .reportId(request.reportId())
                .itemId(request.itemId())
                .analysisDate(request.analysisDate())
                .analystName(request.analystName())
                .sampleSize(request.sampleSize())
                .test(request.test())
                .limits(request.limits())
                .results(request.results())
                .empId(request.empId())
                .build();
        return materialQcRepository.save(check);
    }

    public List<ProductQualityCheck> productChecksFor(Long batchNo) {
        return productQcRepository.findByBatchNoOrderByAnalysisDateDesc(batchNo);
    }

    public ProductQualityCheck findProductCheck(String reportId) {
        return productQcRepository.findById(reportId)
                .orElseThrow(() -> ResourceNotFoundException.forId("QC report", reportId));
    }

    /**
     * Submits the finished-goods lab result for a batch. Once results = 'PASSED' is saved here,
     * FG_Transaction sales of the batch are allowed to go through trg_prevent_bad_sales; a later
     * genuine UPDATE of this row (e.g. correcting a result) is captured automatically into
     * QC_Audit_Log by trg_audit_qc_changes, so no explicit audit call is needed in this service.
     *
     * <p>The existsById check below is a separate concern from that audit trail: reportId is
     * client-supplied, so submitting one that happens to collide with an existing report would
     * otherwise silently turn this "create a new report" call into an edit of someone else's
     * report (merge() instead of persist()) rather than failing clearly up front.
     */
    @Transactional
    public ProductQualityCheck submitProductCheck(SubmitProductQcRequest request) {
        if (productQcRepository.existsById(request.reportId())) {
            throw new BusinessRuleViolationException("QC report '" + request.reportId() + "' already exists");
        }
        ProductQualityCheck check = ProductQualityCheck.builder()
                .reportId(request.reportId())
                .batchNo(request.batchNo())
                .analysisDate(request.analysisDate())
                .analystName(request.analystName())
                .sampleSize(request.sampleSize())
                .processState(request.processState())
                .test(request.test())
                .limits(request.limits())
                .results(request.results())
                .empId(request.empId())
                .build();
        return productQcRepository.save(check);
    }

    public List<QcAuditLog> auditTrailFor(String reportId) {
        return auditLogRepository.findByReportIdOrderByChangeDateDesc(reportId);
    }
}
