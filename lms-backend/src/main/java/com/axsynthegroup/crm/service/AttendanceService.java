package com.axsynthegroup.crm.service;

import com.axsynthegroup.crm.model.AttendanceStatus;
import com.axsynthegroup.crm.model.entity.Attendance;
import com.axsynthegroup.crm.model.entity.SchoolClass;
import com.axsynthegroup.crm.model.entity.User;
import com.axsynthegroup.crm.repository.AttendanceRepository;
import com.axsynthegroup.crm.repository.ClassRepository;
import com.axsynthegroup.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;

    public List<Attendance> getAttendanceByClassAndDate(Long classId, LocalDate date) {
        return attendanceRepository.findBySchoolClassIdAndDate(classId, date);
    }

    public void recordAttendance(Long classId, LocalDate date, List<Map<String, Object>> attendanceData,
            Long recordedById) {
        SchoolClass cls = classRepository.findById(classId).orElseThrow();
        User recorder = userRepository.findById(recordedById).orElseThrow();

        for (Map<String, Object> data : attendanceData) {
            Long studentId = Long.valueOf(data.get("studentId").toString());
            AttendanceStatus status = AttendanceStatus.valueOf(data.get("status").toString());
            User student = userRepository.findById(studentId).orElseThrow();

            Attendance attendance = attendanceRepository
                    .findByStudentIdAndSchoolClassIdAndDate(studentId, classId, date)
                    .orElse(Attendance.builder().student(student).schoolClass(cls).date(date).build());

            attendance.setStatus(status);
            attendance.setRecordedBy(recorder);
            attendanceRepository.save(attendance);
        }
    }

    public Map<String, Object> getSchoolWideAttendanceStats() {
        LocalDate today = LocalDate.now();
        List<Attendance> todayRecords = attendanceRepository.findAll().stream()
                .filter(a -> a.getDate().equals(today))
                .toList();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", todayRecords.size());
        stats.put("present", todayRecords.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count());
        stats.put("absent", todayRecords.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count());
        stats.put("late", todayRecords.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count());

        return stats;
    }
}
