package com.landregistry.backend.dto;

import com.landregistry.backend.model.Land;
import lombok.Builder;
import lombok.Value;

import java.util.Base64;
import java.util.List;

@Value
@Builder
public class LandResponse {
    String id;
    String surveyNumber;
    String district;
    String village;
    int area;
    long price;
    String ownerId;
    boolean verified;
    List<String> documents;
    Double latitude;
    Double longitude;
    String imageName;
    String imageContentType;
    String imageUrl;

    public static LandResponse from(Land land) {
        return LandResponse.builder()
                .id(land.getId())
                .surveyNumber(land.getSurveyNumber())
                .district(land.getDistrict())
                .village(land.getVillage())
                .area(land.getArea())
                .price(land.getPrice())
                .ownerId(land.getOwnerId())
                .verified(land.isVerified())
                .documents(land.getDocuments())
                .latitude(land.getLatitude())
                .longitude(land.getLongitude())
                .imageName(land.getImageName())
                .imageContentType(land.getImageContentType())
                .imageUrl(toImageUrl(land))
                .build();
    }

    private static String toImageUrl(Land land) {
        if (land.getImageData() == null || land.getImageData().length == 0 || land.getImageContentType() == null) {
            return null;
        }

        return "data:" + land.getImageContentType() + ";base64," + Base64.getEncoder().encodeToString(land.getImageData());
    }
}
