package com.axsynthegroup.crm.config;

import com.axsynthegroup.crm.model.Role;
import com.axsynthegroup.crm.model.SectionType;
import com.axsynthegroup.crm.model.entity.SchoolClass;
import com.axsynthegroup.crm.model.entity.Subject;
import com.axsynthegroup.crm.model.entity.User;
import com.axsynthegroup.crm.repository.ClassRepository;
import com.axsynthegroup.crm.repository.SubjectRepository;
import com.axsynthegroup.crm.repository.UserRepository;
import java.util.List;
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
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("Super Admin", "superadmin@lms.local", "Admin@123", Role.SUPER_ADMIN);
        seedUser("School Admin", "schooladmin@lms.local", "Admin@123", Role.SCHOOL_ADMIN);
        seedUser("Principal", "principal@lms.local", "Admin@123", Role.ACADEMIC_ADMIN);
        User manager = seedUser("Manager", "manager@lms.local", "Admin@123", Role.ACADEMIC_MANAGER);
        User teacher = seedUser("Teacher One", "teacher@lms.local", "Admin@123", Role.TEACHER);
        User student = seedUser("Student One", "student@lms.local", "Admin@123", Role.STUDENT);

        seedData(manager, teacher, student);
        log.info("✅ Default seed users and data created (if not already present)");
    }

    private void seedData(User manager, User teacher, User student) {
        if (classRepository.count() == 0) {
            SchoolClass cls = SchoolClass.builder()
                    .name("Grade 10-A")
                    .sectionType(SectionType.OL)
                    .academicManager(manager)
                    .students(List.of(student))
                    .build();
            classRepository.save(cls);

            Subject sub = Subject.builder()
                    .name("Mathematics")
                    .schoolClass(cls)
                    .teachers(List.of(teacher))
                    .weightingConfig("{\"ASSIGNMENT\": 20, \"QUIZ\": 20, \"EXAM\": 60}")
                    .build();
            subjectRepository.save(sub);
        }
    }

    private User seedUser(String name, String email, String password, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(role)
                    .isActive(true)
                    .build();
            return userRepository.save(user);
        });
    }
}
