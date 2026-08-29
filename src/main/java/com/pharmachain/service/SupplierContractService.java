package com.pharmachain.service;

import com.pharmachain.entity.SupplierContract;
import com.pharmachain.exception.BusinessRuleViolationException;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.SupplierContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierContractService {

    private final SupplierContractRepository repository;

    public List<SupplierContract> findAll() {
        return repository.findAll();
    }

    public List<SupplierContract> findByMaterial(String materialId) {
        return repository.findByMaterialId(materialId);
    }

    public SupplierContract findById(String contractId) {
        return repository.findById(contractId)
                .orElseThrow(() -> ResourceNotFoundException.forId("Supplier contract", contractId));
    }

    /** See MaterialService#create for why this existence check exists - save() would otherwise merge() on a duplicate id and silently overwrite the existing contract instead of failing. */
    @Transactional
    public SupplierContract create(SupplierContract contract) {
        if (repository.existsById(contract.getContractId())) {
            throw new BusinessRuleViolationException(
                    "Supplier contract '" + contract.getContractId() + "' already exists");
        }
        return repository.save(contract);
    }

    @Transactional
    public void delete(String contractId) {
        findById(contractId);
        repository.deleteById(contractId);
    }
}
