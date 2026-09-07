package com.pharmachain.repository;

import com.pharmachain.entity.ProductSerialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductSerializationRepository extends JpaRepository<ProductSerialization, String> {
    List<ProductSerialization> findByBatchBatchNo(Long batchNo);
}
