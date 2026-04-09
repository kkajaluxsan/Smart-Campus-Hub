package com.campus.hub.model;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** Campus index / registration number (students) */
    @Column(unique = true, length = 64)
    private String studentIndexNumber;

    /** Academic year of study, e.g. 3 for "Year 3" */
    private Integer academicYear;

    /** Semester 1 or 2 */
    private Integer semester;

    @Enumerated(EnumType.STRING)
    private Department department;
}
