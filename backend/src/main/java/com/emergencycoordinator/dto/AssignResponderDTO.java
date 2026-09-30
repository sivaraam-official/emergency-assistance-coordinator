package com.emergencycoordinator.dto;
import jakarta.validation.constraints.NotBlank;
public record AssignResponderDTO(@NotBlank(message = "Responder ID is required") String responderId) {}
