package com.farmersmarket.backend.repository;

import com.farmersmarket.backend.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByFarmerId(String farmerId);
    List<Product> findByCategory(String category);
}
