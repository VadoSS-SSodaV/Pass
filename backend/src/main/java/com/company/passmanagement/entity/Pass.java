package com.company.passmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "passes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PassType type;

    @Column(nullable = false)
    private String purpose;

    private String location;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime approvedAt;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private String rejectionReason;

    @Column(length = 1000)
    private String notes;

    public enum PassType {
        TEMPORARY_PASS,      // Тимчасовий пропуск
        PERMANENT_PASS,      // Постійний пропуск
        VEHICLE_PASS,        // Пропуск для транспорту
        VISITOR_PASS,        // Пропуск для відвідувача
        EQUIPMENT_PASS,      // Дозвіл на винос обладнання
        AFTER_HOURS_ACCESS   // Доступ після робочих годин
    }

    public enum Status {
        PENDING,    // Очікує розгляду
        APPROVED,   // Схвалено
        REJECTED,   // Відхилено
        EXPIRED,    // Термін дії минув
        CANCELLED   // Скасовано
    }
}