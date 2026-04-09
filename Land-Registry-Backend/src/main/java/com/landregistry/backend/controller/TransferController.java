package com.landregistry.backend.controller;

import com.landregistry.backend.dto.TransferApprovalDTO;
import com.landregistry.backend.dto.TransferRequestDTO;
import com.landregistry.backend.model.Land;
import com.landregistry.backend.model.TransferRequest;
import com.landregistry.backend.model.User;
import com.landregistry.backend.repository.LandRepository;
import com.landregistry.backend.repository.UserRepository;
import com.landregistry.backend.service.TransferService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;
    private final UserRepository userRepository;
    private final LandRepository landRepository;

    public TransferController(TransferService transferService, UserRepository userRepository, LandRepository landRepository) {
        this.transferService = transferService;
        this.userRepository = userRepository;
        this.landRepository = landRepository;
    }

    @PostMapping
    public ResponseEntity<TransferRequest> initiateTransfer(@RequestBody TransferRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> user = userRepository.findByEmail(userDetails.getUsername());
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        if (request.getSellerId() == null || request.getSellerId().isBlank()) {
            request.setSellerId(user.get().getId());
        }
        if (!request.getSellerId().equals(user.get().getId())) {
            throw new RuntimeException("Unauthorized: You can only initiate transfers for your own lands");
        }
        return ResponseEntity.ok(transferService.initiateTransfer(request));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TransferRequestDTO>> getPendingRequests() {
        return ResponseEntity.ok(transferService.getAllPendingRequests().stream()
                .map(this::toTransferRequestDTO)
                .toList());
    }

    @PutMapping("/{id}/verify-documents")
    public ResponseEntity<TransferRequest> verifyTransferDocuments(@PathVariable String id) {
        return ResponseEntity.ok(transferService.verifyTransferDocuments(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<TransferRequest> approveTransfer(@PathVariable String id,
                                                           @RequestBody(required = false) TransferApprovalDTO approvalDTO,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        String remarks = approvalDTO == null ? null : approvalDTO.getAdminRemarks();
        return ResponseEntity.ok(transferService.approveTransfer(id, admin.getId(), remarks));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TransferRequest> rejectTransfer(@PathVariable String id,
                                                          @RequestBody(required = false) TransferApprovalDTO approvalDTO,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        String remarks = approvalDTO == null ? null : approvalDTO.getAdminRemarks();
        return ResponseEntity.ok(transferService.rejectTransfer(id, admin.getId(), remarks));
    }

    private TransferRequestDTO toTransferRequestDTO(TransferRequest request) {
        Land land = landRepository.findById(request.getLandId()).orElse(null);
        User seller = userRepository.findById(request.getSellerId()).orElse(null);
        User buyer = userRepository.findById(request.getBuyerId()).orElse(null);

        return new TransferRequestDTO(
                request.getId(),
                land == null
                        ? new TransferRequestDTO.TransferLandDTO(request.getLandId(), "Unknown land", "Unknown", "Unknown", 0)
                        : new TransferRequestDTO.TransferLandDTO(
                                land.getId(),
                                land.getSurveyNumber(),
                                land.getVillage(),
                                land.getDistrict(),
                                land.getArea()
                        ),
                toPartyDTO(request.getSellerId(), seller),
                toPartyDTO(request.getBuyerId(), buyer),
                request.getSalePrice(),
                request.getTransferType(),
                request.getSharePercentage(),
                request.getStatus(),
                request.getRequestDate(),
                request.isDocumentsVerified()
        );
    }

    private TransferRequestDTO.TransferPartyDTO toPartyDTO(String fallbackId, User user) {
        if (user == null) {
            return new TransferRequestDTO.TransferPartyDTO(fallbackId, "Unknown user", "Unknown", "Unknown");
        }
        return new TransferRequestDTO.TransferPartyDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() == null ? "Unknown" : user.getRole().name()
        );
    }
}
