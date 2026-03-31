package com.farmersmarket.backend.repository;

import com.farmersmarket.backend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByBuyerId(String buyerId);
    List<Order> findByFarmerId(String farmerId);
}
