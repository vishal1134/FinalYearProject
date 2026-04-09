package com.landregistry.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "land_history")
public class LandHistory {
    @Id
    private String id;

    @Indexed
    private String landId;
    private String transferRequestId;

    private String previousOwnerId;
    private String newOwnerId;
    private List<OwnerShare> previousOwners;
    private List<OwnerShare> newOwners;

    private LocalDateTime timestamp;
    private OwnershipEventType eventType;
    private String action; // e.g., "REGISTERED", "VERIFIED", "TRANSFERRED"
    private String approvedByAdminId;
    private String remarks;
    private String previousRecordHash;
    private String recordHash;
    private String blockchainTransactionHash;
    private Long blockchainBlockNumber;
    private String blockchainAnchoredAt;

    public LandHistory(String landId, String previousOwnerId, String newOwnerId, String action) {
        this.landId = landId;
        this.previousOwnerId = previousOwnerId;
        this.newOwnerId = newOwnerId;
        this.action = action;
        this.eventType = mapAction(action);
        this.timestamp = LocalDateTime.now();
    }

    private OwnershipEventType mapAction(String action) {
        if ("REGISTERED".equals(action)) {
            return OwnershipEventType.LAND_REGISTERED;
        }
        if ("VERIFIED".equals(action)) {
            return OwnershipEventType.LAND_VERIFIED;
        }
        if ("REJECTED".equals(action)) {
            return OwnershipEventType.LAND_REJECTED;
        }
        if ("TRANSFERRED".equals(action)) {
            return OwnershipEventType.TRANSFER_APPROVED;
        }
        return OwnershipEventType.TRANSFER_REQUESTED;
    }
}
