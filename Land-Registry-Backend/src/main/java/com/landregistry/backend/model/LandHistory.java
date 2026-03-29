package com.landregistry.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "land_history")
public class LandHistory {
    @Id
    private String id;

    private String landId;
    private String previousOwnerId;
    private String newOwnerId;
    private LocalDateTime timestamp;
    private String action; // e.g., "REGISTERED", "VERIFIED", "TRANSFERRED"

    public LandHistory(String landId, String previousOwnerId, String newOwnerId, String action) {
        this.landId = landId;
        this.previousOwnerId = previousOwnerId;
        this.newOwnerId = newOwnerId;
        this.action = action;
        this.timestamp = LocalDateTime.now();
    }
}
