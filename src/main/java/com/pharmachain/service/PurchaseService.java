package com.pharmachain.service;

import com.pharmachain.dto.request.RecordPurchaseRequest;
import com.pharmachain.entity.RmTransaction;
import com.pharmachain.entity.RmTransactionId;
import com.pharmachain.entity.Transaction;
import com.pharmachain.entity.Warehouse;
import com.pharmachain.exception.BusinessRuleViolationException;
import com.pharmachain.repository.RmTransactionRepository;
import com.pharmachain.repository.TransactionRepository;
import com.pharmachain.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Records a raw-material purchase as one atomic operation across three tables:
 * Transactions (the invoice), Warehouse (a brand-new lot for the received material) and
 * RM_Transaction (the line joining the two). If any step fails the whole thing rolls back.
 */
@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final TransactionRepository transactionRepository;
    private final WarehouseRepository warehouseRepository;
    private final RmTransactionRepository rmTransactionRepository;

    /**
     * invoiceNo is client-supplied, so Transaction's save() would call merge() (not persist())
     * on a duplicate id and silently overwrite an unrelated existing invoice's currency/value -
     * while still creating a brand-new Warehouse lot and RM_Transaction line pointing at it,
     * leaving the invoice and its line items inconsistent with no error raised at all. This
     * check turns that into a clear 422 before anything is written.
     */
    @Transactional
    public Warehouse recordPurchase(RecordPurchaseRequest request) {
        if (transactionRepository.existsById(request.invoiceNo())) {
            throw new BusinessRuleViolationException("Invoice '" + request.invoiceNo() + "' already exists");
        }

        Transaction transaction = Transaction.builder()
                .invoiceNo(request.invoiceNo())
                .transactionDate(request.transactionDate())
                .currency(request.currency())
                .transactionType("buy")
                .paidReceived(Boolean.FALSE)
                .accountNo(request.accountNo())
                .totalValue(request.totalValue())
                .build();
        transactionRepository.save(transaction);

        Warehouse lot = Warehouse.builder()
                .materialId(request.materialId())
                .invoiceNo(request.invoiceNo())
                .utQA(request.utQA() != null ? request.utQA() : "UT")
                .stock(request.quantity())
                .build();
        lot = warehouseRepository.save(lot); // generates item_id

        RmTransaction rmLine = RmTransaction.builder()
                .id(RmTransactionId.builder()
                        .invoiceNo(request.invoiceNo())
                        .itemId(lot.getItemId())
                        .build())
                .rmQty(request.quantity())
                .val(request.totalValue())
                .build();
        rmTransactionRepository.save(rmLine);

        return lot;
    }
}
