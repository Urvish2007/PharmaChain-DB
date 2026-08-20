package com.pharmachain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;

/** Mirrors Account_Master: suppliers, distributors and hospitals the business transacts with. */
@Entity
@Table(name = "account_master", schema = "pharma_manufacturing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicInsert
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

    /**
     * Supplier | Distributor | Hospital - enforced by a CHECK constraint in the DB.
     * Genuinely optional: the column is nullable with `DEFAULT 'Distributor'`, so this is
     * deliberately NOT @NotBlank - that would force every caller to specify it, permanently
     * defeating the DB default with a 400 instead of ever letting it apply. @DynamicInsert
     * (above) is what makes omitting it actually reach the DB as an omitted column, not NULL.
     */
    @Column(name = "account_type", length = 20)
    private String accountType;
}
