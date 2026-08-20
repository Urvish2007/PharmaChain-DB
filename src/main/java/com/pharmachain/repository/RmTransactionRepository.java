package com.pharmachain.repository;

import com.pharmachain.entity.RmTransaction;
import com.pharmachain.entity.RmTransactionId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RmTransactionRepository extends JpaRepository<RmTransaction, RmTransactionId> {
    List<RmTransaction> findByIdInvoiceNo(Long invoiceNo);
}
