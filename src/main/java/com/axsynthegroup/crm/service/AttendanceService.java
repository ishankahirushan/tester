package com.axsynthegroup.crm.service;

import com.axsynthegroup.crm.exception.ResourceNotFoundException;
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
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final ActivityLogService activityLogService;

    /**
     * Mark or update attendance for a student in a class on a given date.
     * Only called by in-charge teacher.
     */
    public Attendance markAttendance(Long studentId, Long classId, LocalDate date,
                                     AttendanceStatus status, Long recordedById) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        SchoolClass cls = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", classId));
        User recorder = userRepository.findById(recordedById)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", recordedById));

        Attendance att = attendanceRepository
                .findByStudentIdAndSchoolClassIdAndDate(studentId, classId, date)
                .orElse(Attendance.builder().student(student).schoolClass(cls).date(date).build());

        att.setStatus(status);
        att.setRecordedBy(recorder);
        Attendance saved = attendanceRepository.save(att);

        activityLogService.log(recordedById, "ATTENDANCE_MARKED",
                "Student: " + student.getName() + " | Class: " + cls.getName() + " | Status: " + status);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByClass(Long classId, LocalDate date) {
        if (date != null) {
            return attendanceRepository.findBySchoolClassIdAndDate(classId, date);
        }
        return attendanceRepository.findBySchoolClassId(classId);
    }

    @Transactional(readOnly = true)
    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getStudentAttendanceSummary(Long studentId) {
        long present = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        long absent  = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.ABSENT);
        long late    = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE);
        return Map.of("present", present, "absent", absent, "late", late, "total", present + absent + late);
    }
}
