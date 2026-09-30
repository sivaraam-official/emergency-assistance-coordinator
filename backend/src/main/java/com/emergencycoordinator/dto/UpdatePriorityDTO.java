package com.emergencycoordinator.dto;
import com.emergencycoordinator.model.EmergencyPriority; import jakarta.validation.constraints.NotNull;
public record UpdatePriorityDTO(@NotNull(message = "Priority is required") EmergencyPriority priority) {}
