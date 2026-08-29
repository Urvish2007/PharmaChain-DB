package com.pharmachain.service;

import com.pharmachain.entity.ProductMaster;
import com.pharmachain.exception.BusinessRuleViolationException;
import com.pharmachain.exception.ResourceNotFoundException;
import com.pharmachain.repository.ProductMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductMasterRepository repository;

    public List<ProductMaster> findAll() {
        return repository.findAll();
    }

    public ProductMaster findById(String productId) {
        return repository.findById(productId)
                .orElseThrow(() -> ResourceNotFoundException.forId("Product", productId));
    }

    /** See MaterialService#create for why this existence check exists - save() would otherwise merge() on a duplicate id and silently overwrite the existing product instead of failing. */
    @Transactional
    public ProductMaster create(ProductMaster product) {
        if (repository.existsById(product.getProductId())) {
            throw new BusinessRuleViolationException(
                    "Product '" + product.getProductId() + "' already exists");
        }
        return repository.save(product);
    }

    @Transactional
    public ProductMaster update(String productId, ProductMaster update) {
        ProductMaster existing = findById(productId);
        update.setProductId(existing.getProductId());
        return repository.save(update);
    }

    @Transactional
    public void delete(String productId) {
        findById(productId);
        repository.deleteById(productId);
    }
}
