package com.pharmachain.service;

import com.pharmachain.entity.MaintenanceLog;
import com.pharmachain.exception.BusinessRuleViolationException;
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

    /** See MaterialService#create for why this existence check exists - save() would otherwise merge() on a duplicate id and silently overwrite the existing log instead of failing. */
    @Transactional
    public MaintenanceLog create(MaintenanceLog log) {
        if (repository.existsById(log.getMaintenanceId())) {
            throw new BusinessRuleViolationException(
                    "Maintenance log '" + log.getMaintenanceId() + "' already exists");
        }
        return repository.save(log);
    }
}
