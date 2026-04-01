package com.farmersmarket.backend.repository;

import com.farmersmarket.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);

    long countByRole(String role);
    long countByRoleAndLastActiveAfter(String role, java.time.LocalDateTime threshold);

    java.util.List<User> findByIsApproved(boolean isApproved);
    java.util.List<User> findByRole(String role);
}
