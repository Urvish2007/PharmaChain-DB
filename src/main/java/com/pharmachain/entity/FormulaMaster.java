package com.pharmachain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Mirrors Formula_Master: the bill-of-materials (BOM) - how much of each material one tablet needs. */
@Entity
@Table(name = "formula_master", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormulaMaster {

    @EmbeddedId
    private FormulaMasterId id;

    @Column(name = "weight_per_tablet", nullable = false)
    private BigDecimal weightPerTablet;
}
