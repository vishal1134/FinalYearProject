package com.landregistry.backend.repository;

import com.landregistry.backend.model.LandHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LandHistoryRepository extends MongoRepository<LandHistory, String> {
    List<LandHistory> findByLandIdOrderByTimestampDesc(String landId);
}
