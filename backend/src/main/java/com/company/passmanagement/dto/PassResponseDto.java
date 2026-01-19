package com.company.passmanagement.dto;

import com.company.passmanagement.entity.Pass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassResponseDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String department;
    private Pass.PassType type;
    private String purpose;
    private String location;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Pass.Status status;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private String approvedBy;
    private String rejectionReason;
    private String notes;
}