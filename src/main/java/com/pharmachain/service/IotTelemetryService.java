package com.pharmachain.service;

import com.pharmachain.dto.request.IotTemperatureReading;
import com.pharmachain.event.TemperatureAnomalyEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class IotTelemetryService {

    private final ApplicationEventPublisher eventPublisher;

    // Standard cold chain limits (2.0 to 8.0 degrees Celsius)
    private static final BigDecimal MIN_TEMP = new BigDecimal("2.0");
    private static final BigDecimal MAX_TEMP = new BigDecimal("8.0");

    public void processTemperatureReading(IotTemperatureReading reading) {
        log.info("Received IoT Ping: Sensor {} for Batch {} recorded {}°C at {}", 
                reading.sensorId(), reading.batchNo(), reading.temperatureCelsius(), reading.timestamp());

        if (reading.temperatureCelsius().compareTo(MIN_TEMP) < 0 || 
            reading.temperatureCelsius().compareTo(MAX_TEMP) > 0) {
            
            log.warn("🚨 COLD CHAIN VIOLATION: Batch {} temperature {}°C is outside allowed limits (2.0 - 8.0). Triggering Quarantine!", 
                     reading.batchNo(), reading.temperatureCelsius());
            
            TemperatureAnomalyEvent anomalyEvent = new TemperatureAnomalyEvent(
                    this, 
                    reading.batchNo(), 
                    reading.sensorId(), 
                    reading.temperatureCelsius(), 
                    reading.timestamp()
            );
            
            eventPublisher.publishEvent(anomalyEvent);
        }
    }
}
