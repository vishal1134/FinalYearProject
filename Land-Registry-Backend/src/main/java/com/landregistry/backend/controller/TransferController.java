package com.landregistry.backend.controller;

import com.landregistry.backend.model.TransferRequest;
import com.landregistry.backend.model.User;
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

    public TransferController(TransferService transferService, UserRepository userRepository) {
        this.transferService = transferService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<TransferRequest> initiateTransfer(@RequestBody TransferRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> user = userRepository.findByEmail(userDetails.getUsername());
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        if (!request.getSellerId().equals(user.get().getId())) {
            throw new RuntimeException("Unauthorized: You can only initiate transfers for your own lands");
        }
        return ResponseEntity.ok(transferService.initiateTransfer(request));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TransferRequest>> getPendingRequests() {
        return ResponseEntity.ok(transferService.getAllPendingRequests());
    }

    @PutMapping("/{id}/verify-documents")
    public ResponseEntity<TransferRequest> verifyTransferDocuments(@PathVariable String id) {
        TransferRequest request = transferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transfer request not found"));
        request.setDocumentsVerified(true);
        return ResponseEntity.ok(transferRepository.save(request));
    }
}
