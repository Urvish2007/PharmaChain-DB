package com.pharmachain.service;

import com.pharmachain.dto.request.LoginRequest;
import com.pharmachain.dto.request.RegisterUserRequest;
import com.pharmachain.dto.response.AuthResponse;
import com.pharmachain.entity.AppUser;
import com.pharmachain.repository.AppUserRepository;
import com.pharmachain.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Delegates credential checking to Spring Security's AuthenticationManager (which in turn
     * uses AppUserDetailsService + the BCrypt password encoder) rather than comparing password
     * hashes by hand here - that's what the framework is for.
     */
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new BadCredentialsException("Invalid username or password");
        }

        AppUser user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return AuthResponse.bearer(token, user.getUsername(), user.getRole(), jwtService.expirationSeconds());
    }

    @Transactional
    public void register(RegisterUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new com.pharmachain.exception.BusinessRuleViolationException(
                    "Username '" + request.username() + "' is already taken");
        }
        AppUser user = AppUser.builder()
                .username(request.username())
                .passwordHash(passwordEncoder.encode(request.password()))
                .empId(request.empId())
                .role(request.role())
                .enabled(Boolean.TRUE)
                .build();
        userRepository.save(user);
    }
}
