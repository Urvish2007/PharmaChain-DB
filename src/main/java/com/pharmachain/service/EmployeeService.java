package com.pharmachain.service;

import com.pharmachain.entity.EmployeeMaster;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.EmployeeMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeMasterRepository repository;

    public List<EmployeeMaster> findAll() {
        return repository.findAll();
    }

    public EmployeeMaster findById(String empId) {
        return repository.findById(empId)
                .orElseThrow(() -> ResourceNotFoundException.forId("Employee", empId));
    }

    @Transactional
    public EmployeeMaster create(EmployeeMaster employee) {
        return repository.save(employee);
    }

    @Transactional
    public EmployeeMaster update(String empId, EmployeeMaster update) {
        EmployeeMaster existing = findById(empId);
        update.setEmpId(existing.getEmpId());
        return repository.save(update);
    }

    @Transactional
    public void delete(String empId) {
        findById(empId);
        repository.deleteById(empId);
    }
}
