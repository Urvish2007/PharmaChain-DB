package com.pharmachain.service;

import com.pharmachain.entity.AccountMaster;
import com.pharmachain.exception.BusinessRuleViolationException;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.AccountMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountService {

    private final AccountMasterRepository repository;

    public List<AccountMaster> findAll() {
        return repository.findAll();
    }

    public AccountMaster findById(String accountNo) {
        return repository.findById(accountNo)
                .orElseThrow(() -> ResourceNotFoundException.forId("Account", accountNo));
    }

    /** See MaterialService#create for why this existence check exists - save() would otherwise merge() on a duplicate id and silently overwrite the existing account instead of failing. */
    @Transactional
    public AccountMaster create(AccountMaster account) {
        if (repository.existsById(account.getAccountNo())) {
            throw new BusinessRuleViolationException(
                    "Account '" + account.getAccountNo() + "' already exists");
        }
        return repository.save(account);
    }

    @Transactional
    public AccountMaster update(String accountNo, AccountMaster update) {
        AccountMaster existing = findById(accountNo);
        update.setAccountNo(existing.getAccountNo());
        return repository.save(update);
    }

    @Transactional
    public void delete(String accountNo) {
        findById(accountNo);
        repository.deleteById(accountNo);
    }
}
