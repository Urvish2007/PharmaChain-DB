package com.pharmachain.service;

import com.pharmachain.entity.MaintenanceLog;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaintenanceService {

    private final MaintenanceLogRepository repository;

    public List<MaintenanceLog> findAll() {
        return repository.findAll();
    }

    public List<MaintenanceLog> findByEquipment(String equipmentId) {
        return repository.findByEquipmentIdOrderByMaintenanceDateDesc(equipmentId);
    }

    public MaintenanceLog findById(String maintenanceId) {
        return repository.findById(maintenanceId)
                .orElseThrow(() -> ResourceNotFoundException.forId("Maintenance log", maintenanceId));
    }

    @Transactional
    public MaintenanceLog create(MaintenanceLog log) {
        return repository.save(log);
    }
}
