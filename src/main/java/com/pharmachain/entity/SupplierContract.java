package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Mirrors Supplier_Contract: the agreed price and validity window for a supplier/material pair. */
@Entity
@Table(name = "supplier_contract", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierContract {

    @Id
    @Column(name = "contract_id", length = 20)
    @NotBlank
    private String contractId;

    @Column(name = "account_no", length = 11, nullable = false)
    @NotBlank
    private String accountNo;

    @Column(name = "material_id", length = 20, nullable = false)
    @NotBlank
    private String materialId;

    // DB: NOT NULL CHECK (Agreed_Price > 0)
    @Column(name = "agreed_price", precision = 10, scale = 2, nullable = false)
    @NotNull
    @Positive
    private BigDecimal agreedPrice;

    @Column(name = "valid_until", nullable = false)
    private LocalDate validUntil;
}
