package com.pharmachain.repository;

import com.pharmachain.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    List<Warehouse> findByMaterialId(String materialId);
    Optional<Warehouse> findByMaterialIdAndInvoiceNo(String materialId, Long invoiceNo);
}
