package com.pharmachain.service;

import com.pharmachain.entity.FacilityMaster;
import com.pharmachain.entity.MaterialMaster;
import com.pharmachain.entity.StockTransfer;
import com.pharmachain.entity.Warehouse;
import com.pharmachain.repository.FacilityMasterRepository;
import com.pharmachain.repository.MaterialMasterRepository;
import com.pharmachain.repository.StockTransferRepository;
import com.pharmachain.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TransferService {

    @Autowired
    private StockTransferRepository stockTransferRepository;

    @Autowired
    private FacilityMasterRepository facilityMasterRepository;

    @Autowired
    private MaterialMasterRepository materialMasterRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Transactional
    public StockTransfer initiateTransfer(String fromFacilityId, String toFacilityId, String materialId, Long sourceInvoiceNo, BigDecimal quantity) {
        FacilityMaster from = facilityMasterRepository.findById(fromFacilityId)
                .orElseThrow(() -> new RuntimeException("Source facility not found"));
        FacilityMaster to = facilityMasterRepository.findById(toFacilityId)
                .orElseThrow(() -> new RuntimeException("Destination facility not found"));
        MaterialMaster material = materialMasterRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        Warehouse sourceStock = warehouseRepository.findByMaterialIdAndInvoiceNoAndFacilityFacilityId(materialId, sourceInvoiceNo, fromFacilityId)
                .orElseThrow(() -> new RuntimeException("Source stock not found"));

        if (sourceStock.getStock().compareTo(quantity) < 0) {
            throw new RuntimeException("Insufficient stock in source facility");
        }

        // Deduct from source
        sourceStock.setStock(sourceStock.getStock().subtract(quantity));
        warehouseRepository.save(sourceStock);

        StockTransfer transfer = new StockTransfer();
        transfer.setTransferId("TRN" + System.currentTimeMillis()); // simplified ID generation
        transfer.setFromFacility(from);
        transfer.setToFacility(to);
        transfer.setMaterial(material);
        transfer.setQuantity(quantity);
        transfer.setStatus("IN_TRANSIT");
        // transferDate is handled by DB default or entity listener

        return stockTransferRepository.save(transfer);
    }

    @Transactional
    public StockTransfer receiveTransfer(String transferId, Long targetInvoiceNo) {
        StockTransfer transfer = stockTransferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found"));

        if (!"IN_TRANSIT".equals(transfer.getStatus())) {
            throw new RuntimeException("Transfer is not in transit");
        }

        FacilityMaster toFacility = transfer.getToFacility();
        MaterialMaster material = transfer.getMaterial();

        // Find or create target warehouse record
        Warehouse targetStock = warehouseRepository.findByMaterialIdAndInvoiceNoAndFacilityFacilityId(material.getMaterialId(), targetInvoiceNo, toFacility.getFacilityId())
                .orElseGet(() -> {
                    Warehouse w = new Warehouse();
                    w.setMaterialId(material.getMaterialId());
                    w.setInvoiceNo(targetInvoiceNo);
                    w.setFacility(toFacility);
                    w.setUtQA("QA"); // Assuming received stock needs QA or carries over
                    w.setStock(BigDecimal.ZERO);
                    return w;
                });

        targetStock.setStock(targetStock.getStock().add(transfer.getQuantity()));
        warehouseRepository.save(targetStock);

        transfer.setStatus("RECEIVED");
        transfer.setReceiveDate(LocalDateTime.now());

        return stockTransferRepository.save(transfer);
    }
}
