package com.pharmachain.service;

import com.pharmachain.entity.SupplierContract;
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

    @Transactional
    public SupplierContract create(SupplierContract contract) {
        return repository.save(contract);
    }

    @Transactional
    public void delete(String contractId) {
        findById(contractId);
        repository.deleteById(contractId);
    }
}
