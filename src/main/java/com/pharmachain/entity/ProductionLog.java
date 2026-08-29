package com.pharmachain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
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
    @NotBlank
    private String processStage;

    @Column(name = "start_time", nullable = false)
    @NotNull
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    @NotNull
    private LocalDateTime endTime;

    /**
     * Mirrors the DB's own CONSTRAINT chk_time CHECK (End_Time > Start_Time) as a fast,
     * friendly 400 instead of waiting for the round-trip to fail as a 422. @JsonIgnore keeps
     * this synthetic validation-only property out of the JSON Jackson would otherwise generate
     * for it (any is/get-style method looks like a bean property to Jackson by default).
     */
    @AssertTrue(message = "endTime must be after startTime")
    @JsonIgnore
    public boolean isTimeRangeValid() {
        return startTime == null || endTime == null || endTime.isAfter(startTime);
    }
}
