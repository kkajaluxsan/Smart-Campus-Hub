package com.campus.hub.config;

import com.campus.hub.model.Department;
import com.campus.hub.model.Role;
import com.campus.hub.model.Seat;
import com.campus.hub.model.User;
import com.campus.hub.resource.CampusResource;
import com.campus.hub.resource.CampusResourceRepository;
import com.campus.hub.resource.ResourceStatus;
import com.campus.hub.resource.ResourceType;
import com.campus.hub.repository.SeatRepository;
import com.campus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final CampusResourceRepository resourceRepository;
    private final SeatRepository seatRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seed() {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }
            User admin = User.builder()
                    .email("admin@campus.edu")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Campus Admin")
                    .role(Role.ADMIN)
                    .emailVerified(true)
                    .build();
            User tech = User.builder()
                    .email("tech@campus.edu")
                    .password(passwordEncoder.encode("tech123"))
                    .fullName("Jane Technician")
                    .role(Role.TECHNICIAN)
                    .emailVerified(true)
                    .build();
            User user = User.builder()
                    .email("user@campus.edu")
                    .password(passwordEncoder.encode("user123"))
                    .fullName("Alex Student")
                    .role(Role.USER)
                    .emailVerified(true)
                    .studentIndexNumber("STU2024001")
                    .academicYear(2)
                    .semester(1)
                    .department(Department.IT)
                    .build();
            userRepository.save(admin);
            userRepository.save(tech);
            userRepository.save(user);

            CampusResource room = CampusResource.builder()
                    .name("Seminar Room 101")
                    .type(ResourceType.ROOM)
                    .capacity(30)
                    .location("Building A, Floor 1")
                    .status(ResourceStatus.AVAILABLE)
                    .build();
            CampusResource lab = CampusResource.builder()
                    .name("CS Lab 3")
                    .type(ResourceType.LAB)
                    .capacity(24)
                    .location("Building B, Floor 2")
                    .status(ResourceStatus.AVAILABLE)
                    .build();
            CampusResource hall = CampusResource.builder()
                    .name("Grand Auditorium")
                    .type(ResourceType.AUDITORIUM)
                    .capacity(120)
                    .location("Building C")
                    .status(ResourceStatus.AVAILABLE)
                    .build();
            resourceRepository.save(room);
            resourceRepository.save(lab);
            hall = resourceRepository.save(hall);

            String[] rows = {"A", "B", "C", "D", "E"};
            for (String r : rows) {
                for (int n = 1; n <= 8; n++) {
                    Seat s = Seat.builder()
                            .resource(hall)
                            .seatLabel(r + n)
                            .build();
                    seatRepository.save(s);
                }
            }
        };
    }
}
