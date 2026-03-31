package com.farmersmarket.backend.config;

import com.farmersmarket.backend.model.User;
import com.farmersmarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@market.com";
        userRepository.findByEmail(adminEmail).ifPresentOrElse(
            user -> {
                user.setRole("admin");
                user.setApproved(true);
                userRepository.save(user);
                System.out.println("Admin User Updated: " + adminEmail);
            },
            () -> {
                User admin = User.builder()
                        .name("System Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("123"))
                        .role("admin")
                        .isApproved(true)
                        .status("Active")
                        .build();
                userRepository.save(admin);
                System.out.println("Admin User Created: " + adminEmail);
            }
        );
    }
}
