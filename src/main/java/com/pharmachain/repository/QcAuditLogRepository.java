package com.pharmachain.repository;

import com.pharmachain.entity.QcAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QcAuditLogRepository extends JpaRepository<QcAuditLog, Integer> {
    List<QcAuditLog> findByReportIdOrderByChangeDateDesc(String reportId);
}
