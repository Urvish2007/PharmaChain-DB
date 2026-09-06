package com.pharmachain.listener;

import com.pharmachain.dto.request.InitiateRecallRequest;
import com.pharmachain.event.TemperatureAnomalyEvent;
import com.pharmachain.service.RecallService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ColdChainAnomalyListener {

    private final RecallService recallService;

    @Async
    @EventListener
    public void handleTemperatureAnomaly(TemperatureAnomalyEvent event) {
        log.error("💥 Asynchronously processing Cold Chain Anomaly for Batch {} (Temp: {}°C)", 
                  event.getBatchNo(), event.getRecordedTemperature());
                  
        String recallId = "IOT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String reason = String.format("AUTOMATED QUARANTINE: IoT Sensor %s detected cold chain violation (%s°C) at %s", 
                event.getSensorId(), event.getRecordedTemperature(), event.getAnomalyTimestamp());
                
        try {
            InitiateRecallRequest recallRequest = new InitiateRecallRequest(
                    recallId, 
                    event.getBatchNo(), 
                    reason
            );
            
            recallService.initiateRecall(recallRequest);
            log.info("✅ Automated Quarantine executed successfully for Batch {}. Recall ID: {}", 
                     event.getBatchNo(), recallId);
                     
        } catch (Exception e) {
            log.error("❌ Failed to execute automated quarantine for Batch {}: {}", 
                      event.getBatchNo(), e.getMessage());
        }
    }
}
