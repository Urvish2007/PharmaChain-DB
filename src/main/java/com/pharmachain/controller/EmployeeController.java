package com.pharmachain.controller;

import com.pharmachain.entity.EmployeeMaster;
import com.pharmachain.service.EmployeeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Staff who sign off QC results, run production and maintenance")
public class EmployeeController {

    private final EmployeeService service;

    @GetMapping
    public List<EmployeeMaster> findAll() {
        return service.findAll();
    }

    @GetMapping("/{empId}")
    public EmployeeMaster findById(@PathVariable String empId) {
        return service.findById(empId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeMaster create(@Valid @RequestBody EmployeeMaster employee) {
        return service.create(employee);
    }

    @PutMapping("/{empId}")
    public EmployeeMaster update(@PathVariable String empId, @Valid @RequestBody EmployeeMaster employee) {
        return service.update(empId, employee);
    }

    @DeleteMapping("/{empId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String empId) {
        service.delete(empId);
        return ResponseEntity.noContent().build();
    }
}
