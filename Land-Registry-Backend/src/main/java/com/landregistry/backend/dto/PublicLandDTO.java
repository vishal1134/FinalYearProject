package com.landregistry.backend.dto;

import com.landregistry.backend.model.LandType;
import com.landregistry.backend.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PublicLandDTO {
    private String id;
    private String surveyNumber;
    private String village;
    private String district;
    private int area;
    private long price;
    private LandType landType;
    private VerificationStatus verificationStatus;
    private boolean verified;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
}
