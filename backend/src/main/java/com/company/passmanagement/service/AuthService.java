package com.company.passmanagement.service;

import com.company.passmanagement.dto.AuthRequestDto;
import com.company.passmanagement.dto.AuthResponseDto;
import com.company.passmanagement.dto.RegisterRequestDto;
import com.company.passmanagement.entity.User;
import com.company.passmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Користувач з таким логіном вже існує");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Користувач з таким email вже існує");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .department(request.getDepartment())
                .role(User.Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return AuthResponseDto.builder()
                .token(token)
                .user(mapToUserDto(savedUser))
                .build();
    }

    public AuthResponseDto login(AuthRequestDto request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Користувача не знайдено"));

        String token = jwtService.generateToken(user);

        return AuthResponseDto.builder()
                .token(token)
                .user(mapToUserDto(user))
                .build();
    }

    private AuthResponseDto.UserDto mapToUserDto(User user) {
        return AuthResponseDto.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .role(user.getRole())
                .build();
    }
}