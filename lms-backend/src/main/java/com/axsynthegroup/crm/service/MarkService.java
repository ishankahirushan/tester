package com.axsynthegroup.crm.service;

import com.axsynthegroup.crm.dto.MarkDto;
import com.axsynthegroup.crm.exception.ResourceNotFoundException;
import com.axsynthegroup.crm.model.entity.Mark;
import com.axsynthegroup.crm.model.entity.Task;
import com.axsynthegroup.crm.model.entity.User;
import com.axsynthegroup.crm.repository.MarkRepository;
import com.axsynthegroup.crm.repository.TaskRepository;
import com.axsynthegroup.crm.repository.UserRepository;
import com.axsynthegroup.crm.util.GpaCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MarkService {

    private final MarkRepository markRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final GpaCalculator gpaCalculator;
    private final ActivityLogService activityLogService;

    public MarkDto saveMark(MarkDto dto, Long teacherId) {
        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", dto.getTaskId()));
        User student = userRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("User", dto.getStudentId()));

        BigDecimal percentage = gpaCalculator.calculatePercentage(
                dto.getMarksObtained(), task.getMaxMarks());
        BigDecimal gpa = gpaCalculator.calculateGpa(percentage);

        Mark mark = markRepository.findByTaskIdAndStudentId(dto.getTaskId(), dto.getStudentId())
                .orElse(Mark.builder().task(task).student(student).build());

        mark.setMarksObtained(dto.getMarksObtained());
        mark.setGpa(gpa);
        Mark saved = markRepository.save(mark);

        activityLogService.log(teacherId, "MARKS_ENTERED",
                "Task: " + task.getTitle() + " | Student: " + student.getName());

        return toDto(saved, percentage);
    }

    @Transactional(readOnly = true)
    public List<MarkDto> getMarksByStudent(Long studentId) {
        return markRepository.findByStudentId(studentId)
                .stream().map(m -> toDto(m,
                        gpaCalculator.calculatePercentage(m.getMarksObtained(), m.getTask().getMaxMarks())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarkDto> getMarksByTask(Long taskId) {
        return markRepository.findByTaskId(taskId)
                .stream().map(m -> toDto(m,
                        gpaCalculator.calculatePercentage(m.getMarksObtained(), m.getTask().getMaxMarks())))
                .collect(Collectors.toList());
    }

    private MarkDto toDto(Mark mark, BigDecimal percentage) {
        return MarkDto.builder()
                .id(mark.getId())
                .taskId(mark.getTask().getId())
                .taskTitle(mark.getTask().getTitle())
                .studentId(mark.getStudent().getId())
                .studentName(mark.getStudent().getName())
                .marksObtained(mark.getMarksObtained())
                .maxMarks(mark.getTask().getMaxMarks())
                .percentageScore(percentage)
                .gpa(mark.getGpa())
                .updatedAt(mark.getUpdatedAt())
                .build();
    }
}
