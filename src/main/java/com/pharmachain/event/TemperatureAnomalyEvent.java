package com.pharmachain.event;

import org.springframework.context.ApplicationEvent;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TemperatureAnomalyEvent extends ApplicationEvent {
    
    private final Long batchNo;
    private final String sensorId;
    private final BigDecimal recordedTemperature;
    private final LocalDateTime anomalyTimestamp;

    public TemperatureAnomalyEvent(Object source, Long batchNo, String sensorId, BigDecimal recordedTemperature, LocalDateTime anomalyTimestamp) {
        super(source);
        this.batchNo = batchNo;
        this.sensorId = sensorId;
        this.recordedTemperature = recordedTemperature;
        this.anomalyTimestamp = anomalyTimestamp;
    }

    public Long getBatchNo() {
        return batchNo;
    }

    public String getSensorId() {
        return sensorId;
    }

    public BigDecimal getRecordedTemperature() {
        return recordedTemperature;
    }

    public LocalDateTime getAnomalyTimestamp() {
        return anomalyTimestamp;
    }
}
