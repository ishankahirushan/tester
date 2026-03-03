package com.axsynthegroup.crm.service;

import com.axsynthegroup.crm.model.entity.SchoolSettings;
import com.axsynthegroup.crm.repository.SchoolSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SchoolSettingsService {

    private final SchoolSettingsRepository repository;

    public SchoolSettings getSettings() {
        return repository.findAll().stream().findFirst().orElseGet(this::initDefault);
    }

    public SchoolSettings updateSettings(SchoolSettings newSettings) {
        SchoolSettings current = getSettings();
        current.setSchoolName(newSettings.getSchoolName());
        current.setAddress(newSettings.getAddress());
        current.setPhone(newSettings.getPhone());
        current.setEmail(newSettings.getEmail());
        current.setCurrentAcademicYear(newSettings.getCurrentAcademicYear());
        current.setCurrentTerm(newSettings.getCurrentTerm());
        current.setLogoPath(newSettings.getLogoPath());
        current.setMotto(newSettings.getMotto());
        return repository.save(current);
    }

    private SchoolSettings initDefault() {
        SchoolSettings s = SchoolSettings.builder()
                .schoolName("AxsyntheGroup School LMS")
                .currentAcademicYear("2026")
                .currentTerm("Term 1")
                .build();
        return repository.save(s);
    }
}
