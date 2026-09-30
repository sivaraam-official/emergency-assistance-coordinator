package com.emergencycoordinator.model;
/** Demonstration rule only - NOT a professional triage result. Lower rank = more urgent. */
public enum EmergencyPriority { CRITICAL(0), HIGH(1), MEDIUM(2), LOW(3);
    private final int rank; EmergencyPriority(int r) { rank = r; } public int getRank() { return rank; } }
