package com.emergencycoordinator.controller;
import com.emergencycoordinator.model.Responder; import com.emergencycoordinator.service.ResponderService;
import java.util.List; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/responders")
public class ResponderController {
    private final ResponderService service;
    public ResponderController(ResponderService s) { service = s; }
    @GetMapping public List<Responder> all() { return service.getAll(); }
    @GetMapping("/available") public List<Responder> available() { return service.getAvailable(); }
    @GetMapping("/{id}") public Responder one(@PathVariable String id) { return service.get(id); }
}
