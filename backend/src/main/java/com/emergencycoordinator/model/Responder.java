package com.emergencycoordinator.model;
public class Responder {
    private final String responderId, name, contactNumber; private final ResponderType responderType;
    private boolean available = true; private String assignedRequestId;
    public Responder(String id, String name, ResponderType type, String contact) { responderId = id; this.name = name; responderType = type; contactNumber = contact; }
    public String getResponderId() { return responderId; } public String getName() { return name; }
    public String getContactNumber() { return contactNumber; } public ResponderType getResponderType() { return responderType; }
    public String getAvailabilityStatus() { return available ? "AVAILABLE" : "BUSY"; }
    @com.fasterxml.jackson.annotation.JsonIgnore public boolean isAvailable() { return available; }
    public String getAssignedRequestId() { return assignedRequestId; }
    public void assign(String requestId) { available = false; assignedRequestId = requestId; }
    public void release() { available = true; assignedRequestId = null; }
}
