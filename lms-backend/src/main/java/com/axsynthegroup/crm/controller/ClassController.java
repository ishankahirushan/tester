package com.axsynthegroup.crm.controller;

import com.axsynthegroup.crm.model.SectionType;
import com.axsynthegroup.crm.model.entity.SchoolClass;
import com.axsynthegroup.crm.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SchoolClass>> getAll(@RequestParam(required = false) Long managerId) {
        if (managerId != null) return ResponseEntity.ok(classService.getClassesByManager(managerId));
        return ResponseEntity.ok(classService.getAllClasses());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<SchoolClass> create(@RequestBody Map<String, Object> body) {
        SchoolClass cls = classService.createClass(
                body.get("name").toString(),
                SectionType.valueOf(body.get("sectionType").toString()),
                Long.valueOf(body.get("managerId").toString()),
                Long.valueOf(body.get("createdById").toString())
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(cls);
    }

    @PostMapping("/{classId}/enroll/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN','ACADEMIC_ADMIN')")
    public ResponseEntity<Map<String, String>> enroll(
            @PathVariable Long classId, 
            @PathVariable Long studentId,
            @RequestBody Map<String, Long> body) {
        classService.enrollStudent(classId, studentId, body.get("actionById"));
        return ResponseEntity.ok(Map.of("message", "Student enrolled successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<SchoolClass> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        SchoolClass cls = classService.updateClass(
                id,
                body.get("name").toString(),
                SectionType.valueOf(body.get("sectionType").toString()),
                Long.valueOf(body.get("managerId").toString()),
                Long.valueOf(body.get("updatedById").toString())
        );
        return ResponseEntity.ok(cls);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long deletedById) {
        classService.deleteClass(id, deletedById);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{classId}/remove/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN','ACADEMIC_ADMIN')")
    public ResponseEntity<Void> removeStudent(
            @PathVariable Long classId,
            @PathVariable Long studentId,
            @RequestParam Long actionById) {
        classService.removeStudent(classId, studentId, actionById);
        return ResponseEntity.noContent().build();
    }
}
