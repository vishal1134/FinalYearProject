package com.landregistry.backend.service;

import com.landregistry.backend.model.LandHistory;
import com.landregistry.backend.model.OwnerShare;
import com.landregistry.backend.model.OwnershipEventType;
import com.landregistry.backend.repository.LandHistoryRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LandHistoryService {

    private final LandHistoryRepository repository;

    public LandHistoryService(LandHistoryRepository repository) {
        this.repository = repository;
    }

    public void logAction(String landId, String previousOwnerId, String newOwnerId, String action) {
        LandHistory history = new LandHistory(landId, previousOwnerId, newOwnerId, action);
        addBlockchainReadyHash(history);
        repository.save(history);
    }

    public LandHistory logOwnershipEvent(String landId,
                                         String transferRequestId,
                                         OwnershipEventType eventType,
                                         List<OwnerShare> previousOwners,
                                         List<OwnerShare> newOwners,
                                         String adminId,
                                         String remarks) {
        LandHistory history = new LandHistory();
        history.setLandId(landId);
        history.setTransferRequestId(transferRequestId);
        history.setEventType(eventType);
        history.setAction(eventType.name());
        history.setPreviousOwners(previousOwners);
        history.setNewOwners(newOwners);
        history.setApprovedByAdminId(adminId);
        history.setRemarks(remarks);
        history.setTimestamp(LocalDateTime.now());
        addBlockchainReadyHash(history);
        return repository.save(history);
    }

    public List<LandHistory> getHistory(String landId) {
        return repository.findByLandIdOrderByTimestampDesc(landId);
    }

    public String getLatestRecordHash(String landId) {
        return repository.findByLandIdOrderByTimestampDesc(landId).stream()
                .findFirst()
                .map(LandHistory::getRecordHash)
                .orElse("GENESIS");
    }

    private void addBlockchainReadyHash(LandHistory history) {
        Optional<LandHistory> latestHistory = repository.findByLandIdOrderByTimestampDesc(history.getLandId()).stream().findFirst();
        String previousHash = latestHistory.map(LandHistory::getRecordHash).orElse("GENESIS");
        history.setPreviousRecordHash(previousHash);
        history.setRecordHash(sha256(
                history.getLandId()
                        + "|" + history.getTransferRequestId()
                        + "|" + history.getAction()
                        + "|" + history.getPreviousOwners()
                        + "|" + history.getNewOwners()
                        + "|" + history.getTimestamp()
                        + "|" + previousHash
        ));
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm is not available", e);
        }
    }
}
