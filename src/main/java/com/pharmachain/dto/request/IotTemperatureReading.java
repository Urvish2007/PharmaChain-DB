package com.pharmachain.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record IotTemperatureReading(
    @NotNull(message = "Sensor ID is required")
    String sensorId,
    
    @NotNull(message = "Batch No is required")
    Long batchNo,
    
    @NotNull(message = "Temperature is required")
    BigDecimal temperatureCelsius,
    
    LocalDateTime timestamp
) {
    public IotTemperatureReading {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
