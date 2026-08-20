package com.pharmachain.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

/** Composite key for Formula_Master: (Product_ID, Material_ID). */
@Embeddable
@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormulaMasterId implements Serializable {

    @jakarta.persistence.Column(name = "product_id", length = 20)
    private String productId;

    @jakarta.persistence.Column(name = "material_id", length = 20)
    private String materialId;
}
