package com.landregistry.backend.service;

import com.landregistry.backend.model.TransferRequest;
import com.landregistry.backend.model.Land;
import com.landregistry.backend.repository.TransferRequestRepository;
import com.landregistry.backend.repository.LandRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class TransferService {

    private final TransferRequestRepository transferRepository;

    public TransferService(TransferRequestRepository transferRepository) {
        this.transferRepository = transferRepository;
    }

    public TransferRequest initiateTransfer(TransferRequest request) {
        request.setStatus("PENDING_APPROVAL");
        request.setRequestDate(new Date().toString());
        return transferRepository.save(request);
    }

    public List<TransferRequest> getAllPendingRequests() {
        return transferRepository.findByStatus("PENDING_APPROVAL");
    }

    public TransferRequest approveTransfer(String id) {
        TransferRequest request = transferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"PENDING_APPROVAL".equals(request.getStatus())) {
            throw new RuntimeException("Transfer request is not pending");
        }

        if (!request.isDocumentsVerified()) {
            throw new RuntimeException("Documents must be verified by admin before approval");
        }

        Land land = landRepository.findById(request.getLandId())
                .orElseThrow(() -> new RuntimeException("Land not found for transfer"));

        if (!land.getOwnerId().equals(request.getSellerId())) {
            throw new RuntimeException("Only current owner can transfer land");
        }

        land.setOwnerId(request.getBuyerId());
        land.setVerified(false); // Remove from public listings after transfer
        landRepository.save(land);

        historyService.logAction(land.getId(), request.getSellerId(), request.getBuyerId(), "TRANSFERRED");

        request.setStatus("APPROVED_AND_COMMITTED");
        return transferRepository.save(request);
    }
}
