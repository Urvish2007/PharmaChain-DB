package com.pharmachain.repository;

import com.pharmachain.entity.ProductMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductMasterRepository extends JpaRepository<ProductMaster, String> {
}
