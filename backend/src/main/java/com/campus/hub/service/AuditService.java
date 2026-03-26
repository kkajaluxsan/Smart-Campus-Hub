package com.campus.hub.service;

import com.campus.hub.model.AuditLog;
import com.campus.hub.model.User;
import com.campus.hub.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(User user, String action, String entityType, Long entityId, String details) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .createdAt(Instant.now())
                .build();
        auditLogRepository.save(log);
    }
}
