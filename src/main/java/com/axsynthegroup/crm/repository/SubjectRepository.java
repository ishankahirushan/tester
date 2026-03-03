package com.axsynthegroup.crm.repository;

import com.axsynthegroup.crm.model.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySchoolClassId(Long classId);

    @Query("SELECT s FROM Subject s JOIN s.teachers t WHERE t.id = :teacherId")
    List<Subject> findByTeacherId(Long teacherId);
}
