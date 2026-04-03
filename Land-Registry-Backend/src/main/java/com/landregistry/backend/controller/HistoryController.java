package com.landregistry.backend.controller;

import com.landregistry.backend.model.Land;
import com.landregistry.backend.model.LandHistory;
import com.landregistry.backend.model.User;
import com.landregistry.backend.repository.LandRepository;
import com.landregistry.backend.repository.UserRepository;
import com.landregistry.backend.service.LandHistoryService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final LandHistoryService service;
    private final LandRepository landRepository;
    private final UserRepository userRepository;

    public HistoryController(LandHistoryService service, LandRepository landRepository, UserRepository userRepository) {
        this.service = service;
        this.landRepository = landRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{landId}")
    public List<LandHistory> getLandHistory(@PathVariable String landId, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> user = userRepository.findByEmail(userDetails.getUsername());
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        Optional<Land> land = landRepository.findById(landId);
        if (land.isEmpty()) {
            throw new RuntimeException("Land not found");
        }
        // Allow if user owns the land or is admin
        if (!land.get().getOwnerId().equals(user.get().getId()) && !userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            throw new RuntimeException("Unauthorized: You can only view history for your own lands");
        }
        return service.getHistory(landId);
    }
}
