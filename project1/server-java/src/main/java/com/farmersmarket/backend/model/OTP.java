package com.farmersmarket.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "otps")
public class OTP {

    @Id
    private String id;

    private String email;
    private String phone;
    private String otp;

    @Indexed(expireAfterSeconds = 600) // 10 minutes
    private LocalDateTime createdAt;
}
