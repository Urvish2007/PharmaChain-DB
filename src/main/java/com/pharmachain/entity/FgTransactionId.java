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

/** Composite key for FG_Transaction: (Invoice_No, Batch_No). */
@Embeddable
@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FgTransactionId implements Serializable {

    @Column(name = "invoice_no")
    private Long invoiceNo;

    @Column(name = "batch_no")
    private Long batchNo;
}
