package com.company.passmanagement.dto;

import com.company.passmanagement.entity.Pass;
import com.company.passmanagement.entity.User;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PassRequestDto {
    @NotNull
    private Pass.PassType type;

    @NotBlank
    private String purpose;

    private String location;

    @NotNull
    @Future
    private LocalDateTime startDate;

    @NotNull
    @Future
    private LocalDateTime endDate;

    private String notes;
}