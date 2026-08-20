package com.pharmachain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

/** Composite key for Material_Dispensing: (Batch_No, Item_ID). */
@Embeddable
@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialDispensingId implements Serializable {

    @Column(name = "batch_no")
    private Long batchNo;

    @Column(name = "item_id")
    private Long itemId;
}
