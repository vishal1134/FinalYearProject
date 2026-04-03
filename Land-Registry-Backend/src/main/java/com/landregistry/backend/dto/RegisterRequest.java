package com.landregistry.backend.dto;

import com.landregistry.backend.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private Role role;
    private String nationalId;
}
