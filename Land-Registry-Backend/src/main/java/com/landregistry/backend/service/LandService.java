package com.landregistry.backend.service;

import com.landregistry.backend.dto.LandRegistrationRequest;
import com.landregistry.backend.model.Land;
import com.landregistry.backend.repository.LandRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class LandService {

    private final LandRepository landRepository;
    private final LandHistoryService historyService;
    private final FabricGatewayService fabricGatewayService;

    public LandService(
            LandRepository landRepository,
            LandHistoryService historyService,
            FabricGatewayService fabricGatewayService
    ) {
        this.landRepository = landRepository;
        this.historyService = historyService;
        this.fabricGatewayService = fabricGatewayService;
    }

    public Land registerLand(LandRegistrationRequest request, MultipartFile imageFile) {
        Land land = new Land();
        land.setSurveyNumber(request.getSurveyNumber());
        land.setDistrict(request.getDistrict());
        land.setVillage(request.getVillage());
        land.setArea(request.getArea());
        land.setPrice(request.getPrice());
        land.setOwnerId(request.getOwnerId());
        land.setLatitude(request.getLatitude());
        land.setLongitude(request.getLongitude());
        attachImage(land, imageFile);
        land.setVerified(false);
        Land savedLand = landRepository.save(land);
        if (!fabricGatewayService.isEnabled()) {
            historyService.logAction(savedLand.getId(), "SYSTEM", savedLand.getOwnerId(), "REGISTERED");
        }
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
        if (fabricGatewayService.isEnabled()) {
            fabricGatewayService.createLandRecord(savedLand);
        } else {
            historyService.logAction(savedLand.getId(), "ADMIN", savedLand.getOwnerId(), "VERIFIED");
        }
        return savedLand;
    }

    private void attachImage(Land land, MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            return;
        }

        try {
            land.setImageName(imageFile.getOriginalFilename());
            land.setImageContentType(imageFile.getContentType());
            land.setImageData(imageFile.getBytes());
        } catch (IOException exception) {
            throw new RuntimeException("Failed to read land image", exception);
        }
    }
}
