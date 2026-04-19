package com.landregistry.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "lands")
public class Land {
    @Id
    private String id; // Use String to allow custom IDs if needed

    @Indexed
    private String surveyNumber;
    private String district;
    private String village;
    private int area; // sq.ft
    private long price; // Market Value

    private String ownerId; // Reference to User.id

    private boolean verified;
    private List<String> documents; // URLs or descriptions
    private String imageName;
    private String imageContentType;
    private byte[] imageData;

    // Geospatial Coordinates
    private Double latitude;
    private Double longitude;
}
