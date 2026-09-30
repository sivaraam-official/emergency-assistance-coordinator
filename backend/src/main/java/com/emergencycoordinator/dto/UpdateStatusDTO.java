package com.emergencycoordinator.dto;
import com.emergencycoordinator.model.EmergencyStatus; import jakarta.validation.constraints.NotNull;
public record UpdateStatusDTO(@NotNull(message = "Status is required") EmergencyStatus status) {}
