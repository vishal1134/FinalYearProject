package com.landregistry.backend.service;

import com.landregistry.backend.model.Land;
import com.landregistry.backend.model.LandType;
import com.landregistry.backend.model.OwnerShare;
import com.landregistry.backend.model.OwnershipEventType;
import com.landregistry.backend.model.VerificationStatus;
import com.landregistry.backend.model.Visibility;
import com.landregistry.backend.repository.LandRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
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
        if (land.getSurveyNumber() == null || land.getSurveyNumber().isBlank()
                || land.getVillage() == null || land.getVillage().isBlank()
                || land.getDistrict() == null || land.getDistrict().isBlank()) {
            throw new IllegalArgumentException("surveyNumber, village and district are required");
        }

        landRepository.findBySurveyNumberAndVillageAndDistrict(
                land.getSurveyNumber(),
                land.getVillage(),
                land.getDistrict()
        ).ifPresent(existingLand -> {
            throw new IllegalArgumentException("Land already exists for this survey number, village and district");
        });

        if (land.getOwnerId() == null || land.getOwnerId().isBlank()) {
            throw new IllegalArgumentException("Owner is required");
        }

        if (land.getLandType() == null) {
            land.setLandType(LandType.NORMAL);
        }

        if (land.getCurrentOwners() == null || land.getCurrentOwners().isEmpty()) {
            land.setCurrentOwners(new ArrayList<>(List.of(new OwnerShare(land.getOwnerId(), 100.0))));
        }

        validateOwnershipShares(land);
        land.setVerificationStatus(VerificationStatus.PENDING);
        land.setVisibility(Visibility.PRIVATE);
        land.setVerified(false);
        land.setTransferLocked(false);
        land.setCreatedBy(land.getOwnerId());
        land.setCreatedAt(Instant.now().toString());
        land.setUpdatedAt(Instant.now().toString());

        Land savedLand = landRepository.save(land);
        historyService.logOwnershipEvent(
                savedLand.getId(),
                null,
                OwnershipEventType.LAND_REGISTERED,
                List.of(),
                savedLand.getCurrentOwners(),
                null,
                "Land registration submitted"
        );
        return savedLand;
    }

    public List<Land> getAllLands() {
        return landRepository.findAll();
    }

    public List<Land> getVerifiedLands() {
        return landRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
    }

    public List<Land> getMyLands(String ownerId) {
        List<Land> ownedLands = landRepository.findByCurrentOwnerUserId(ownerId);
        if (ownedLands.isEmpty()) {
            return landRepository.findByOwnerId(ownerId);
        }
        return ownedLands;
    }

    public List<Land> getPendingVerifications() {
        return landRepository.findByVerificationStatus(VerificationStatus.PENDING);
    }

    public Land verifyLand(String id, String adminId) {
        Land land = landRepository.findById(id).orElseThrow(() -> new RuntimeException("Land not found"));
        ensureCurrentOwners(land);
        List<OwnerShare> previousOwners = new ArrayList<>(land.getCurrentOwners());
        land.setVerificationStatus(VerificationStatus.VERIFIED);
        land.setVisibility(Visibility.PUBLIC_VERIFIED);
        land.setVerified(true);
        land.setVerifiedByAdminId(adminId);
        land.setVerifiedAt(Instant.now().toString());
        land.setUpdatedAt(Instant.now().toString());
        Land savedLand = landRepository.save(land);
        historyService.logOwnershipEvent(
                savedLand.getId(),
                null,
                OwnershipEventType.LAND_VERIFIED,
                previousOwners,
                savedLand.getCurrentOwners(),
                adminId,
                "Land verified by admin"
        );
        return savedLand;
    }

    public Land verifyLand(String id) {
        return verifyLand(id, null);
    }

    private void validateOwnershipShares(Land land) {
        double totalShare = land.getCurrentOwners().stream()
                .mapToDouble(OwnerShare::getSharePercentage)
                .sum();

        if (Math.abs(totalShare - 100.0) > 0.01) {
            throw new IllegalArgumentException("Total ownership share must equal 100%");
        }

        if (land.getLandType() == LandType.NORMAL && land.getCurrentOwners().size() != 1) {
            throw new IllegalArgumentException("Normal land must have exactly one owner");
        }
    }

    private void ensureCurrentOwners(Land land) {
        if ((land.getCurrentOwners() == null || land.getCurrentOwners().isEmpty())
                && land.getOwnerId() != null
                && !land.getOwnerId().isBlank()) {
            land.setCurrentOwners(new ArrayList<>(List.of(new OwnerShare(land.getOwnerId(), 100.0))));
        }
    }
}
