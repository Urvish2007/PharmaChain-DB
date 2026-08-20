package com.pharmachain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Mirrors Material_Quality_Check: the incoming-raw-material lab report for one warehouse lot. */
@Entity
@Table(name = "material_quality_check", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialQualityCheck {

    @Id
    @Column(name = "report_id", length = 20)
    private String reportId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "analysis_date", nullable = false)
    private LocalDate analysisDate;

    @Column(name = "analyst_name", length = 20, nullable = false)
    private String analystName;

    @Column(name = "sample_size", nullable = false)
    private BigDecimal sampleSize;

    @Column(name = "test", length = 20, nullable = false)
    private String test;

    @Column(name = "limits", length = 20, nullable = false)
    private String limits;

    @Column(name = "results", length = 30, nullable = false)
    private String results;

    @Column(name = "emp_id", length = 20)
    private String empId;
}
