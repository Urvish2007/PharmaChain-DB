package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Mirrors Maintenance_Log: a maintenance event and its cost for a piece of equipment. */
@Entity
@Table(name = "maintenance_log", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceLog {

    @Id
    @Column(name = "maintenance_id", length = 20)
    @NotBlank
    private String maintenanceId;

    @Column(name = "equipment_id", length = 20, nullable = false)
    @NotBlank
    private String equipmentId;

    @Column(name = "emp_id", length = 20)
    private String empId;

    @Column(name = "maintenance_date", nullable = false)
    private LocalDate maintenanceDate;

    @Column(name = "cost", precision = 10, scale = 2, nullable = false)
    private BigDecimal cost;
}
