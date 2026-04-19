package com.landregistry.chaincode;

public class LandHistoryEntry {
    private String txId;
    private String landId;
    private String previousOwnerId;
    private String newOwnerId;
    private String timestamp;
    private String action;

    public LandHistoryEntry(String txId, String landId, String previousOwnerId, String newOwnerId, String timestamp, String action) {
        this.txId = txId;
        this.landId = landId;
        this.previousOwnerId = previousOwnerId;
        this.newOwnerId = newOwnerId;
        this.timestamp = timestamp;
        this.action = action;
    }

    public String getTxId() {
        return txId;
    }

    public String getLandId() {
        return landId;
    }

    public String getPreviousOwnerId() {
        return previousOwnerId;
    }

    public String getNewOwnerId() {
        return newOwnerId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getAction() {
        return action;
    }
}
