package com.pharmachain.service;

import com.pharmachain.dto.TrackingResponse;
import com.pharmachain.entity.Batch;
import com.pharmachain.entity.ProductMaster;
import com.pharmachain.entity.ProductQualityCheck;
import com.pharmachain.entity.ProductSerialization;
import com.pharmachain.repository.BatchRepository;
import com.pharmachain.repository.ProductMasterRepository;
import com.pharmachain.repository.ProductQualityCheckRepository;
import com.pharmachain.repository.ProductSerializationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SerializationService {

    @Autowired
    private ProductSerializationRepository serializationRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private ProductMasterRepository productMasterRepository;

    @Autowired
    private ProductQualityCheckRepository qcRepository;

    public List<ProductSerialization> generateSerialNumbers(Long batchNo, int count) {
        Batch batch = batchRepository.findById(batchNo)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        List<ProductSerialization> serials = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            ProductSerialization ps = new ProductSerialization();
            ps.setSerialNo(UUID.randomUUID().toString());
            ps.setBatch(batch);
            ps.setStatus("ACTIVE");
            serials.add(ps);
        }
        return serializationRepository.saveAll(serials);
    }

    public TrackingResponse trackMedicine(String serialNo) {
        Optional<ProductSerialization> optSerial = serializationRepository.findById(serialNo);
        if (optSerial.isEmpty()) {
            return TrackingResponse.builder()
                    .serialNo(serialNo)
                    .authenticityStatus("Invalid / Counterfeit")
                    .build();
        }

        ProductSerialization ps = optSerial.get();
        Batch batch = ps.getBatch();
        
        String productName = "Unknown";
        Optional<ProductMaster> optProd = productMasterRepository.findById(batch.getProductId());
        if (optProd.isPresent()) {
            productName = optProd.get().getProductName();
        }

        String qcStatus = "PENDING";
        List<ProductQualityCheck> qcList = qcRepository.findByBatchNoOrderByAnalysisDateDesc(batch.getBatchNo());
        if (!qcList.isEmpty()) {
            qcStatus = qcList.get(0).getResults(); // "PASSED" or "FAILED"
        }

        String authStatus = "Authentic";
        if ("RECALLED".equals(ps.getStatus())) {
            authStatus = "Recalled";
        } else if ("FAILED".equals(qcStatus)) {
            authStatus = "Quarantined (QC Failed)";
        }

        return TrackingResponse.builder()
                .serialNo(serialNo)
                .authenticityStatus(authStatus)
                .batchNo(batch.getBatchNo())
                .productName(productName)
                .mfgDate(batch.getMfgDate())
                .expDate(batch.getExpDate())
                .qcStatus(qcStatus)
                .build();
    }
}
