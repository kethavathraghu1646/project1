package com.farmersmarket.backend.controller;

import com.farmersmarket.backend.model.User;
import com.farmersmarket.backend.service.AuthService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.farmersmarket.backend.repository.UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        String jwt = authService.login(loginRequest.getEmail(), loginRequest.getPassword());
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
        return ResponseEntity.ok(Map.of("token", jwt, "user", user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        authService.register(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOTP(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier") != null ? request.get("identifier") : request.get("email");
        authService.generateAndSendOTP(identifier);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully!"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier") != null ? request.get("identifier") : request.get("email");
        String otp = request.get("otp");
        boolean isValid = authService.verifyOTP(identifier, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully!"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP!"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            authService.forgotPassword(request.get("email"));
            return ResponseEntity.ok(Map.of("message", "Password reset OTP has been sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOTP(@RequestBody Map<String, String> request) {
        try {
            String token = authService.verifyResetOTP(request.get("email"), request.get("otp"));
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully", "token", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password/{token}")
    public ResponseEntity<?> resetPassword(@PathVariable String token, @RequestBody Map<String, String> request) {
        try {
            authService.resetPassword(token, request.get("password"));
            return ResponseEntity.ok(Map.of("message", "Password successfully reset!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}
