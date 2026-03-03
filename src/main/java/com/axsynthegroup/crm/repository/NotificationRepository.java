package com.axsynthegroup.crm.repository;

import com.axsynthegroup.crm.model.Role;
import com.axsynthegroup.crm.model.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRole(Role role);
    List<Notification> findByCreatedById(Long userId);
    List<Notification> findAllByOrderByCreatedAtDesc();
}
