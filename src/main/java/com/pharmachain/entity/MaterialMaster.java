package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;

import java.math.BigDecimal;

/**
 * Mirrors Material_Master: the raw-material catalog (name, storage rules, shelf life, reorder point).
 * This entity doubles as the create/update request body (see MaterialController) - a client that
 * omits reorderLevel should get the DB's `DEFAULT 1000`, not a silent NULL, hence @DynamicInsert.
 */
@Entity
@Table(name = "material_master", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicInsert
public class MaterialMaster {

    @Id
    @Column(name = "material_id", length = 20)
    @NotBlank
    private String materialId;

    @Column(name = "material_name", length = 30, nullable = false)
    @NotBlank
    private String materialName;

    @Column(name = "material_type", length = 20, nullable = false)
    @NotBlank
    private String materialType;

    @Column(name = "storage_condition", length = 100, nullable = false)
    private String storageCondition;

    @Column(name = "shelf_life", nullable = false)
    @NotNull
    private Integer shelfLife;

    @Column(name = "therapeutic_category", length = 30, nullable = false)
    private String therapeuticCategory;

    @Column(name = "material_state", length = 10, nullable = false)
    private String materialState;

    @Column(name = "ishazardous", nullable = false)
    private Boolean hazardous;

    @Column(name = "isinflammable", nullable = false)
    private Boolean inflammable;

    @Column(name = "uom", length = 3, nullable = false)
    @NotBlank
    private String uom;

    @Column(name = "reorder_level")
    private BigDecimal reorderLevel;
}
