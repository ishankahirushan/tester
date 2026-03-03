package com.axsynthegroup.crm.service;

import com.axsynthegroup.crm.exception.ResourceNotFoundException;
import com.axsynthegroup.crm.model.SectionType;
import com.axsynthegroup.crm.model.entity.SchoolClass;
import com.axsynthegroup.crm.model.entity.User;
import com.axsynthegroup.crm.repository.ClassRepository;
import com.axsynthegroup.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public List<SchoolClass> getAllClasses() {
        return classRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<SchoolClass> getClassesByManager(Long managerId) {
        return classRepository.findByAcademicManagerId(managerId);
    }

    public SchoolClass createClass(String name, SectionType sectionType, Long managerId, Long createdById) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager", managerId));

        SchoolClass cls = SchoolClass.builder()
                .name(name)
                .sectionType(sectionType)
                .academicManager(manager)
                .build();

        SchoolClass saved = classRepository.save(cls);
        activityLogService.log(createdById, "CLASS_CREATED", "Class: " + name);
        return saved;
    }

    public void enrollStudent(Long classId, Long studentId, Long actionById) {
        SchoolClass cls = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", classId));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        if (!cls.getStudents().contains(student)) {
            cls.getStudents().add(student);
            classRepository.save(cls);
            activityLogService.log(actionById, "STUDENT_ENROLLED", 
                "Student: " + student.getName() + " enrolled in Class: " + cls.getName());
        }
    }

    public SchoolClass updateClass(Long id, String name, SectionType sectionType, Long managerId, Long updatedById) {
        SchoolClass cls = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", id));
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager", managerId));

        cls.setName(name);
        cls.setSectionType(sectionType);
        cls.setAcademicManager(manager);

        SchoolClass saved = classRepository.save(cls);
        activityLogService.log(updatedById, "CLASS_UPDATED", "Class: " + name);
        return saved;
    }

    public void deleteClass(Long id, Long deletedById) {
        SchoolClass cls = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", id));
        // Check if class has students or subjects - usually we'd prevent delete or cascade
        // For simplicity, we'll just delete if empty or allowed by DB constraints
        classRepository.delete(cls);
        activityLogService.log(deletedById, "CLASS_DELETED", "Class: " + cls.getName());
    }

    public void removeStudent(Long classId, Long studentId, Long actionById) {
        SchoolClass cls = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", classId));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        if (cls.getStudents().contains(student)) {
            cls.getStudents().remove(student);
            classRepository.save(cls);
            activityLogService.log(actionById, "STUDENT_REMOVED", 
                "Student: " + student.getName() + " removed from Class: " + cls.getName());
        }
    }
}
