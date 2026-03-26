package com.campus.hub.controller;

import com.campus.hub.dto.AuditLogDto;
import com.campus.hub.model.AuditLog;
import com.campus.hub.repository.AuditLogRepository;
import com.campus.hub.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLogDto> list() {
        currentUserService.requireCurrentUser();
        return auditLogRepository.findTop500ByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    private AuditLogDto toDto(AuditLog a) {
        return new AuditLogDto(
                a.getId(),
                a.getUser() != null ? a.getUser().getId() : null,
                a.getUser() != null ? a.getUser().getEmail() : null,
                a.getAction(),
                a.getEntityType(),
                a.getEntityId(),
                a.getDetails(),
                a.getCreatedAt()
        );
    }
}
