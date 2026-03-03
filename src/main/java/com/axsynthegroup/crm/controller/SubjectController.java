package com.axsynthegroup.crm.controller;

import com.axsynthegroup.crm.model.TaskType;
import com.axsynthegroup.crm.model.entity.Subject;
import com.axsynthegroup.crm.model.entity.Task;
import com.axsynthegroup.crm.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Subject>> getAll(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long teacherId) {
        if (classId != null) return ResponseEntity.ok(subjectService.getSubjectsByClass(classId));
        if (teacherId != null) return ResponseEntity.ok(subjectService.getSubjectsByTeacher(teacherId));
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Subject> create(@RequestBody Map<String, Object> body) {
        Subject s = subjectService.createSubject(
                body.get("name").toString(),
                Long.valueOf(body.get("classId").toString()),
                Boolean.valueOf(body.getOrDefault("hasExam", false).toString()),
                body.containsKey("weightingConfig") ? body.get("weightingConfig").toString() : null,
                Long.valueOf(body.get("createdById").toString())
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(s);
    }

    @PostMapping("/{subjectId}/assign-teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> assignTeacher(
            @PathVariable Long subjectId, @PathVariable Long teacherId) {
        subjectService.assignTeacher(subjectId, teacherId);
        return ResponseEntity.ok(Map.of("message", "Teacher assigned successfully"));
    }

    @GetMapping("/{subjectId}/tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getTasks(@PathVariable Long subjectId) {
        return ResponseEntity.ok(subjectService.getTasksBySubject(subjectId));
    }

    @PostMapping("/{subjectId}/tasks")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Task> createTask(
            @PathVariable Long subjectId,
            @RequestBody Map<String, Object> body) {
        Task task = subjectService.createTask(
                subjectId,
                body.get("title").toString(),
                body.containsKey("description") ? body.get("description").toString() : null,
                TaskType.valueOf(body.get("type").toString()),
                body.containsKey("deadline") ? LocalDateTime.parse(body.get("deadline").toString()) : null,
                body.containsKey("maxMarks") ? new BigDecimal(body.get("maxMarks").toString()) : null,
                Long.valueOf(body.get("teacherId").toString())
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }
}
