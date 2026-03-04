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
    public ResponseEntity<List<SchoolClass>> getAll(
            @RequestParam(name = "managerId", required = false) Long managerId) {
        if (managerId != null)
            return ResponseEntity.ok(classService.getClassesByManager(managerId));
        return ResponseEntity.ok(classService.getAllClasses());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<SchoolClass> create(@RequestBody Map<String, Object> body) {
        SchoolClass cls = classService.createClass(
                body.get("name").toString(),
                SectionType.valueOf(body.get("sectionType").toString()),
                parseLong(body.get("managerId")),
                parseLong(body.get("createdById")));
        return ResponseEntity.status(HttpStatus.CREATED).body(cls);
    }

    @PostMapping("/{classId}/enroll/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN','ACADEMIC_ADMIN')")
    public ResponseEntity<Map<String, String>> enroll(
            @PathVariable(name = "classId") Long classId,
            @PathVariable(name = "studentId") Long studentId,
            @RequestBody Map<String, Object> body) {
        classService.enrollStudent(classId, studentId, parseLong(body.get("actionById")));
        return ResponseEntity.ok(Map.of("message", "Student enrolled successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<SchoolClass> update(
            @PathVariable(name = "id") Long id,
            @RequestBody Map<String, Object> body) {
        SchoolClass cls = classService.updateClass(
                id,
                body.get("name").toString(),
                SectionType.valueOf(body.get("sectionType").toString()),
                parseLong(body.get("managerId")),
                parseLong(body.get("updatedById")));
        return ResponseEntity.ok(cls);
    }

    private Long parseLong(Object o) {
        if (o == null || o.toString().isEmpty())
            return null;
        if (o instanceof Number)
            return ((Number) o).longValue();
        try {
            return Long.valueOf(o.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "deletedById") Long deletedById) {
        classService.deleteClass(id, deletedById);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{classId}/remove/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN','ACADEMIC_ADMIN')")
    public ResponseEntity<Void> removeStudent(
            @PathVariable(name = "classId") Long classId,
            @PathVariable(name = "studentId") Long studentId,
            @RequestParam(name = "actionById") Long actionById) {
        classService.removeStudent(classId, studentId, actionById);
        return ResponseEntity.noContent().build();
    }
}
