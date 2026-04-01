package com.farmersmarket.backend.repository;

import com.farmersmarket.backend.model.OTP;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OTPRepository extends MongoRepository<OTP, String> {
    Optional<OTP> findTopByEmailOrderByCreatedAtDesc(String email);
}
