package com.pharmachain.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

/** One row of v_inventory_expiry_risk: unsold finished-goods stock and how close it is to expiry. */
public record ExpiryRiskRow(
        Long batchNo,
        String productName,
        LocalDate expDate,
        Integer daysRemaining,
        String riskStatus,
        BigDecimal manufacturedQty,
        BigDecimal totalSoldQty,
        BigDecimal unsoldInventory
) {
}
