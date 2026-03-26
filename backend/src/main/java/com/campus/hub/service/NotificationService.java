package com.campus.hub.service;

import com.campus.hub.dto.NotificationDto;
import com.campus.hub.model.Notification;
import com.campus.hub.model.NotificationType;
import com.campus.hub.model.User;
import com.campus.hub.exception.ApiException;
import com.campus.hub.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void notify(User user, String message, NotificationType type, String referenceType, Long referenceId) {
        Notification n = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .readFlag(false)
                .createdAt(Instant.now())
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!n.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your notification");
        }
        n.setReadFlag(true);
        notificationRepository.save(n);
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getMessage(),
                n.getType(),
                n.isReadFlag(),
                n.getCreatedAt(),
                n.getReferenceType(),
                n.getReferenceId()
        );
    }
}
