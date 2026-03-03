package com.axsynthegroup.crm.service;

import com.axsynthegroup.crm.model.Role;
import com.axsynthegroup.crm.model.entity.Notification;
import com.axsynthegroup.crm.model.entity.User;
import com.axsynthegroup.crm.repository.NotificationRepository;
import com.axsynthegroup.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public Notification createNotification(String title, String message,
                                           Role targetRole, String targetUserIds,
                                           Long createdById) {
        User creator = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .targetRole(targetRole)
                .targetUserIds(targetUserIds)
                .createdBy(creator)
                .build();

        Notification saved = notificationRepository.save(notification);
        activityLogService.log(createdById, "NOTIFICATION_SENT",
                "Title: " + title + " | Target: " + targetRole);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForRole(Role role) {
        return notificationRepository.findByTargetRole(role);
    }

    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }
}
