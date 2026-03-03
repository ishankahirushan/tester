package com.axsynthegroup.crm.service;

import com.axsynthegroup.crm.exception.ResourceNotFoundException;
import com.axsynthegroup.crm.model.entity.SchoolClass;
import com.axsynthegroup.crm.model.entity.Subject;
import com.axsynthegroup.crm.model.entity.Task;
import com.axsynthegroup.crm.model.entity.User;
import com.axsynthegroup.crm.model.TaskType;
import com.axsynthegroup.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Subject> getSubjectsByClass(Long classId) {
        return subjectRepository.findBySchoolClassId(classId);
    }

    @Transactional(readOnly = true)
    public List<Subject> getSubjectsByTeacher(Long teacherId) {
        return subjectRepository.findByTeacherId(teacherId);
    }

    public Subject createSubject(String name, Long classId, Boolean hasExam,
                                  String weightingConfig, Long createdById) {
        SchoolClass cls = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", classId));
        User creator = userRepository.findById(createdById)
                .orElseThrow(() -> new ResourceNotFoundException("User", createdById));

        Subject subject = Subject.builder()
                .name(name)
                .schoolClass(cls)
                .hasExam(hasExam)
                .weightingConfig(weightingConfig)
                .createdBy(creator)
                .build();

        Subject saved = subjectRepository.save(subject);
        activityLogService.log(createdById, "SUBJECT_CREATED", "Subject: " + name);
        return saved;
    }

    public void assignTeacher(Long subjectId, Long teacherId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", teacherId));

        if (!subject.getTeachers().contains(teacher)) {
            subject.getTeachers().add(teacher);
            subjectRepository.save(subject);
        }
    }

    public Task createTask(Long subjectId, String title, String description, TaskType type,
                            LocalDateTime deadline, BigDecimal maxMarks, Long teacherId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", teacherId));

        Task task = Task.builder()
                .subject(subject)
                .title(title)
                .description(description)
                .type(type)
                .deadline(deadline)
                .maxMarks(maxMarks != null ? maxMarks : BigDecimal.valueOf(100))
                .createdBy(teacher)
                .build();

        Task saved = taskRepository.save(task);
        activityLogService.log(teacherId, "TASK_CREATED",
                "Task: " + title + " | Subject: " + subject.getName());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksBySubject(Long subjectId) {
        return taskRepository.findBySubjectId(subjectId);
    }
}
