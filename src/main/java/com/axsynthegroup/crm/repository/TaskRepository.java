package com.axsynthegroup.crm.repository;

import com.axsynthegroup.crm.model.TaskType;
import com.axsynthegroup.crm.model.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findBySubjectId(Long subjectId);
    List<Task> findBySubjectIdAndType(Long subjectId, TaskType type);
    List<Task> findByCreatedById(Long teacherId);
}
