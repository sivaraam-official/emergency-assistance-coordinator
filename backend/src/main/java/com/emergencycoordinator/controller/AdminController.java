package com.emergencycoordinator.controller;
import com.emergencycoordinator.service.EmergencyRequestService; import java.util.Map; import org.springframework.web.bind.annotation.*;
/** Demo administrator mode: no authentication (NOT secure; academic prototype only). */
@RestController @RequestMapping("/api/admin")
public class AdminController {
    private final EmergencyRequestService service;
    public AdminController(EmergencyRequestService s) { service = s; }
    @GetMapping("/dashboard") public Map<String, Long> dashboard() { return service.dashboard(); }
}
