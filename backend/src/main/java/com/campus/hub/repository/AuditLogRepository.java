package com.campus.hub.repository;

import com.campus.hub.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop500ByOrderByCreatedAtDesc();
}
