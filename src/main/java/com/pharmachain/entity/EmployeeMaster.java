package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Mirrors Employee_Master: staff who sign off QC results, run production and maintain equipment. */
@Entity
@Table(name = "employee_master", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeMaster {

    @Id
    @Column(name = "emp_id", length = 20)
    @NotBlank
    private String empId;

    @Column(name = "emp_name", length = 50, nullable = false)
    @NotBlank
    private String empName;

    @Column(name = "department", length = 30, nullable = false)
    private String department;

    @Column(name = "role", length = 30, nullable = false)
    private String role;

    @Column(name = "hire_date", nullable = false)
    @NotNull
    private LocalDate hireDate;

    @Column(name = "email", length = 80)
    private String email;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "status", length = 15)
    private String status;

    @Column(name = "shift", length = 10)
    private String shift;

    @Column(name = "salary_grade", length = 5)
    private String salaryGrade;

    @Column(name = "reporting_to", length = 20)
    private String reportingTo;
}
