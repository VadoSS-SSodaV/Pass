package com.company.passmanagement.service;

import com.company.passmanagement.repository.PassRepository;
import com.company.passmanagement.dto.PassRequestDto;
import com.company.passmanagement.dto.PassResponseDto;
import com.company.passmanagement.entity.Pass;
import com.company.passmanagement.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PassService {

    private final PassRepository passRepository;

    @Transactional
    public PassResponseDto createPass(PassRequestDto requestDto, User user) {
        Pass pass = Pass.builder()
                .user(user)
                .type(requestDto.getType())
                .purpose(requestDto.getPurpose())
                .location(requestDto.getLocation())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .notes(requestDto.getNotes())
                .status(Pass.Status.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        Pass savedPass = passRepository.save(pass);
        return mapToResponseDto(savedPass);
    }

    public List<PassResponseDto> getUserPasses(Long userId) {
        return passRepository.findByUserIdOrderByRequestedAtDesc(userId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public PassResponseDto getPassById(Long id, User user) {
        Pass pass = passRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пропуск не знайдено"));

        if (!pass.getUser().getId().equals(user.getId()) &&
                !user.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Доступ заборонено");
        }

        return mapToResponseDto(pass);
    }

    @Transactional
    public void cancelPass(Long id, User user) {
        Pass pass = passRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пропуск не знайдено"));

        if (!pass.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Ви не можете скасувати чужий пропуск");
        }

        if (pass.getStatus() != Pass.Status.PENDING) {
            throw new RuntimeException("Можна скасувати тільки пропуски зі статусом PENDING");
        }

        pass.setStatus(Pass.Status.CANCELLED);
        passRepository.save(pass);
    }

    public List<PassResponseDto> getAllPasses() {
        return passRepository.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<PassResponseDto> getPassesByStatus(Pass.Status status) {
        return passRepository.findByStatusOrderByRequestedAtDesc(status)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PassResponseDto approvePass(Long id, User admin) {
        Pass pass = passRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пропуск не знайдено"));

        if (pass.getStatus() != Pass.Status.PENDING) {
            throw new RuntimeException("Можна схвалити тільки пропуски зі статусом PENDING");
        }

        pass.setStatus(Pass.Status.APPROVED);
        pass.setApprovedBy(admin);
        pass.setApprovedAt(LocalDateTime.now());

        Pass savedPass = passRepository.save(pass);
        return mapToResponseDto(savedPass);
    }

    @Transactional
    public PassResponseDto rejectPass(Long id, String reason, User admin) {
        Pass pass = passRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пропуск не знайдено"));

        if (pass.getStatus() != Pass.Status.PENDING) {
            throw new RuntimeException("Можна відхилити тільки пропуски зі статусом PENDING");
        }

        pass.setStatus(Pass.Status.REJECTED);
        pass.setRejectionReason(reason);
        pass.setApprovedBy(admin);
        pass.setApprovedAt(LocalDateTime.now());

        Pass savedPass = passRepository.save(pass);
        return mapToResponseDto(savedPass);
    }

    private PassResponseDto mapToResponseDto(Pass pass) {
        return PassResponseDto.builder()
                .id(pass.getId())
                .userId(pass.getUser().getId())
                .userName(pass.getUser().getFullName())
                .userEmail(pass.getUser().getEmail())
                .department(pass.getUser().getDepartment())
                .type(pass.getType())
                .purpose(pass.getPurpose())
                .location(pass.getLocation())
                .startDate(pass.getStartDate())
                .endDate(pass.getEndDate())
                .status(pass.getStatus())
                .requestedAt(pass.getRequestedAt())
                .approvedAt(pass.getApprovedAt())
                .approvedBy(pass.getApprovedBy() != null ? pass.getApprovedBy().getFullName() : null)
                .rejectionReason(pass.getRejectionReason())
                .notes(pass.getNotes())
                .build();
    }
}