package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Mirrors Production_Log: a timestamped process step (granulation, compression, ...) on a batch. */
@Entity
@Table(name = "production_log", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "batch_no", nullable = false)
    @NotNull
    private Long batchNo;

    @Column(name = "equipment_id", length = 20)
    private String equipmentId;

    @Column(name = "emp_id", length = 20)
    private String empId;

    @Column(name = "process_stage", length = 30, nullable = false)
    private String processStage;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
}
