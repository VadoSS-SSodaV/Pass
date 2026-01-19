package com.company.passmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequestDto {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
}