package com.pharmachain.service;

import com.pharmachain.entity.EmployeeMaster;
import com.pharmachain.exception.BusinessRuleViolationException;
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

    /** See MaterialService#create for why this existence check exists - save() would otherwise merge() on a duplicate id and silently overwrite the existing employee instead of failing. */
    @Transactional
    public EmployeeMaster create(EmployeeMaster employee) {
        if (repository.existsById(employee.getEmpId())) {
            throw new BusinessRuleViolationException(
                    "Employee '" + employee.getEmpId() + "' already exists");
        }
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
