package com.landregistry.backend.dto;

import com.landregistry.backend.model.TransferStatus;
import com.landregistry.backend.model.TransferType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TransferRequestDTO {
    private String id;
    private TransferLandDTO land;
    private TransferPartyDTO seller;
    private TransferPartyDTO buyer;
    private long salePrice;
    private TransferType transferType;
    private double sharePercentage;
    private TransferStatus status;
    private String requestDate;
    private boolean documentsVerified;

    @Data
    @AllArgsConstructor
    public static class TransferLandDTO {
        private String id;
        private String surveyNumber;
        private String village;
        private String district;
        private int area;
    }

    @Data
    @AllArgsConstructor
    public static class TransferPartyDTO {
        private String id;
        private String name;
        private String email;
        private String role;
    }
}
