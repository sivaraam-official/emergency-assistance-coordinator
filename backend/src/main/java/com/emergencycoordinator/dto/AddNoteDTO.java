package com.emergencycoordinator.dto;
import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Size;
public record AddNoteDTO(@NotBlank(message = "Note text is required") @Size(max = 300, message = "Note must be at most 300 characters") String note) {}
