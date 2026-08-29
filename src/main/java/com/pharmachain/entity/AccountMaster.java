package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Mirrors Account_Master: suppliers, distributors and hospitals the business transacts with. */
@Entity
@Table(name = "account_master", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountMaster {

    @Id
    @Column(name = "account_no", length = 11)
    @NotBlank
    private String accountNo;

    @Column(name = "account_name", length = 50, nullable = false)
    @NotBlank
    private String accountName;

    @Column(name = "phone_no", length = 13, nullable = false)
    private String phoneNo;

    @Column(name = "address", length = 100, nullable = false)
    private String address;

    /** Supplier | Distributor | Hospital - enforced by a CHECK constraint in the DB. */
    // DB: CHECK (Account_Type IN ('Supplier','Distributor','Hospital'))
    @Column(name = "account_type", length = 20, nullable = false)
    @NotBlank
    @Pattern(regexp = "Supplier|Distributor|Hospital")
    private String accountType;
}
