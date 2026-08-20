package com.pharmachain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Mirrors Warehouse: one serialized lot of raw material received against one invoice.
 * Stock on a lot is decremented automatically by trg_deduct_stock_on_dispense whenever
 * a Material_Dispensing row is inserted, and the trigger blocks the insert outright if
 * there isn't enough left - so this entity's `stock` field should be treated as
 * read-derived from the app's point of view; never decrement it directly in Java.
 */
@Entity
@Table(name = "warehouse", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "material_id", length = 20, nullable = false)
    private String materialId;

    @Column(name = "invoice_no", nullable = false)
    private Long invoiceNo;

    /** Unit/quantity status code, e.g. under test vs approved. */
    @Column(name = "ut_q_a", length = 2, nullable = false)
    private String utQA;

    @Column(name = "stock", nullable = false)
    private BigDecimal stock;
}
