package com.axsynthegroup.crm.repository;

import com.axsynthegroup.crm.model.Role;
import com.axsynthegroup.crm.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByIsActive(Boolean isActive);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM SchoolClass c JOIN c.students u WHERE c.id = :classId")
    List<User> findStudentsByClassId(Long classId);
}
