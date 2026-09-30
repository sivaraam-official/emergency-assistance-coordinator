package com.emergencycoordinator.model;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
public class EmergencyRequest {
    private final String requestId, requesterName, contactNumber, location, description;
    private final EmergencyType emergencyType; private final EmergencyPriority reportedSeverity;
    /** One line in the request history shown to the requester and the admin. */
    public record TimelineEvent(LocalDateTime time, String message) {}
    private final List<TimelineEvent> timeline = new ArrayList<>();
    private final List<TimelineEvent> notes = new ArrayList<>();
    private EmergencyPriority priority; private EmergencyStatus status = EmergencyStatus.PENDING;
    private String assignedResponderId; private final LocalDateTime createdAt = LocalDateTime.now(); private LocalDateTime updatedAt = createdAt;
    public EmergencyRequest(String id, String name, String contact, EmergencyType type, String location, String description, EmergencyPriority severity) {
        requestId = id; requesterName = name; contactNumber = contact; emergencyType = type; this.location = location;
        this.description = description; reportedSeverity = severity; priority = severity;
        timeline.add(new TimelineEvent(createdAt, "Request received (priority " + severity + ")"));
    }
    public String getRequestId() { return requestId; } public String getRequesterName() { return requesterName; }
    public String getContactNumber() { return contactNumber; } public String getLocation() { return location; }
    public String getDescription() { return description; } public EmergencyType getEmergencyType() { return emergencyType; }
    public EmergencyPriority getReportedSeverity() { return reportedSeverity; } public EmergencyPriority getPriority() { return priority; }
    public EmergencyStatus getStatus() { return status; } public String getAssignedResponderId() { return assignedResponderId; }
    public LocalDateTime getCreatedAt() { return createdAt; } public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setPriority(EmergencyPriority p) { priority = p; touch(); }
    public void setStatus(EmergencyStatus s) { status = s; touch(); }
    public void setAssignedResponderId(String id) { assignedResponderId = id; touch(); }
    public synchronized void addEvent(String message) { timeline.add(new TimelineEvent(LocalDateTime.now(), message)); touch(); }
    public synchronized void addNote(String text) { notes.add(new TimelineEvent(LocalDateTime.now(), text)); touch(); }
    public synchronized List<TimelineEvent> getTimeline() { return Collections.unmodifiableList(new ArrayList<>(timeline)); }
    public synchronized List<TimelineEvent> getNotes() { return Collections.unmodifiableList(new ArrayList<>(notes)); }
    private void touch() { updatedAt = LocalDateTime.now(); }
    @com.fasterxml.jackson.annotation.JsonIgnore public boolean isActive() { return status != EmergencyStatus.RESOLVED && status != EmergencyStatus.CANCELLED; }
}
