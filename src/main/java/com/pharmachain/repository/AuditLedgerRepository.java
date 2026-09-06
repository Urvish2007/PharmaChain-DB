package com.pharmachain.repository;

import com.pharmachain.entity.AuditLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuditLedgerRepository extends JpaRepository<AuditLedger, Long> {
    Optional<AuditLedger> findTopByOrderByIdDesc();
}
