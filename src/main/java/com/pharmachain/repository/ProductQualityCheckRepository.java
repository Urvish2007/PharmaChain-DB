package com.pharmachain.repository;

import com.pharmachain.entity.ProductQualityCheck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductQualityCheckRepository extends JpaRepository<ProductQualityCheck, String> {
    List<ProductQualityCheck> findByBatchNoOrderByAnalysisDateDesc(Long batchNo);
}
