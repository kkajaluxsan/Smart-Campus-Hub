package com.campus.hub.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    /** Null when the account only signs in with Google OAuth */
    @Column(nullable = true)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    /** Google "sub" claim; unique when present */
    @Column(unique = true, length = 128)
    private String oauthSubject;

    /** Campus index / registration number (students) */
    @Column(unique = true, length = 64)
    private String studentIndexNumber;

    /** Academic year of study, e.g. 3 for "Year 3" */
    private Integer academicYear;

    /** Semester 1 or 2 */
    private Integer semester;

    @Enumerated(EnumType.STRING)
    private Department department;

    /** False until email link is confirmed (LOCAL accounts only; Google OAuth is always verified) */
    @Column(nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    /** SHA-256 hex of verification token; cleared after verification */
    @Column(length = 64)
    private String emailVerificationTokenHash;

    private Instant emailVerificationExpiresAt;
}
