package com.farmersmarket.backend.service;

import com.farmersmarket.backend.model.User;
import com.farmersmarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));

        System.out.println("DEBUG: Authenticating " + user.getEmail() + " (role: " + user.getRole() + ", approved: " + user.isApproved() + ")");
        
        java.util.List<org.springframework.security.core.GrantedAuthority> authorities;
        if (user.isApproved() || "admin".equalsIgnoreCase(user.getRole())) {
            authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()));
        } else {
            authorities = Collections.emptyList();
        }
        
        System.out.println("DEBUG: Authorities granted: " + authorities);

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}
