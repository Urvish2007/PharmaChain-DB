package com.pharmachain.repository;

import com.pharmachain.entity.MaterialDispensing;
import com.pharmachain.entity.MaterialDispensingId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialDispensingRepository extends JpaRepository<MaterialDispensing, MaterialDispensingId> {
    List<MaterialDispensing> findByIdBatchNo(Long batchNo);
}
