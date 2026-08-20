package com.pharmachain.repository;

import com.pharmachain.entity.ProductRecall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRecallRepository extends JpaRepository<ProductRecall, String> {
    List<ProductRecall> findByBatchNo(Long batchNo);
}
