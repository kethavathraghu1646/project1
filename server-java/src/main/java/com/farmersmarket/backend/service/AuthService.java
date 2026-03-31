package com.farmersmarket.backend.service;

import com.farmersmarket.backend.config.JwtUtils;
import com.farmersmarket.backend.model.OTP;
import com.farmersmarket.backend.model.User;
import com.farmersmarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    // In-memory or Redis would be better for OTP, but using Mongo for now as per current setup
    @Autowired
    private com.farmersmarket.backend.repository.OTPRepository otpRepository;

    public String login(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtUtils.generateJwtToken(authentication);
    }

    public void register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    private void saveAndSendOTP(String email, String subject, String bodyPrefix) {
        String otpValue = String.format("%06d", new Random().nextInt(1000000));
        OTP otp = OTP.builder()
                .email(email)
                .otp(otpValue)
                .createdAt(LocalDateTime.now())
                .build();
        otpRepository.save(otp);
        
        System.out.println("\n==================================================");
        System.out.println(" DEVELOPMENT MODE: " + subject + " for " + email + " -> " + otpValue);
        System.out.println("==================================================\n");

        String body = bodyPrefix + otpValue + "\n\nRegards,\nFarmers Market Team";
        try {
            emailService.sendEmail(email, subject, body);
        } catch (Exception e) {
            System.err.println("Warning: Failed to send OTP email via SMTP. Please use the developer logs to proceed.");
        }
    }

    public void generateAndSendOTP(String email) {
        saveAndSendOTP(email, "Your Farmers Market OTP", "Hello,\n\nYour OTP for registration is: ");
    }

    public boolean verifyOTP(String email, String otpValue) {
        Optional<OTP> otp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        return otp.map(value -> 
                value.getOtp().equals(otpValue) && 
                value.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(5))
        ).orElse(false);
    }

    public String forgotPassword(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            saveAndSendOTP(email, "Password Reset OTP", "Hello,\n\nYour OTP for password reset is: ");
            return "OTP sent successfully";
        }
        throw new RuntimeException("User not found with this email");
    }

    public String verifyResetOTP(String email, String otpValue) {
        Optional<OTP> otp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        if (otp.isPresent() && 
            otp.get().getOtp().equals(otpValue) && 
            otp.get().getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(5))) {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                String token = UUID.randomUUID().toString();
                user.setResetPasswordToken(token);
                user.setResetPasswordExpires(new Date(System.currentTimeMillis() + 3600000));
                userRepository.save(user);
                return token;
            }
        }
        throw new RuntimeException("Invalid OTP sequence or email");
    }

    public void resetPassword(String token, String newPassword) {
        Optional<User> userOptional = userRepository.findByResetPasswordToken(token);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getResetPasswordExpires().before(new Date())) {
                throw new RuntimeException("Reset token has expired");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetPasswordToken(null);
            user.setResetPasswordExpires(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Invalid reset token");
        }
    }
}
