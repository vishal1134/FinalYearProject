package com.landregistry.backend.dto;

import lombok.Data;

@Data
public class LandRegistrationRequest {
    private String surveyNumber;
    private String district;
    private String village;
    private int area;
    private long price;
    private String ownerId;
    private Double latitude;
    private Double longitude;
}
