package com.pharmachain.service;

import com.pharmachain.entity.Transaction;
import com.pharmachain.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository repository;

    public List<Transaction> findAll() {
        return repository.findAll();
    }
}
