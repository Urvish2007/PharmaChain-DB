package com.pharmachain.controller;

import com.pharmachain.entity.AccountMaster;
import com.pharmachain.service.AccountService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Suppliers, distributors and hospitals")
public class AccountController {

    private final AccountService service;

    @GetMapping
    public List<AccountMaster> findAll() {
        return service.findAll();
    }

    @GetMapping("/{accountNo}")
    public AccountMaster findById(@PathVariable String accountNo) {
        return service.findById(accountNo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountMaster create(@Valid @RequestBody AccountMaster account) {
        return service.create(account);
    }

    @PutMapping("/{accountNo}")
    public AccountMaster update(@PathVariable String accountNo, @Valid @RequestBody AccountMaster account) {
        return service.update(accountNo, account);
    }

    @DeleteMapping("/{accountNo}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String accountNo) {
        service.delete(accountNo);
        return ResponseEntity.noContent().build();
    }
}
