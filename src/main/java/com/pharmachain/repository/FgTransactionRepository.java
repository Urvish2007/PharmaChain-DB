package com.pharmachain.repository;

import com.pharmachain.entity.FgTransaction;
import com.pharmachain.entity.FgTransactionId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FgTransactionRepository extends JpaRepository<FgTransaction, FgTransactionId> {
    List<FgTransaction> findByIdBatchNo(Long batchNo);
}
