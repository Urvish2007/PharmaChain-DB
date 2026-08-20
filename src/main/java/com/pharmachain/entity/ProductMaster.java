package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Mirrors Product_Master: the finished-goods catalog (brand/generic, sample/salable, packing). */
@Entity
@Table(name = "product_master", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductMaster {

    @Id
    @Column(name = "product_id", length = 20)
    @NotBlank
    private String productId;

    @Column(name = "product_name", length = 20, nullable = false)
    @NotBlank
    private String productName;

    @Column(name = "generic_name", length = 100, nullable = false)
    private String genericName;

    @Column(name = "product_type", length = 20, nullable = false)
    private String productType;

    @Column(name = "packing_type", length = 10, nullable = false)
    private String packingType;

    @Column(name = "packing_size", length = 5, nullable = false)
    private String packingSize;

    /** 'M' (salable/marketable) or 'S' (sample) - enforced by a CHECK constraint in the DB. */
    @Column(name = "salableorsample", length = 1, nullable = false)
    private String salableOrSample;

    /** 'G' (generic) or 'B' (branded) - enforced by a CHECK constraint in the DB. */
    @Column(name = "genericorbranded", length = 1, nullable = false)
    private String genericOrBranded;
}
