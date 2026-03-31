package com.farmersmarket.backend.controller;

import com.farmersmarket.backend.model.Order;
import com.farmersmarket.backend.model.User;
import com.farmersmarket.backend.repository.OrderRepository;
import com.farmersmarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStats() {
        java.time.LocalDateTime fiveMinsAgo = java.time.LocalDateTime.now().minusMinutes(5);
        
        long totalFarmers = userRepository.countByRole("farmer");
        long onlineFarmers = userRepository.countByRoleAndLastActiveAfter("farmer", fiveMinsAgo);
        long offlineFarmers = totalFarmers - onlineFarmers;

        long totalBuyers = userRepository.countByRole("buyer");
        long onlineBuyers = userRepository.countByRoleAndLastActiveAfter("buyer", fiveMinsAgo);
        long offlineBuyers = totalBuyers - onlineBuyers;

        List<Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();
        double totalValue = allOrders.stream()
                .filter(o -> o.getTotalAmount() != null)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFarmers", totalFarmers);
        stats.put("onlineFarmers", onlineFarmers);
        stats.put("offlineFarmers", offlineFarmers);
        
        stats.put("totalBuyers", totalBuyers);
        stats.put("onlineBuyers", onlineBuyers);
        stats.put("offlineBuyers", offlineBuyers);
        
        stats.put("totalOrders", totalOrders);
        stats.put("totalTransactionValue", totalValue);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers(@RequestParam(required = false) String role) {
        if (role != null) {
            return userRepository.findByRole(role);
        }
        return userRepository.findAll();
    }

    @GetMapping("/users/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getPendingUsers() {
        return userRepository.findByIsApproved(false);
    }

    @PostMapping("/users/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveUser(@PathVariable String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setApproved(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User approved successfully"));
    }

    @PostMapping("/users/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User registration rejected and removed"));
    }
}
