package com.axsynthegroup.crm.repository;

import com.axsynthegroup.crm.model.AttendanceStatus;
import com.axsynthegroup.crm.model.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findBySchoolClassId(Long classId);
    List<Attendance> findBySchoolClassIdAndDate(Long classId, LocalDate date);
    Optional<Attendance> findByStudentIdAndSchoolClassIdAndDate(Long studentId, Long classId, LocalDate date);
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);
}
