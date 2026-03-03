package com.axsynthegroup.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MarkDto {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private Long studentId;
    private String studentName;
    @NotBlank(message = "Marks are required")
    private BigDecimal marksObtained;
    private BigDecimal maxMarks;
    private BigDecimal percentageScore;
    private BigDecimal gpa;
    private LocalDateTime updatedAt;
}
