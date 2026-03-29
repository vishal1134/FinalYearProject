package com.landregistry.backend.controller;

import com.landregistry.backend.dto.AuthResponse;
import com.landregistry.backend.dto.LoginRequest;
import com.landregistry.backend.dto.RegisterRequest;
import com.landregistry.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // DEMO ONLY: Simple Reset Password (In real app, use email tokens)
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody LoginRequest request) {
        authService.resetPassword(request.getEmail(), request.getPassword());
        return ResponseEntity.ok("Password reset successfully");
    }
}
