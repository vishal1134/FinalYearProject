package com.landregistry.backend.controller;

import com.landregistry.backend.dto.LandRegistrationRequest;
import com.landregistry.backend.dto.LandResponse;
import com.landregistry.backend.model.Land;
import com.landregistry.backend.model.User;
import com.landregistry.backend.repository.UserRepository;
import com.landregistry.backend.service.LandService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lands")
public class LandController {
    
    private final LandService landService;
    private final UserRepository userRepository;

    public LandController(LandService landService, UserRepository userRepository) {
        this.landService = landService;
        this.userRepository = userRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LandResponse> registerLand(
            @RequestPart("land") LandRegistrationRequest land,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (!isAdmin || land.getOwnerId() == null || land.getOwnerId().isBlank()) {
            land.setOwnerId(currentUser.getId());
        }

        return ResponseEntity.ok(LandResponse.from(landService.registerLand(land, image)));
    }

    @GetMapping("/verified")
    public ResponseEntity<List<LandResponse>> getVerifiedLands() {
        return ResponseEntity.ok(landService.getVerifiedLands().stream().map(LandResponse::from).collect(Collectors.toList()));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<LandResponse>> getPendingLands() {
        return ResponseEntity.ok(landService.getPendingVerifications().stream().map(LandResponse::from).collect(Collectors.toList()));
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<LandResponse>> getMyLands(@RequestParam String ownerId) {
        return ResponseEntity.ok(landService.getMyLands(ownerId).stream().map(LandResponse::from).collect(Collectors.toList()));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<LandResponse> verifyLand(@PathVariable String id) {
        return ResponseEntity.ok(LandResponse.from(landService.verifyLand(id)));
    }
}
