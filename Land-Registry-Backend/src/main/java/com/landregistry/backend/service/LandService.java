package com.landregistry.backend.service;

import com.landregistry.backend.model.Land;
import com.landregistry.backend.repository.LandRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LandService {

    private final LandRepository landRepository;
    private final LandHistoryService historyService;

    public LandService(LandRepository landRepository, LandHistoryService historyService) {
        this.landRepository = landRepository;
        this.historyService = historyService;
    }

    public Land registerLand(Land land) {
        land.setVerified(false);
        Land savedLand = landRepository.save(land);
        historyService.logAction(savedLand.getId(), "SYSTEM", savedLand.getOwnerId(), "REGISTERED");
        return savedLand;
    }

    public List<Land> getAllLands() {
        return landRepository.findAll();
    }

    public List<Land> getVerifiedLands() {
        return landRepository.findByVerifiedTrue();
    }

    public List<Land> getMyLands(String ownerId) {
        return landRepository.findByOwnerId(ownerId);
    }

    public List<Land> getPendingVerifications() {
        return landRepository.findByVerifiedFalse();
    }

    public Land verifyLand(String id) {
        Land land = landRepository.findById(id).orElseThrow(() -> new RuntimeException("Land not found"));
        land.setVerified(true);
        Land savedLand = landRepository.save(land);
        historyService.logAction(savedLand.getId(), "ADMIN", savedLand.getOwnerId(), "VERIFIED");
        return savedLand;
    }
}
