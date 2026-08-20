package com.pharmachain.repository;

import com.pharmachain.entity.MaterialQualityCheck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialQualityCheckRepository extends JpaRepository<MaterialQualityCheck, String> {
    List<MaterialQualityCheck> findByItemId(Long itemId);
}
