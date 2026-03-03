package com.axsynthegroup.crm.controller;

import com.axsynthegroup.crm.model.entity.SchoolSettings;
import com.axsynthegroup.crm.service.SchoolSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SchoolSettingsController {

    private final SchoolSettingsService settingsService;

    @GetMapping
    public ResponseEntity<SchoolSettings> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<SchoolSettings> updateSettings(@RequestBody SchoolSettings settings) {
        return ResponseEntity.ok(settingsService.updateSettings(settings));
    }
}
