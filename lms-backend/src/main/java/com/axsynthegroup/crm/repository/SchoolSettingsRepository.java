package com.axsynthegroup.crm.repository;

import com.axsynthegroup.crm.model.entity.SchoolSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchoolSettingsRepository extends JpaRepository<SchoolSettings, Long> {
    Optional<SchoolSettings> findBySchoolName(String schoolName);

    // There should typically only be one settings row
    default Optional<SchoolSettings> findMainSettings() {
        return findAll().stream().findFirst();
    }
}
