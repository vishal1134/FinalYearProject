package com.landregistry.backend.controller;

import com.landregistry.backend.model.Land;
import com.landregistry.backend.model.User;
import com.landregistry.backend.repository.UserRepository;
import com.landregistry.backend.service.LandService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lands")
public class LandController {
    
    private final LandService landService;
    private final UserRepository userRepository;

    public LandController(LandService landService, UserRepository userRepository) {
        this.landService = landService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Land> registerLand(@RequestBody Land land, @AuthenticationPrincipal UserDetails userDetails) {
<<<<<<< HEAD
        if (userDetails != null && (land.getOwnerId() == null || land.getOwnerId().isEmpty())) {
            // We store username locally if user details don't provide user ID, assuming email maps to user
            land.setOwnerId(userDetails.getUsername());
        }

        Land savedLand = landService.registerLand(land);
        return ResponseEntity.ok(savedLand);
    }

    @GetMapping
    public ResponseEntity<List<Land>> getAllLands() {
        return ResponseEntity.ok(landService.getAllLands());
=======
        if (userDetails != null) {
            Optional<User> user = userRepository.findByEmail(userDetails.getUsername());
            if (user.isPresent()) {
                land.setOwnerId(user.get().getId());
            } else {
                throw new RuntimeException("User not found");
            }
        }
        return ResponseEntity.ok(landService.registerLand(land));
>>>>>>> main
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
    public ResponseEntity<List<Land>> getMyLands(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> user = userRepository.findByEmail(userDetails.getUsername());
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return ResponseEntity.ok(landService.getMyLands(user.get().getId()));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<Land> verifyLand(@PathVariable String id) {
        return ResponseEntity.ok(landService.verifyLand(id));
    }
}
