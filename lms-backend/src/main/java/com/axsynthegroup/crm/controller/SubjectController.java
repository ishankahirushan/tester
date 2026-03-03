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
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long studentId) {
        if (classId != null)
            return ResponseEntity.ok(subjectService.getSubjectsByClass(classId));
        if (teacherId != null)
            return ResponseEntity.ok(subjectService.getSubjectsByTeacher(teacherId));
        if (studentId != null)
            return ResponseEntity.ok(subjectService.getSubjectsByStudent(studentId));
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Subject> create(@RequestBody Map<String, Object> body) {
        Subject s = subjectService.createSubject(
                body.get("name").toString(),
                parseLong(body.get("classId")),
                Boolean.valueOf(body.getOrDefault("hasExam", false).toString()),
                body.containsKey("weightingConfig") ? body.get("weightingConfig").toString() : null,
                parseLong(body.get("createdById")));
        return ResponseEntity.status(HttpStatus.CREATED).body(s);
    }

    private Long parseLong(Object o) {
        if (o == null)
            return null;
        if (o instanceof Number)
            return ((Number) o).longValue();
        return Long.valueOf(o.toString());
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
                Long.valueOf(body.get("teacherId").toString()));
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Subject> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Subject s = subjectService.updateSubject(
                id,
                body.get("name").toString(),
                parseLong(body.get("classId")),
                Boolean.valueOf(body.getOrDefault("hasExam", false).toString()),
                body.containsKey("weightingConfig") ? body.get("weightingConfig").toString() : null,
                parseLong(body.get("updatedById")));
        return ResponseEntity.ok(s);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long deletedById) {
        subjectService.deleteSubject(id, deletedById);
        return ResponseEntity.noContent().build();
    }
}
