package com.landregistry.backend.controller;

import com.landregistry.backend.model.TransferRequest;
import com.landregistry.backend.service.TransferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    public ResponseEntity<TransferRequest> initiateTransfer(@RequestBody TransferRequest request) {
        return ResponseEntity.ok(transferService.initiateTransfer(request));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TransferRequest>> getPendingRequests() {
        return ResponseEntity.ok(transferService.getAllPendingRequests());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<TransferRequest> approveTransfer(@PathVariable String id) {
        return ResponseEntity.ok(transferService.approveTransfer(id));
    }
}
