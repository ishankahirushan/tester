package com.axsynthegroup.crm.controller;

import com.axsynthegroup.crm.model.AttendanceStatus;
import com.axsynthegroup.crm.model.entity.Attendance;
import com.axsynthegroup.crm.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Attendance> markAttendance(@RequestBody Map<String, Object> body) {
        Long studentId   = Long.valueOf(body.get("studentId").toString());
        Long classId     = Long.valueOf(body.get("classId").toString());
        Long recordedById= Long.valueOf(body.get("recordedById").toString());
        LocalDate date   = LocalDate.parse(body.get("date").toString());
        AttendanceStatus status = AttendanceStatus.valueOf(body.get("status").toString());
        return ResponseEntity.ok(attendanceService.markAttendance(studentId, classId, date, status, recordedById));
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('TEACHER','ACADEMIC_MANAGER','ACADEMIC_ADMIN','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<Attendance>> getByClass(
            @PathVariable Long classId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByClass(classId, date));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER','ACADEMIC_MANAGER','ACADEMIC_ADMIN','SCHOOL_ADMIN','SUPER_ADMIN','STUDENT')")
    public ResponseEntity<List<Attendance>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId));
    }

    @GetMapping("/student/{studentId}/summary")
    @PreAuthorize("hasAnyRole('TEACHER','ACADEMIC_MANAGER','ACADEMIC_ADMIN','SCHOOL_ADMIN','SUPER_ADMIN','STUDENT')")
    public ResponseEntity<Map<String, Long>> getStudentSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceSummary(studentId));
    }
}
