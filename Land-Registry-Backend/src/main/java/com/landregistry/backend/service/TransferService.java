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

        request.setStatus("APPROVED_AND_COMMITTED");

        // TODO:
        // 1. Invoke Blockchain Chaincode 'transferLand'
        // 2. Update Land owner in MongoDB (LandService)

        return transferRepository.save(request);
    }
}
