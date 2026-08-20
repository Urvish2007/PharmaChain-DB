package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Issues stock from one warehouse lot to one production batch. trg_deduct_stock_on_dispense
 * decrements Warehouse.stock and rejects the insert if quantityIssued exceeds what's on hand.
 */
public record DispenseMaterialRequest(
        @NotNull Long batchNo,
        @NotNull Long itemId,
        @NotNull @Positive BigDecimal quantityIssued
) {
}
