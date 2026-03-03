package com.axsynthegroup.crm.controller;

import com.axsynthegroup.crm.dto.MarkDto;
import com.axsynthegroup.crm.service.MarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
@RequiredArgsConstructor
public class MarkController {

    private final MarkService markService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<MarkDto> saveMark(
            @RequestBody MarkDto dto,
            Authentication auth) {
        Long teacherId = (Long) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) auth).getDetails();
        return ResponseEntity.ok(markService.saveMark(dto, teacherId));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER','ACADEMIC_ADMIN','ACADEMIC_MANAGER','SCHOOL_ADMIN','SUPER_ADMIN','STUDENT')")
    public ResponseEntity<List<MarkDto>> getMarksByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(markService.getMarksByStudent(studentId));
    }

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('TEACHER','ACADEMIC_ADMIN','ACADEMIC_MANAGER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<MarkDto>> getMarksByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(markService.getMarksByTask(taskId));
    }
}
