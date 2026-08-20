package com.pharmachain.repository;

import com.pharmachain.entity.FormulaMaster;
import com.pharmachain.entity.FormulaMasterId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormulaMasterRepository extends JpaRepository<FormulaMaster, FormulaMasterId> {
    List<FormulaMaster> findByIdProductId(String productId);
}
