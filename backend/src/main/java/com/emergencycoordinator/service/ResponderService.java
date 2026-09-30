package com.emergencycoordinator.service;
import com.emergencycoordinator.exception.*; import com.emergencycoordinator.model.*;
import java.util.*; import java.util.concurrent.ConcurrentHashMap; import org.springframework.stereotype.Service;
@Service
public class ResponderService {
    private final Map<String, Responder> responders = new ConcurrentHashMap<>();
    public ResponderService() {
        add(new Responder("R-101", "Alpha Medical Unit", ResponderType.MEDICAL_TEAM, "9000000001"));
        add(new Responder("R-102", "Bravo Medical Unit", ResponderType.MEDICAL_TEAM, "9000000002"));
        add(new Responder("R-201", "Fire Squad 1", ResponderType.FIRE_AND_RESCUE_TEAM, "9000000003"));
        add(new Responder("R-301", "Accident Response 1", ResponderType.ACCIDENT_RESPONSE_TEAM, "9000000004"));
        add(new Responder("R-401", "General Assistance 1", ResponderType.GENERAL_ASSISTANCE_TEAM, "9000000005"));
    }
    private void add(Responder r) { responders.put(r.getResponderId(), r); }
    public List<Responder> getAll() { return responders.values().stream().sorted(Comparator.comparing(Responder::getResponderId)).toList(); }
    public List<Responder> getAvailable() { return getAll().stream().filter(Responder::isAvailable).toList(); }
    public Responder get(String id) { Responder r = responders.get(id); if (r == null) throw new ResourceNotFoundException("Responder not found: " + id); return r; }
}
