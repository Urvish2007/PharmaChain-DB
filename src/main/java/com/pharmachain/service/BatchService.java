package com.pharmachain.service;

import com.pharmachain.dto.request.CreateBatchRequest;
import com.pharmachain.dto.request.DispenseMaterialRequest;
import com.pharmachain.entity.Batch;
import com.pharmachain.entity.MaterialDispensing;
import com.pharmachain.entity.MaterialDispensingId;
import com.pharmachain.entity.Warehouse;
import com.pharmachain.exception.BusinessRuleViolationException;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.BatchRepository;
import com.pharmachain.repository.MaterialDispensingRepository;
import com.pharmachain.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BatchService {

    private final BatchRepository batchRepository;
    private final WarehouseRepository warehouseRepository;
    private final MaterialDispensingRepository dispensingRepository;

    public List<Batch> findAll() {
        return batchRepository.findAll();
    }

    public Batch findById(Long batchNo) {
        return batchRepository.findById(batchNo)
                .orElseThrow(() -> ResourceNotFoundException.forId("Batch", batchNo));
    }

    public List<MaterialDispensing> dispensingHistory(Long batchNo) {
        return dispensingRepository.findByIdBatchNo(batchNo);
    }

    /**
     * Creates a production batch. Mfg/Exp date rules are re-validated here for a fast, friendly
     * error, but trg_strict_batch_dates on the Batch table is what actually guarantees they can
     * never be violated - even by a direct SQL client that bypasses this API entirely.
     */
    @Transactional
    public Batch createBatch(CreateBatchRequest request) {
        if (request.mfgDate().isAfter(java.time.LocalDate.now())) {
            throw new BusinessRuleViolationException(
                    "Manufacturing date cannot be in the future: " + request.mfgDate());
        }
        if (request.expDate().isBefore(request.mfgDate().plusMonths(6))) {
            throw new BusinessRuleViolationException(
                    "Expiry date must be at least 6 months after the manufacturing date");
        }

        Batch batch = Batch.builder()
                .batchNo(request.batchNo())
                .batchSize(request.batchSize())
                .mfgDate(request.mfgDate())
                .expDate(request.expDate())
                .productId(request.productId())
                .stockQty(request.stockQty() != null ? request.stockQty() : request.batchSize())
                .utQA("UT")
                .build();
        return batchRepository.save(batch);
    }

    /**
     * Issues raw material from a warehouse lot to a batch. The actual stock check and deduction
     * happens inside Postgres (trg_deduct_stock_on_dispense) - this pre-check exists purely to
     * return a fast, specific error instead of waiting for the round-trip to fail.
     */
    @Transactional
    public MaterialDispensing dispenseMaterial(DispenseMaterialRequest request) {
        findById(request.batchNo());
        Warehouse lot = warehouseRepository.findById(request.itemId())
                .orElseThrow(() -> ResourceNotFoundException.forId("Warehouse item", request.itemId()));

        if (lot.getStock().compareTo(request.quantityIssued()) < 0) {
            throw new BusinessRuleViolationException(
                    "Not enough stock: item %d has %s units left, requested %s"
                            .formatted(request.itemId(), lot.getStock(), request.quantityIssued()));
        }

        MaterialDispensing dispensing = MaterialDispensing.builder()
                .id(MaterialDispensingId.builder()
                        .batchNo(request.batchNo())
                        .itemId(request.itemId())
                        .build())
                .quantityIssued(request.quantityIssued())
                .build();
        // trg_deduct_stock_on_dispense fires here and decrements Warehouse.stock atomically.
        return dispensingRepository.save(dispensing);
    }
}
