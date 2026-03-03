package com.axsynthegroup.crm.service;

import com.axsynthegroup.crm.model.entity.ActivityLog;
import com.axsynthegroup.crm.model.entity.User;
import com.axsynthegroup.crm.repository.ActivityLogRepository;
import com.axsynthegroup.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public void log(Long userId, String action, String context) {
        User user = userRepository.findById(userId).orElse(null);
        ActivityLog log = ActivityLog.builder()
                .user(user)
                .userName(user != null ? user.getName() : "Unknown")
                .action(action)
                .context(context)
                .build();
        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLog> getAllLogs(int page, int size) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }
}
