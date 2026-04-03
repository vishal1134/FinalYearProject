package com.landregistry.backend.dto;

import com.landregistry.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String name;
    private Role role;
    private String userId;
}
