package com.pharmachain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transfer")
public class StockTransfer {

    @Id
    @Column(name = "transfer_id", length = 20)
    private String transferId;

    @ManyToOne
    @JoinColumn(name = "from_facility_id", nullable = false)
    private FacilityMaster fromFacility;

    @ManyToOne
    @JoinColumn(name = "to_facility_id", nullable = false)
    private FacilityMaster toFacility;

    @ManyToOne
    @JoinColumn(name = "material_id", nullable = false)
    private MaterialMaster material;

    @Column(name = "quantity", nullable = false, precision = 10)
    private BigDecimal quantity;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "transfer_date", insertable = false, updatable = false)
    private LocalDateTime transferDate;

    @Column(name = "receive_date")
    private LocalDateTime receiveDate;

    // Getters and Setters

    public String getTransferId() {
        return transferId;
    }

    public void setTransferId(String transferId) {
        this.transferId = transferId;
    }

    public FacilityMaster getFromFacility() {
        return fromFacility;
    }

    public void setFromFacility(FacilityMaster fromFacility) {
        this.fromFacility = fromFacility;
    }

    public FacilityMaster getToFacility() {
        return toFacility;
    }

    public void setToFacility(FacilityMaster toFacility) {
        this.toFacility = toFacility;
    }

    public MaterialMaster getMaterial() {
        return material;
    }

    public void setMaterial(MaterialMaster material) {
        this.material = material;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTransferDate() {
        return transferDate;
    }

    public void setTransferDate(LocalDateTime transferDate) {
        this.transferDate = transferDate;
    }

    public LocalDateTime getReceiveDate() {
        return receiveDate;
    }

    public void setReceiveDate(LocalDateTime receiveDate) {
        this.receiveDate = receiveDate;
    }
}
