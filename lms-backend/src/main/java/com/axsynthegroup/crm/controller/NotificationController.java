package com.axsynthegroup.crm.controller;

import com.axsynthegroup.crm.model.Role;
import com.axsynthegroup.crm.model.entity.Notification;
import com.axsynthegroup.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','ACADEMIC_MANAGER','ACADEMIC_ADMIN','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Notification> create(@RequestBody Map<String, Object> body) {
        String title        = body.get("title").toString();
        String message      = body.get("message").toString();
        Role targetRole     = body.containsKey("targetRole") ? Role.valueOf(body.get("targetRole").toString()) : null;
        String targetUserIds= body.containsKey("targetUserIds") ? body.get("targetUserIds").toString() : null;
        Long createdById    = Long.valueOf(body.get("createdById").toString());

        return ResponseEntity.ok(
                notificationService.createNotification(title, message, targetRole, targetUserIds, createdById));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getAll(
            @RequestParam(required = false) Role role) {
        List<Notification> notifs = role != null
                ? notificationService.getNotificationsForRole(role)
                : notificationService.getAllNotifications();
        return ResponseEntity.ok(notifs);
    }
}
