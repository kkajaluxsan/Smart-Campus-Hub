package com.campus.hub.service;

import com.campus.hub.dto.AuthResponse;
import com.campus.hub.dto.LoginRequest;
import com.campus.hub.dto.RegisterRequest;
import com.campus.hub.dto.UserProfileDto;
import com.campus.hub.exception.ApiException;
import com.campus.hub.model.Role;
import com.campus.hub.model.User;
import com.campus.hub.repository.UserRepository;
import com.campus.hub.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (userRepository.existsByStudentIndexNumber(req.studentIndexNumber().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "This index number is already registered");
        }
        User u = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .role(Role.USER)
                .studentIndexNumber(req.studentIndexNumber().trim())
                .academicYear(req.academicYear())
                .semester(req.semester())
                .department(req.department())
                .build();
        userRepository.save(u);
        String token = jwtTokenProvider.createToken(u.getEmail(), u.getId(), u.getRole());
        return UserProfileMapper.toAuthResponse(u, token);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User u = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), u.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = jwtTokenProvider.createToken(u.getEmail(), u.getId(), u.getRole());
        return UserProfileMapper.toAuthResponse(u, token);
    }

    @Transactional(readOnly = true)
    public UserProfileDto currentProfile(User user) {
        return UserProfileMapper.toProfileDto(user);
    }
}
