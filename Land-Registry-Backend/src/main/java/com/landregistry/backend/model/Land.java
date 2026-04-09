package com.landregistry.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "lands")
@CompoundIndex(
        name = "unique_land_identity",
        def = "{'surveyNumber': 1, 'village': 1, 'district': 1}",
        unique = true
)
public class Land {
    @Id
    private String id; // Use String to allow custom IDs if needed

    private String surveyNumber;
    private String district;
    private String village;
    private int area; // sq.ft
    private long price; // Market Value

    private LandType landType = LandType.NORMAL;
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    private Visibility visibility = Visibility.PRIVATE;
    private List<OwnerShare> currentOwners;

    private String ownerId; // Reference to User.id

    private boolean verified;
    private boolean transferLocked;
    private List<String> documents; // URLs or descriptions
    private List<String> legalDocumentIds;
    private String imageUrl;

    private String createdBy;
    private String verifiedByAdminId;
    private String createdAt;
    private String updatedAt;
    private String verifiedAt;

    // Geospatial Coordinates
    private Double latitude;
    private Double longitude;
}
