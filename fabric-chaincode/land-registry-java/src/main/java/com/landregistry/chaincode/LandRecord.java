package com.landregistry.chaincode;

public class LandRecord {
    private String landId;
    private String ownerId;
    private String previousOwnerId;
    private String action;
    private String updatedAt;

    public LandRecord(String landId, String ownerId, String previousOwnerId, String action, String updatedAt) {
        this.landId = landId;
        this.ownerId = ownerId;
        this.previousOwnerId = previousOwnerId;
        this.action = action;
        this.updatedAt = updatedAt;
    }

    public String getLandId() {
        return landId;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getPreviousOwnerId() {
        return previousOwnerId;
    }

    public String getAction() {
        return action;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }
}
