package com.axsynthegroup.crm.repository;

import com.axsynthegroup.crm.model.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentId(Long studentId);
    List<Mark> findByTaskId(Long taskId);
    Optional<Mark> findByTaskIdAndStudentId(Long taskId, Long studentId);

    @Query("SELECT AVG(m.marksObtained) FROM Mark m WHERE m.task.subject.id = :subjectId AND m.student.id = :studentId")
    Optional<BigDecimal> findAverageMarksBySubjectAndStudent(Long subjectId, Long studentId);

    @Query("SELECT AVG(m.marksObtained) FROM Mark m WHERE m.task.id = :taskId")
    Optional<BigDecimal> findAverageMarksByTask(Long taskId);
}
