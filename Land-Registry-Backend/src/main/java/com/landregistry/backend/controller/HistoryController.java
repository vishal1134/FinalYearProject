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

        List<LandHistory> history = service.getHistory(landId);

        // Allow if user owns the land or is admin
        String userId = user.get().getId();
        boolean isCurrentOwner = userId.equals(land.get().getOwnerId())
                || (land.get().getCurrentOwners() != null
                && land.get().getCurrentOwners().stream().anyMatch(owner -> userId.equals(owner.getUserId())));
        boolean isHistoryParticipant = history.stream().anyMatch(record ->
                userId.equals(record.getPreviousOwnerId())
                        || userId.equals(record.getNewOwnerId())
                        || (record.getPreviousOwners() != null
                        && record.getPreviousOwners().stream().anyMatch(owner -> userId.equals(owner.getUserId())))
                        || (record.getNewOwners() != null
                        && record.getNewOwners().stream().anyMatch(owner -> userId.equals(owner.getUserId())))
        );
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isCurrentOwner && !isHistoryParticipant && !isAdmin) {
            throw new RuntimeException("Unauthorized: You can only view history for lands you own or previously owned");
        }
        return history;
    }
}
