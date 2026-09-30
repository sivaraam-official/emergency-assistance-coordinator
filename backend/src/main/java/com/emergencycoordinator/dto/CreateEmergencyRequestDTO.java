package com.emergencycoordinator.dto;
import com.emergencycoordinator.model.*;
import jakarta.validation.constraints.*;
public record CreateEmergencyRequestDTO(
    @NotBlank(message = "Requester name is required") String requesterName,
    @NotBlank(message = "Contact number is required") @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Contact number must be 7-15 digits") String contactNumber,
    @NotNull(message = "Emergency type is required") EmergencyType emergencyType,
    @NotBlank(message = "Location is required") String location,
    @NotBlank(message = "Description is required") String description,
    @NotNull(message = "Reported severity is required") EmergencyPriority reportedSeverity) {}
