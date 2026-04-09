package com.landregistry.backend.repository;

import com.landregistry.backend.model.Land;
import com.landregistry.backend.model.VerificationStatus;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface LandRepository extends MongoRepository<Land, String> {
    List<Land> findByOwnerId(String ownerId);
    List<Land> findByVerifiedTrue();
    List<Land> findByVerifiedFalse();
    List<Land> findByVerificationStatus(VerificationStatus verificationStatus);
    Optional<Land> findBySurveyNumberAndVillageAndDistrict(String surveyNumber, String village, String district);

    @Query("{ 'currentOwners.userId': ?0 }")
    List<Land> findByCurrentOwnerUserId(String ownerId);
}
