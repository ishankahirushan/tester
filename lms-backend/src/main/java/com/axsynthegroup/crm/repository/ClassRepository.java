package com.axsynthegroup.crm.repository;

import com.axsynthegroup.crm.model.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findByAcademicManagerId(Long managerId);
}
