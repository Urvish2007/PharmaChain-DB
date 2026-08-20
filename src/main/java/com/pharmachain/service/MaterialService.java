package com.pharmachain.service;

import com.pharmachain.entity.MaterialMaster;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.MaterialMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialService {

    private final MaterialMasterRepository repository;

    public List<MaterialMaster> findAll() {
        return repository.findAll();
    }

    public MaterialMaster findById(String materialId) {
        return repository.findById(materialId)
                .orElseThrow(() -> ResourceNotFoundException.forId("Material", materialId));
    }

    @Transactional
    public MaterialMaster create(MaterialMaster material) {
        return repository.save(material);
    }

    @Transactional
    public MaterialMaster update(String materialId, MaterialMaster update) {
        MaterialMaster existing = findById(materialId);
        update.setMaterialId(existing.getMaterialId());
        return repository.save(update);
    }

    @Transactional
    public void delete(String materialId) {
        findById(materialId);
        repository.deleteById(materialId);
    }
}
