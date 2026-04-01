package com.farmersmarket.backend.service;

import com.farmersmarket.backend.model.Order;
import com.farmersmarket.backend.repository.OrderRepository;
import com.farmersmarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByBuyer(String buyerId) {
        return orderRepository.findByBuyerId(buyerId);
    }

    public List<Order> getOrdersByFarmer(String farmerId) {
        return orderRepository.findByFarmerId(farmerId);
    }

    public Order placeOrder(Order order) {
        order.setStatus("Pending Admin Approval");
        order.setCreatedAt(LocalDateTime.now());
        
        // Populate names for denormalization
        if (order.getBuyerId() != null) {
            userRepository.findById(order.getBuyerId()).ifPresent(u -> order.setBuyerName(u.getName()));
        }
        if (order.getFarmerId() != null) {
            userRepository.findById(order.getFarmerId()).ifPresent(u -> order.setFarmerName(u.getName()));
        }
        
        return orderRepository.save(order);
    }

    public Order updateOrderStatus(String id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Enrichment for Start of Delivery status check
        if ("In Transit".equalsIgnoreCase(status) && !"Order Approved".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order must be approved by an administrator before it can be shipped.");
        }
        
        if ("Delivered".equalsIgnoreCase(status)) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public Order raiseDispute(String id, Order.Dispute dispute) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        dispute.setRaisedAt(new java.util.Date());
        dispute.setRaised(true);
        dispute.setStatus("Open");
        order.setDispute(dispute);
        return orderRepository.save(order);
    }
}
