package com.landregistry.backend.service;

import com.landregistry.backend.model.TransferRequest;
import com.landregistry.backend.model.Land;
import com.landregistry.backend.repository.TransferRequestRepository;
import com.landregistry.backend.repository.LandRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;

@Service
public class TransferService {

    private final TransferRequestRepository transferRepository;
    private final LandRepository landRepository;
    private final LandHistoryService landHistoryService;
    private final FabricGatewayService fabricGatewayService;

    public TransferService(
            TransferRequestRepository transferRepository,
            LandRepository landRepository,
            LandHistoryService landHistoryService,
            FabricGatewayService fabricGatewayService
    ) {
        this.transferRepository = transferRepository;
        this.landRepository = landRepository;
        this.landHistoryService = landHistoryService;
        this.fabricGatewayService = fabricGatewayService;
    }

    public TransferRequest initiateTransfer(TransferRequest request) {
        Land land = landRepository.findById(request.getLandId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Land not found"));

        if (!land.isVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only verified lands can be transferred");
        }

        if (!land.getOwnerId().equals(request.getSellerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only the current owner can initiate transfer");
        }

        request.setStatus("PENDING_APPROVAL");
        request.setRequestDate(new Date().toString());
        return transferRepository.save(request);
    }

    public List<TransferRequest> getAllPendingRequests() {
        return transferRepository.findByStatus("PENDING_APPROVAL");
    }

    public TransferRequest approveTransfer(String id) {
        TransferRequest request = transferRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!"PENDING_APPROVAL".equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transfer request is not pending approval");
        }

        Land land = landRepository.findById(request.getLandId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Land not found"));

        if (!land.getOwnerId().equals(request.getSellerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transfer seller does not match current land owner");
        }

        if (fabricGatewayService.isEnabled()) {
            fabricGatewayService.transferLand(land.getId(), request.getSellerId(), request.getBuyerId());
        }

        land.setOwnerId(request.getBuyerId());
        land.setPrice(request.getSalePrice());
        landRepository.save(land);

        if (!fabricGatewayService.isEnabled()) {
            landHistoryService.logAction(land.getId(), request.getSellerId(), request.getBuyerId(), "TRANSFERRED");
        }

        request.setStatus("APPROVED_AND_COMMITTED");
        return transferRepository.save(request);
    }
}
