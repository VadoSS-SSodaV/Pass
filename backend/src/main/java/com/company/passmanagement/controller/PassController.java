package com.company.passmanagement.controller;

import com.company.passmanagement.dto.PassRequestDto;
import com.company.passmanagement.dto.PassResponseDto;
import com.company.passmanagement.service.PassService;
import com.company.passmanagement.entity.Pass;
import com.company.passmanagement.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/passes")
@RequiredArgsConstructor
public class PassController {

    private final PassService passService;

    @PostMapping
    public ResponseEntity<PassResponseDto> createPass(
            @Valid @RequestBody PassRequestDto requestDto,
            @AuthenticationPrincipal User user
    ) {
        PassResponseDto response = passService.createPass(requestDto, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-passes")
    public ResponseEntity<List<PassResponseDto>> getMyPasses(@AuthenticationPrincipal User user) {
        List<PassResponseDto> passes = passService.getUserPasses(user.getId());
        return ResponseEntity.ok(passes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PassResponseDto> getPassById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        PassResponseDto pass = passService.getPassById(id, user);
        return ResponseEntity.ok(pass);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelPass(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        passService.cancelPass(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PassResponseDto>> getAllPasses() {
        List<PassResponseDto> passes = passService.getAllPasses();
        return ResponseEntity.ok(passes);
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PassResponseDto>> getPendingPasses() {
        List<PassResponseDto> passes = passService.getPassesByStatus(Pass.Status.PENDING);
        return ResponseEntity.ok(passes);
    }

    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PassResponseDto> approvePass(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin
    ) {
        PassResponseDto pass = passService.approvePass(id, admin);
        return ResponseEntity.ok(pass);
    }

    @PutMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PassResponseDto> rejectPass(
            @PathVariable Long id,
            @RequestParam String reason,
            @AuthenticationPrincipal User admin
    ) {
        PassResponseDto pass = passService.rejectPass(id, reason, admin);
        return ResponseEntity.ok(pass);
    }
}