package com.pharmachain.controller;

import com.pharmachain.dto.request.LoginRequest;
import com.pharmachain.dto.request.RegisterUserRequest;
import com.pharmachain.dto.response.ApiMessage;
import com.pharmachain.dto.response.AuthResponse;
import com.pharmachain.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Login and account management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Deliberately ADMIN-only: this is an internal manufacturing system, not a consumer app -
     * employees don't create their own login, an administrator provisions one for them.
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiMessage register(@Valid @RequestBody RegisterUserRequest request) {
        authService.register(request);
        return new ApiMessage("Account '" + request.username() + "' created with role " + request.role());
    }
}
