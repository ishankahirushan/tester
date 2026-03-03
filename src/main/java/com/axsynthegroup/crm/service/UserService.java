package com.axsynthegroup.crm.service;

import com.axsynthegroup.crm.dto.UserDto;
import com.axsynthegroup.crm.exception.ResourceNotFoundException;
import com.axsynthegroup.crm.model.Role;
import com.axsynthegroup.crm.model.entity.User;
import com.axsynthegroup.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<UserDto> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return toDto(findOrThrow(id));
    }

    public UserDto createUser(UserDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered: " + dto.getEmail());
        }
        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .mobile(dto.getMobile())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .contactInfo(dto.getContactInfo())
                .isActive(true)
                .build();
        return toDto(userRepository.save(user));
    }

    public UserDto updateUser(Long id, UserDto dto) {
        User user = findOrThrow(id);
        user.setName(dto.getName());
        user.setMobile(dto.getMobile());
        user.setContactInfo(dto.getContactInfo());
        if (dto.getProfileImagePath() != null) {
            user.setProfileImagePath(dto.getProfileImagePath());
        }
        if (dto.getIsActive() != null) {
            user.setIsActive(dto.getIsActive());
        }
        return toDto(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = findOrThrow(id);
        user.setIsActive(false); // Soft delete
        userRepository.save(user);
    }

    public void resetPassword(Long id, String newPassword) {
        User user = findOrThrow(id);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole())
                .profileImagePath(user.getProfileImagePath())
                .contactInfo(user.getContactInfo())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
