package com.axsynthegroup.crm.dto;

import com.axsynthegroup.crm.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDto {
    private Long id;
    @NotBlank private String name;
    @Email @NotBlank private String email;
    private String mobile;
    private String password; // only for create requests; never returned in responses
    private Role role;
    private String profileImagePath;
    private String contactInfo;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
