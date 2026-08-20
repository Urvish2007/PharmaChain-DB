package com.pharmachain.dto.response;

import java.math.BigDecimal;

/** One row of v_inventory_shortage: a warehouse lot that has dropped to/below its reorder level. */
public record InventoryShortageRow(
        Long itemId,
        String materialName,
        String materialType,
        BigDecimal currentStock,
        BigDecimal minimumRequired,
        BigDecimal unitsToOrder
) {
}
