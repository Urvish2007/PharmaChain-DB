package com.pharmachain.repository;

import com.pharmachain.entity.ProductionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductionLogRepository extends JpaRepository<ProductionLog, Long> {
    List<ProductionLog> findByBatchNoOrderByStartTimeAsc(Long batchNo);
}
