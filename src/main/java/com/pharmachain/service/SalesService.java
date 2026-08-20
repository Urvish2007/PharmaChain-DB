package com.pharmachain.service;

import com.pharmachain.dto.request.RecordSaleRequest;
import com.pharmachain.entity.FgTransaction;
import com.pharmachain.entity.FgTransactionId;
import com.pharmachain.entity.Transaction;
import com.pharmachain.repository.FgTransactionRepository;
import com.pharmachain.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Records a finished-goods sale as one atomic operation: a 'sell' row in Transactions, then the
 * FG_Transaction line. The second insert is where trg_prevent_bad_sales runs - a batch that
 * hasn't passed QC (or has no QC record at all) makes this whole method roll back with the
 * trigger's message surfaced as an HTTP 422 by GlobalExceptionHandler.
 */
@Service
@RequiredArgsConstructor
public class SalesService {

    private final TransactionRepository transactionRepository;
    private final FgTransactionRepository fgTransactionRepository;

    @Transactional
    public FgTransaction recordSale(RecordSaleRequest request) {
        Transaction transaction = Transaction.builder()
                .invoiceNo(request.invoiceNo())
                .transactionDate(request.transactionDate())
                .currency(request.currency())
                .transactionType("sell")
                .paidReceived(Boolean.FALSE)
                .accountNo(request.accountNo())
                .totalValue(request.totalValue())
                .build();
        transactionRepository.save(transaction);

        FgTransaction sale = FgTransaction.builder()
                .id(FgTransactionId.builder()
                        .invoiceNo(request.invoiceNo())
                        .batchNo(request.batchNo())
                        .build())
                .saleQty(request.saleQty())
                .val(request.totalValue())
                .build();
        return fgTransactionRepository.save(sale);
    }
}
