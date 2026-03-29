package com.landregistry.backend.repository;

import com.landregistry.backend.model.Land;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LandRepository extends MongoRepository<Land, String> {
    List<Land> findByOwnerId(String ownerId);
    List<Land> findByVerifiedTrue();
    List<Land> findByVerifiedFalse();
}
