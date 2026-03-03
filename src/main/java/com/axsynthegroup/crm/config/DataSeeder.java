package com.axsynthegroup.crm.config;

import com.axsynthegroup.crm.model.Role;
import com.axsynthegroup.crm.model.entity.User;
import com.axsynthegroup.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("Super Admin", "superadmin@lms.local",  "Admin@123", Role.SUPER_ADMIN);
        seedUser("School Admin", "schooladmin@lms.local", "Admin@123", Role.SCHOOL_ADMIN);
        seedUser("Principal",    "principal@lms.local",   "Admin@123", Role.ACADEMIC_ADMIN);
        seedUser("Manager",      "manager@lms.local",     "Admin@123", Role.ACADEMIC_MANAGER);
        seedUser("Teacher One",  "teacher@lms.local",     "Admin@123", Role.TEACHER);
        seedUser("Student One",  "student@lms.local",     "Admin@123", Role.STUDENT);
        log.info("✅ Default seed users created (if not already present)");
    }

    private void seedUser(String name, String email, String password, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(role)
                    .isActive(true)
                    .build();
            userRepository.save(user);
        }
    }
}
