package com.landregistry.backend.controller;

import com.landregistry.backend.model.Land;
import com.landregistry.backend.service.LandService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lands")
public class LandController {
    
    private final LandService landService;

    public LandController(LandService landService) {
        this.landService = landService;
    }

    @PostMapping
    public ResponseEntity<Land> registerLand(@RequestBody Land land, @AuthenticationPrincipal UserDetails userDetails) {
        // In real implementations, extract user ID from userDetails or lookup via username
        return ResponseEntity.ok(landService.registerLand(land));
    }

    @GetMapping("/verified")
    public ResponseEntity<List<Land>> getVerifiedLands() {
        return ResponseEntity.ok(landService.getVerifiedLands());
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<Land>> getPendingLands() {
        return ResponseEntity.ok(landService.getPendingVerifications());
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<Land>> getMyLands(@RequestParam String ownerId) {
        return ResponseEntity.ok(landService.getMyLands(ownerId));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<Land> verifyLand(@PathVariable String id) {
        return ResponseEntity.ok(landService.verifyLand(id));
    }
}
