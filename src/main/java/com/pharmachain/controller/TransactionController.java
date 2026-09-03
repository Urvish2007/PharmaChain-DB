package com.pharmachain.controller;

import com.pharmachain.entity.Transaction;
import com.pharmachain.service.TransactionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Financial ledger transactions")
public class TransactionController {

    private final TransactionService service;

    @GetMapping
    public List<Transaction> findAll() {
        return service.findAll();
    }
}
