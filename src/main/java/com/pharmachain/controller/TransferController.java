package com.pharmachain.controller;

import com.pharmachain.entity.StockTransfer;
import com.pharmachain.repository.StockTransferRepository;
import com.pharmachain.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    @Autowired
    private TransferService transferService;

    @Autowired
    private StockTransferRepository stockTransferRepository;

    @PostMapping("/initiate")
    public ResponseEntity<StockTransfer> initiateTransfer(
            @RequestParam String fromFacility,
            @RequestParam String toFacility,
            @RequestParam String materialId,
            @RequestParam Long sourceInvoiceNo,
            @RequestParam BigDecimal quantity) {
        StockTransfer transfer = transferService.initiateTransfer(fromFacility, toFacility, materialId, sourceInvoiceNo, quantity);
        return ResponseEntity.ok(transfer);
    }

    @PostMapping("/{transferId}/receive")
    public ResponseEntity<StockTransfer> receiveTransfer(
            @PathVariable String transferId,
            @RequestParam Long targetInvoiceNo) {
        StockTransfer transfer = transferService.receiveTransfer(transferId, targetInvoiceNo);
        return ResponseEntity.ok(transfer);
    }

    @GetMapping("/facility/{facilityId}/incoming")
    public ResponseEntity<List<StockTransfer>> getIncomingTransfers(@PathVariable String facilityId) {
        return ResponseEntity.ok(stockTransferRepository.findByToFacilityFacilityId(facilityId));
    }

    @GetMapping("/facility/{facilityId}/outgoing")
    public ResponseEntity<List<StockTransfer>> getOutgoingTransfers(@PathVariable String facilityId) {
        return ResponseEntity.ok(stockTransferRepository.findByFromFacilityFacilityId(facilityId));
    }
}
