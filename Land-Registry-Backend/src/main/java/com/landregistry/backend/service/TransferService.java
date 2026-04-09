package com.landregistry.backend.service;

import com.landregistry.backend.model.Land;
import com.landregistry.backend.model.LandType;
import com.landregistry.backend.model.OwnerShare;
import com.landregistry.backend.model.OwnershipEventType;
import com.landregistry.backend.model.TransferRequest;
import com.landregistry.backend.model.TransferStatus;
import com.landregistry.backend.model.TransferType;
import com.landregistry.backend.model.VerificationStatus;
import com.landregistry.backend.repository.TransferRequestRepository;
import com.landregistry.backend.repository.LandRepository;
import com.landregistry.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class TransferService {

    private final TransferRequestRepository transferRepository;
    private final LandRepository landRepository;
    private final LandHistoryService historyService;
    private final UserRepository userRepository;

    public TransferService(TransferRequestRepository transferRepository,
                           LandRepository landRepository,
                           LandHistoryService historyService,
                           UserRepository userRepository) {
        this.transferRepository = transferRepository;
        this.landRepository = landRepository;
        this.historyService = historyService;
        this.userRepository = userRepository;
    }

    public TransferRequest initiateTransfer(TransferRequest request) {
        if (request.getLandId() == null || request.getSellerId() == null || request.getBuyerId() == null) {
            throw new IllegalArgumentException("landId, sellerId and buyerId are required");
        }

        Land land = landRepository.findById(request.getLandId())
                .orElseThrow(() -> new RuntimeException("Land not found for transfer"));

        ensureCurrentOwners(land);

        if (land.getVerificationStatus() != VerificationStatus.VERIFIED && !land.isVerified()) {
            throw new RuntimeException("Only verified land can be transferred");
        }

        if (land.isTransferLocked() || transferRepository.existsByLandIdAndStatus(land.getId(), TransferStatus.PENDING_APPROVAL)) {
            throw new RuntimeException("Land already has a pending transfer request");
        }

        request.setBuyerId(resolveBuyerId(request.getBuyerId()));

        if (request.getTransferType() == null) {
            request.setTransferType(land.getLandType() == LandType.APARTMENT
                    ? TransferType.PARTIAL_SHARE_TRANSFER
                    : TransferType.FULL_TRANSFER);
        }

        if (request.getTransferType() == TransferType.FULL_TRANSFER) {
            request.setSharePercentage(100.0);
        }

        validateSellerShare(land, request);

        request.setPreviousOwnerSnapshot(copyShares(land.getCurrentOwners()));
        request.setStatus(TransferStatus.PENDING_APPROVAL);
        request.setRequestDate(new Date().toString());
        request.setPreviousRecordHash(historyService.getLatestRecordHash(land.getId()));

        land.setTransferLocked(true);
        land.setUpdatedAt(Instant.now().toString());
        landRepository.save(land);

        TransferRequest savedRequest = transferRepository.save(request);
        savedRequest.setRecordHash(hashTransfer(savedRequest));
        return transferRepository.save(savedRequest);
    }

    public List<TransferRequest> getAllPendingRequests() {
        return transferRepository.findByStatus(TransferStatus.PENDING_APPROVAL);
    }

    public TransferRequest verifyTransferDocuments(String id) {
        TransferRequest request = transferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transfer request not found"));

        if (request.getStatus() != TransferStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Only pending transfers can have documents verified");
        }

        request.setDocumentsVerified(true);
        return transferRepository.save(request);
    }

    public TransferRequest approveTransfer(String id, String adminId, String adminRemarks) {
        TransferRequest request = transferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != TransferStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Transfer request is not pending");
        }

        if (!request.isDocumentsVerified()) {
            throw new RuntimeException("Documents must be verified by admin before approval");
        }
        Land land = landRepository.findById(request.getLandId())
                .orElseThrow(() -> new RuntimeException("Land not found for transfer"));
        ensureCurrentOwners(land);

        if (!sellerHasEnoughShare(land, request.getSellerId(), request.getSharePercentage())) {
            throw new RuntimeException("Only current owner can transfer land");
        }

        List<OwnerShare> previousOwners = copyShares(land.getCurrentOwners());
        List<OwnerShare> newOwners = applyOwnershipTransfer(land, request);

        land.setCurrentOwners(newOwners);
        land.setOwnerId(resolvePrimaryOwnerId(newOwners));
        land.setPrice(request.getSalePrice());
        land.setTransferLocked(false);
        land.setVerified(false); // Remove from public listings after transfer
        land.setVerificationStatus(VerificationStatus.PENDING);
        land.setUpdatedAt(Instant.now().toString());
        landRepository.save(land);

        request.setPreviousOwnerSnapshot(previousOwners);
        request.setNewOwnerSnapshot(newOwners);
        request.setReviewedByAdminId(adminId);
        request.setReviewedAt(Instant.now().toString());
        request.setAdminRemarks(adminRemarks);
        request.setStatus(TransferStatus.APPROVED_AND_COMMITTED);
        request.setRecordHash(hashTransfer(request));
        TransferRequest savedRequest = transferRepository.save(request);

        historyService.logOwnershipEvent(
                land.getId(),
                savedRequest.getId(),
                OwnershipEventType.TRANSFER_APPROVED,
                previousOwners,
                newOwners,
                adminId,
                adminRemarks
        );

        return savedRequest;
    }

    public TransferRequest approveTransfer(String id) {
        return approveTransfer(id, null, null);
    }

    public TransferRequest rejectTransfer(String id, String adminId, String adminRemarks) {
        TransferRequest request = transferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != TransferStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Transfer request is not pending");
        }

        Land land = landRepository.findById(request.getLandId())
                .orElseThrow(() -> new RuntimeException("Land not found for transfer"));

        land.setTransferLocked(false);
        land.setUpdatedAt(Instant.now().toString());
        landRepository.save(land);

        request.setReviewedByAdminId(adminId);
        request.setReviewedAt(Instant.now().toString());
        request.setAdminRemarks(adminRemarks);
        request.setStatus(TransferStatus.REJECTED);
        request.setRecordHash(hashTransfer(request));
        TransferRequest savedRequest = transferRepository.save(request);

        historyService.logOwnershipEvent(
                land.getId(),
                savedRequest.getId(),
                OwnershipEventType.TRANSFER_REJECTED,
                request.getPreviousOwnerSnapshot(),
                request.getPreviousOwnerSnapshot(),
                adminId,
                adminRemarks
        );

        return savedRequest;
    }

    private void validateSellerShare(Land land, TransferRequest request) {
        if (land.getLandType() == LandType.NORMAL && request.getTransferType() != TransferType.FULL_TRANSFER) {
            throw new RuntimeException("Normal land supports only full transfer");
        }

        if (request.getSharePercentage() <= 0 || request.getSharePercentage() > 100) {
            throw new RuntimeException("Transfer share percentage must be between 0 and 100");
        }

        if (!sellerHasEnoughShare(land, request.getSellerId(), request.getSharePercentage())) {
            throw new RuntimeException("Seller does not own enough share to transfer");
        }
    }

    private String resolveBuyerId(String buyerIdOrEmail) {
        if (buyerIdOrEmail == null || buyerIdOrEmail.isBlank()) {
            throw new RuntimeException("Buyer is required");
        }

        return userRepository.findById(buyerIdOrEmail)
                .map(user -> user.getId())
                .or(() -> userRepository.findByEmail(buyerIdOrEmail).map(user -> user.getId()))
                .orElseThrow(() -> new RuntimeException("Buyer not found. Enter a registered owner email or user ID."));
    }

    private boolean sellerHasEnoughShare(Land land, String sellerId, double sharePercentage) {
        return land.getCurrentOwners() != null
                && land.getCurrentOwners().stream()
                .anyMatch(owner -> owner.getUserId().equals(sellerId)
                        && owner.getSharePercentage() + 0.01 >= sharePercentage);
    }

    private void ensureCurrentOwners(Land land) {
        if (land.getLandType() == null) {
            land.setLandType(LandType.NORMAL);
        }

        if ((land.getCurrentOwners() == null || land.getCurrentOwners().isEmpty())
                && land.getOwnerId() != null
                && !land.getOwnerId().isBlank()) {
            land.setCurrentOwners(new ArrayList<>(List.of(new OwnerShare(land.getOwnerId(), 100.0))));
        }
    }

    private List<OwnerShare> applyOwnershipTransfer(Land land, TransferRequest request) {
        if (request.getTransferType() == TransferType.FULL_TRANSFER) {
            return new ArrayList<>(List.of(new OwnerShare(request.getBuyerId(), 100.0)));
        }

        List<OwnerShare> newOwners = copyShares(land.getCurrentOwners());
        boolean buyerFound = false;

        for (OwnerShare owner : newOwners) {
            if (owner.getUserId().equals(request.getSellerId())) {
                owner.setSharePercentage(owner.getSharePercentage() - request.getSharePercentage());
            }
            if (owner.getUserId().equals(request.getBuyerId())) {
                owner.setSharePercentage(owner.getSharePercentage() + request.getSharePercentage());
                buyerFound = true;
            }
        }

        newOwners.removeIf(owner -> owner.getSharePercentage() <= 0.01);

        if (!buyerFound) {
            newOwners.add(new OwnerShare(request.getBuyerId(), request.getSharePercentage()));
        }

        double total = newOwners.stream().mapToDouble(OwnerShare::getSharePercentage).sum();
        if (Math.abs(total - 100.0) > 0.01) {
            throw new RuntimeException("Ownership shares must total 100% after transfer");
        }

        return newOwners;
    }

    private List<OwnerShare> copyShares(List<OwnerShare> shares) {
        if (shares == null) {
            return new ArrayList<>();
        }
        return shares.stream()
                .map(owner -> new OwnerShare(owner.getUserId(), owner.getSharePercentage()))
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    }

    private String resolvePrimaryOwnerId(List<OwnerShare> owners) {
        if (owners == null || owners.isEmpty()) {
            return null;
        }
        return owners.get(0).getUserId();
    }

    private String hashTransfer(TransferRequest request) {
        return sha256(
                request.getId()
                        + "|" + request.getLandId()
                        + "|" + request.getSellerId()
                        + "|" + request.getBuyerId()
                        + "|" + request.getTransferType()
                        + "|" + request.getSharePercentage()
                        + "|" + request.getStatus()
                        + "|" + request.getPreviousOwnerSnapshot()
                        + "|" + request.getNewOwnerSnapshot()
                        + "|" + request.getReviewedByAdminId()
                        + "|" + request.getReviewedAt()
        );
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
