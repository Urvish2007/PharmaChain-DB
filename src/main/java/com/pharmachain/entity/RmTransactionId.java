package com.pharmachain.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

/** Composite key for RM_Transaction: (Invoice_No, Item_ID). */
@Embeddable
@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RmTransactionId implements Serializable {

    @jakarta.persistence.Column(name = "invoice_no")
    private Long invoiceNo;

    @jakarta.persistence.Column(name = "item_id")
    private Long itemId;
}
