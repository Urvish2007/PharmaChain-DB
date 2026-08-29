package com.pharmachain.service;

import com.pharmachain.entity.EquipmentMaster;
import com.pharmachain.exception.BusinessRuleViolationException;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.EquipmentMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EquipmentService {

    private final EquipmentMasterRepository repository;

    public List<EquipmentMaster> findAll() {
        return repository.findAll();
    }

    public EquipmentMaster findById(String equipmentId) {
        return repository.findById(equipmentId)
                .orElseThrow(() -> ResourceNotFoundException.forId("Equipment", equipmentId));
    }

    /** See MaterialService#create for why this existence check exists - save() would otherwise merge() on a duplicate id and silently overwrite the existing equipment instead of failing. */
    @Transactional
    public EquipmentMaster create(EquipmentMaster equipment) {
        if (repository.existsById(equipment.getEquipmentId())) {
            throw new BusinessRuleViolationException(
                    "Equipment '" + equipment.getEquipmentId() + "' already exists");
        }
        return repository.save(equipment);
    }

    @Transactional
    public EquipmentMaster update(String equipmentId, EquipmentMaster update) {
        EquipmentMaster existing = findById(equipmentId);
        update.setEquipmentId(existing.getEquipmentId());
        return repository.save(update);
    }

    @Transactional
    public void delete(String equipmentId) {
        findById(equipmentId);
        repository.deleteById(equipmentId);
    }
}
