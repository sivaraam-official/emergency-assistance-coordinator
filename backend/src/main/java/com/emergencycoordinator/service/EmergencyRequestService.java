package com.emergencycoordinator.service;
import com.emergencycoordinator.dto.CreateEmergencyRequestDTO;
import com.emergencycoordinator.exception.*; import com.emergencycoordinator.model.*;
import java.util.*; import java.util.concurrent.atomic.AtomicInteger; import org.springframework.stereotype.Service;
import static com.emergencycoordinator.model.EmergencyStatus.*;
/** All mutating methods are synchronized so multi-step operations (assign/release) are atomic. */
@Service
public class EmergencyRequestService {
    private static final Map<EmergencyStatus, Set<EmergencyStatus>> ALLOWED = Map.of(
        PENDING, Set.of(CANCELLED), ASSIGNED, Set.of(IN_PROGRESS, RESOLVED, CANCELLED),
        IN_PROGRESS, Set.of(RESOLVED, CANCELLED), RESOLVED, Set.<EmergencyStatus>of(), CANCELLED, Set.<EmergencyStatus>of());
    private final List<EmergencyRequest> requests = new ArrayList<>();
    private final Map<String, EmergencyRequest> byId = new HashMap<>();
    private final AtomicInteger counter = new AtomicInteger(1000);
    private final PriorityService priorityService; private final ResponderService responderService;
    public EmergencyRequestService(PriorityService p, ResponderService r) { priorityService = p; responderService = r; }

    public synchronized EmergencyRequest create(CreateEmergencyRequestDTO d) {
        if (d == null) throw new InvalidRequestException("Request body is required");
        EmergencyRequest r = new EmergencyRequest("ER-" + counter.incrementAndGet(), d.requesterName().trim(), d.contactNumber(), d.emergencyType(),
            d.location().trim(), d.description().trim(), d.reportedSeverity());
        requests.add(r); byId.put(r.getRequestId(), r); priorityService.add(r); return r;
    }
    public synchronized List<EmergencyRequest> getAll() { return new ArrayList<>(requests); }
    public synchronized EmergencyRequest get(String id) { EmergencyRequest r = byId.get(id); if (r == null) throw new ResourceNotFoundException("Request not found: " + id); return r; }
    public List<EmergencyRequest> getActive() { return priorityService.ordered(); }
    public synchronized List<EmergencyRequest> byStatus(EmergencyStatus s) { return requests.stream().filter(r -> r.getStatus() == s).toList(); }
    public synchronized List<EmergencyRequest> byPriority(EmergencyPriority p) { return requests.stream().filter(r -> r.getPriority() == p).toList(); }

    public synchronized EmergencyRequest updatePriority(String id, EmergencyPriority p) {
        EmergencyRequest r = get(id);
        if (!r.isActive()) throw new InvalidRequestException("Cannot change priority of a " + r.getStatus() + " request");
        EmergencyPriority old = r.getPriority();
        priorityService.reprioritize(r, p); r.addEvent("Priority changed " + old + " -> " + p); return r;
    }
    public synchronized EmergencyRequest assign(String id, String responderId) {
        EmergencyRequest r = get(id); Responder res = responderService.get(responderId);
        if (r.getStatus() != PENDING) throw new InvalidRequestException("Only PENDING requests can be assigned (current: " + r.getStatus() + ")");
        if (!res.isAvailable()) throw new InvalidRequestException("Responder " + responderId + " is not available");
        res.assign(id); r.setAssignedResponderId(responderId); r.setStatus(ASSIGNED); r.addEvent("Assigned to " + res.getName() + " (" + responderId + ")"); return r;
    }
    public synchronized EmergencyRequest updateStatus(String id, EmergencyStatus next) {
        EmergencyRequest r = get(id);
        if (next == ASSIGNED) throw new InvalidRequestException("Use the assign endpoint to move a request to ASSIGNED");
        if (!ALLOWED.get(r.getStatus()).contains(next)) throw new InvalidRequestException("Invalid transition: " + r.getStatus() + " -> " + next);
        if (next == RESOLVED || next == CANCELLED) {
            priorityService.remove(r);
            if (r.getAssignedResponderId() != null) responderService.get(r.getAssignedResponderId()).release();
        }
        r.setStatus(next); r.addEvent("Status changed to " + next); return r;
    }
    /** Simple feature: admins can attach short notes to a request. */
    public synchronized EmergencyRequest addNote(String id, String text) {
        EmergencyRequest r = get(id);
        if (text == null || text.isBlank()) throw new InvalidRequestException("Note text is required");
        r.addNote(text.trim()); return r;
    }
    /** Simple feature: keyword search over id, name, location and description. */
    public synchronized List<EmergencyRequest> search(String keyword) {
        if (keyword == null || keyword.isBlank()) return new ArrayList<>(requests);
        String k = keyword.trim().toLowerCase();
        return requests.stream().filter(r -> (r.getRequestId() + " " + r.getRequesterName() + " " + r.getLocation() + " " + r.getDescription()).toLowerCase().contains(k)).toList();
    }
    public EmergencyRequest cancel(String id) { return updateStatus(id, CANCELLED); }

    public synchronized Map<String, Long> dashboard() {
        Map<String, Long> m = new LinkedHashMap<>(); m.put("totalRequests", (long) requests.size());
        m.put("pendingRequests", requests.stream().filter(r -> r.getStatus() == PENDING).count());
        m.put("criticalRequests", requests.stream().filter(r -> r.isActive() && r.getPriority() == EmergencyPriority.CRITICAL).count());
        m.put("assignedRequests", requests.stream().filter(r -> r.getStatus() == ASSIGNED).count());
        m.put("inProgressRequests", requests.stream().filter(r -> r.getStatus() == IN_PROGRESS).count());
        m.put("resolvedRequests", requests.stream().filter(r -> r.getStatus() == RESOLVED).count());
        m.put("availableResponders", (long) responderService.getAvailable().size()); return m;
    }
}
