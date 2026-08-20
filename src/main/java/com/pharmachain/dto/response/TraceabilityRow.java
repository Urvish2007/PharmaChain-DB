package com.pharmachain.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

/** One row of v_fda_batch_traceability: full lifecycle of a batch - ingredients, QC status, sales. */
public record TraceabilityRow(
        Long batchNo,
        String productName,
        LocalDate mfgDate,
        LocalDate expDate,
        String qcStatus,
        String rawMaterialsUsed,
        BigDecimal totalSoldToMarket
) {
}
