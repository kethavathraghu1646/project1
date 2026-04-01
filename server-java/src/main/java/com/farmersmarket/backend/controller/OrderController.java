package com.farmersmarket.backend.controller;

import com.farmersmarket.backend.model.Order;
import com.farmersmarket.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    @Autowired
    private OrderService orderService;
 
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('BUYER') or hasRole('FARMER') or hasRole('ADMIN')")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/buyer/{buyerId}")
    @PreAuthorize("hasRole('BUYER') or hasRole('ADMIN') or hasRole('FARMER')")
    public List<Order> getOrdersByBuyer(@PathVariable String buyerId) {
        return orderService.getOrdersByBuyer(buyerId);
    }

    @GetMapping("/farmer/{farmerId}")
    @PreAuthorize("hasRole('FARMER') or hasRole('ADMIN')")
    public List<Order> getOrdersByFarmer(@PathVariable String farmerId) {
        return orderService.getOrdersByFarmer(farmerId);
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER') or hasRole('FARMER') or hasRole('ADMIN')")
    public ResponseEntity<Order> placeOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.placeOrder(order));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('FARMER') or hasRole('ADMIN')")
    public ResponseEntity<Order> updateStatus(@PathVariable String id, @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.get("status")));
    }

    @PostMapping("/{id}/dispute")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Order> raiseDispute(@PathVariable String id, @RequestBody Order.Dispute dispute) {
        return ResponseEntity.ok(orderService.raiseDispute(id, dispute));
    }
}
