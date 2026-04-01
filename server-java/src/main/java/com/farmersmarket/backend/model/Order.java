package com.farmersmarket.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String buyerId;
    private String buyerName;
    private String farmerId;
    private String farmerName;
    private List<OrderItem> products;
    private Double totalAmount;
    private String paymentMode;

    @Builder.Default
    private String status = "Pending Admin Approval"; // Pending Admin Approval, Order Approved, In Transit, Delivered, Cancelled

    private DeliveryDetails deliveryDetails;
    private TransportDetails transportDetails;
    private Dispute dispute;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime deliveredAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String name;
        private Double price;
        private Double quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryDetails {
        private String address;
        private String phone;
        private Date preferredDate;
        private Date expectedDeliveryDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransportDetails {
        private String vehicleNumber;
        private String driverName;
        private String driverPhone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Dispute {
        @Builder.Default
        private boolean isRaised = false;
        private String reason;
        
        @Builder.Default
        private String status = "Open"; // Open, Resolved
        private String resolutionNote;
        private Date raisedAt;
    }
}
