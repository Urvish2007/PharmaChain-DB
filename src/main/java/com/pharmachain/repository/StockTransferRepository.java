package com.pharmachain.repository;

import com.pharmachain.entity.StockTransfer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTransferRepository extends JpaRepository<StockTransfer, String> {
    List<StockTransfer> findByFromFacilityFacilityId(String facilityId);
    List<StockTransfer> findByToFacilityFacilityId(String facilityId);
}
