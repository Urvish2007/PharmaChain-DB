package com.pharmachain.repository;

import com.pharmachain.entity.AccountMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountMasterRepository extends JpaRepository<AccountMaster, String> {
    List<AccountMaster> findByAccountType(String accountType);
}
