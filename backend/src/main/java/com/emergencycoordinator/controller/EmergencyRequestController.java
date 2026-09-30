package com.emergencycoordinator.controller;
import com.emergencycoordinator.dto.*; import com.emergencycoordinator.model.*; import com.emergencycoordinator.service.EmergencyRequestService;
import jakarta.validation.Valid; import java.util.List;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/requests")
public class EmergencyRequestController {
    private final EmergencyRequestService service;
    public EmergencyRequestController(EmergencyRequestService s) { service = s; }
    @PostMapping public ResponseEntity<EmergencyRequest> create(@Valid @RequestBody CreateEmergencyRequestDTO d) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(d)); }
    @GetMapping public List<EmergencyRequest> all() { return service.getAll(); }
    @GetMapping("/search") public List<EmergencyRequest> search(@RequestParam(defaultValue = "") String q) { return service.search(q); }
    @PostMapping("/{id}/notes") public EmergencyRequest note(@PathVariable String id, @Valid @RequestBody AddNoteDTO d) { return service.addNote(id, d.note()); }
    @GetMapping("/active") public List<EmergencyRequest> active() { return service.getActive(); }
    @GetMapping("/{id}") public EmergencyRequest one(@PathVariable String id) { return service.get(id); }
    @GetMapping("/status/{status}") public List<EmergencyRequest> byStatus(@PathVariable EmergencyStatus status) { return service.byStatus(status); }
    @GetMapping("/priority/{priority}") public List<EmergencyRequest> byPriority(@PathVariable EmergencyPriority priority) { return service.byPriority(priority); }
    @PatchMapping("/{id}/status") public EmergencyRequest status(@PathVariable String id, @Valid @RequestBody UpdateStatusDTO d) { return service.updateStatus(id, d.status()); }
    @PatchMapping("/{id}/priority") public EmergencyRequest priority(@PathVariable String id, @Valid @RequestBody UpdatePriorityDTO d) { return service.updatePriority(id, d.priority()); }
    @PatchMapping("/{id}/assign") public EmergencyRequest assign(@PathVariable String id, @Valid @RequestBody AssignResponderDTO d) { return service.assign(id, d.responderId()); }
    @PatchMapping("/{id}/cancel") public EmergencyRequest cancel(@PathVariable String id) { return service.cancel(id); }
}
