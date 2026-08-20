package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Mirrors Equipment_Master: production/lab equipment and its calibration status. */
@Entity
@Table(name = "equipment_master", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentMaster {

    @Id
    @Column(name = "equipment_id", length = 20)
    @NotBlank
    private String equipmentId;

    @Column(name = "equipment_name", length = 50, nullable = false)
    @NotBlank
    private String equipmentName;

    @Column(name = "equipment_type", length = 30, nullable = false)
    private String equipmentType;

    @Column(name = "last_calibration_date", nullable = false)
    private LocalDate lastCalibrationDate;

    /** Active | Maintenance - enforced by a CHECK constraint in the DB. */
    @Column(name = "status", length = 20, nullable = false)
    private String status;
}
