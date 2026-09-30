package com.emergencycoordinator.service;
import com.emergencycoordinator.model.*;
import java.util.*; import org.springframework.stereotype.Service;
/** Active queue: highest priority first, ties broken by oldest createdAt. Priority is a demo rule, not medical triage. */
@Service
public class PriorityService {
    public static final Comparator<EmergencyRequest> ORDER = Comparator
        .comparingInt((EmergencyRequest r) -> r.getPriority().getRank()).thenComparing(EmergencyRequest::getCreatedAt);
    private final PriorityQueue<EmergencyRequest> queue = new PriorityQueue<>(ORDER);
    public synchronized void add(EmergencyRequest r) { queue.add(r); }
    public synchronized void remove(EmergencyRequest r) { queue.remove(r); }
    /** Remove-then-add so the queue is re-ordered and never holds stale entries. */
    public synchronized void reprioritize(EmergencyRequest r, EmergencyPriority p) { queue.remove(r); r.setPriority(p); queue.add(r); }
    public synchronized List<EmergencyRequest> ordered() { List<EmergencyRequest> l = new ArrayList<>(queue); l.sort(ORDER); return l; }
}
