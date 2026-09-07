package com.pharmachain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingResponse {
    private String serialNo;
    private String authenticityStatus; // e.g. "Authentic", "Invalid", "Recalled"
    private Long batchNo;
    private String productName;
    private LocalDate mfgDate;
    private LocalDate expDate;
    private String qcStatus; // PASSED / FAILED
}
