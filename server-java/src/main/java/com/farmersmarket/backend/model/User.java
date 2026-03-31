package com.farmersmarket.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String phone;
    private String address;
    private String password;

    @Builder.Default
    private String role = "farmer"; // farmer, buyer, admin

    private String profileImage;
    private String mandal;
    private String district;
    private String state;

    @Builder.Default
    private boolean isApproved = false;

    @Builder.Default
    private String status = "Active"; // Active, Suspended

    private CompanyDetails companyDetails;

    private String resetPasswordToken;
    private Date resetPasswordExpires;

    private LocalDateTime lastActive;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyDetails {
        private String companyName;
        private String shopLicence;
        private String businessType;
    }
}
