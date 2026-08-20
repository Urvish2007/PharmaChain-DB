package com.pharmachain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Mirrors Material_Dispensing: how much of a warehouse lot was issued to a production batch.
 * Every INSERT here fires trg_deduct_stock_on_dispense, which atomically decrements
 * Warehouse.stock and rejects the insert (raising a Postgres exception the service layer
 * translates into HTTP 422) if not enough stock remains.
 */
@Entity
@Table(name = "material_dispensing", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialDispensing {

    @EmbeddedId
    private MaterialDispensingId id;

    @Column(name = "quantity_issued", nullable = false)
    private BigDecimal quantityIssued;
}
