package com.campus.hub.notification;

import com.campus.hub.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<NotificationDto> list() {
        var u = currentUserService.requireCurrentUser();
        return notificationService.listForUser(u.getId());
    }

    @PutMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable Long id) {
        var u = currentUserService.requireCurrentUser();
        notificationService.markRead(id, u.getId());
    }
}