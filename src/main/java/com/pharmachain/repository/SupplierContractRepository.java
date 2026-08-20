package com.pharmachain.repository;

import com.pharmachain.entity.SupplierContract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierContractRepository extends JpaRepository<SupplierContract, String> {
    List<SupplierContract> findByMaterialId(String materialId);
}
