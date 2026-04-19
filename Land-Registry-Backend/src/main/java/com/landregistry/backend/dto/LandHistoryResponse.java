package com.landregistry.backend.dto;

public class LandHistoryResponse {
    private String id;
    private String landId;
    private String previousOwnerId;
    private String newOwnerId;
    private String timestamp;
    private String action;
    private String txId;

    public LandHistoryResponse() {
    }

    public LandHistoryResponse(
            String id,
            String landId,
            String previousOwnerId,
            String newOwnerId,
            String timestamp,
            String action,
            String txId
    ) {
        this.id = id;
        this.landId = landId;
        this.previousOwnerId = previousOwnerId;
        this.newOwnerId = newOwnerId;
        this.timestamp = timestamp;
        this.action = action;
        this.txId = txId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLandId() {
        return landId;
    }

    public void setLandId(String landId) {
        this.landId = landId;
    }

    public String getPreviousOwnerId() {
        return previousOwnerId;
    }

    public void setPreviousOwnerId(String previousOwnerId) {
        this.previousOwnerId = previousOwnerId;
    }

    public String getNewOwnerId() {
        return newOwnerId;
    }

    public void setNewOwnerId(String newOwnerId) {
        this.newOwnerId = newOwnerId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTxId() {
        return txId;
    }

    public void setTxId(String txId) {
        this.txId = txId;
    }
}
