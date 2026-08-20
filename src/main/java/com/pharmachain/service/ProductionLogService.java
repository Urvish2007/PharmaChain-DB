package com.pharmachain.service;

import com.pharmachain.entity.ProductionLog;
import com.pharmachain.repository.ProductionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductionLogService {

    private final ProductionLogRepository repository;

    public List<ProductionLog> findByBatch(Long batchNo) {
        return repository.findByBatchNoOrderByStartTimeAsc(batchNo);
    }

    @Transactional
    public ProductionLog create(ProductionLog log) {
        return repository.save(log);
    }
}
