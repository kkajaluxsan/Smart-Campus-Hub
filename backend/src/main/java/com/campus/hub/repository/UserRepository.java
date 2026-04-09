package com.campus.hub.repository;

import com.campus.hub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByOauthSubject(String oauthSubject);

    boolean existsByEmail(String email);

    boolean existsByStudentIndexNumber(String studentIndexNumber);

    boolean existsByStudentIndexNumberAndIdNot(String studentIndexNumber, Long id);

    Optional<User> findByEmailVerificationTokenHash(String emailVerificationTokenHash);
}
