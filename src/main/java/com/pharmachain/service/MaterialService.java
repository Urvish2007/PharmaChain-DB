package com.pharmachain.service;

import com.pharmachain.entity.MaterialMaster;
import com.pharmachain.exception.BusinessRuleViolationException;
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

    /**
     * Spring Data JPA's save() calls merge() (not persist()) whenever the entity's @Id is
     * already non-null - which is always true here, since materialId is client-supplied, not
     * generated. merge() on an id that already exists silently UPDATEs that row instead of
     * failing, so a duplicate-id "create" would otherwise overwrite someone else's material
     * with no error at all. This check is what turns that into a clear 422 instead.
     */
    @Transactional
    public MaterialMaster create(MaterialMaster material) {
        if (repository.existsById(material.getMaterialId())) {
            throw new BusinessRuleViolationException(
                    "Material '" + material.getMaterialId() + "' already exists");
        }
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
