package com.pharmachain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "facility_master")
public class FacilityMaster {

    @Id
    @Column(name = "facility_id", length = 20)
    private String facilityId;

    @Column(name = "facility_name", nullable = false, length = 100)
    private String facilityName;

    @Column(name = "location", nullable = false, length = 200)
    private String location;

    @Column(name = "facility_type", nullable = false, length = 50)
    private String facilityType;

    // Getters and Setters

    public String getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(String facilityId) {
        this.facilityId = facilityId;
    }

    public String getFacilityName() {
        return facilityName;
    }

    public void setFacilityName(String facilityName) {
        this.facilityName = facilityName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(String facilityType) {
        this.facilityType = facilityType;
    }
}
