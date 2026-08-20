package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Mirrors app_user - the login/credentials table added on top of the original PharmaChain-DB
 * schema. Kept separate from Employee_Master on purpose: Employee_Master is HR data, this is
 * an authentication concern. empId is a loose, nullable link between the two.
 */
@Entity
@Table(name = "app_user", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 50, nullable = false, unique = true)
    @NotBlank
    private String username;

    @Column(name = "password_hash", length = 100, nullable = false)
    private String passwordHash;

    @Column(name = "emp_id", length = 20)
    private String empId;

    /** ADMIN | QC_ANALYST | WAREHOUSE_MANAGER | PRODUCTION_SUPERVISOR | SALES | AUDITOR */
    @Column(name = "role", length = 30, nullable = false)
    @NotBlank
    private String role;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
