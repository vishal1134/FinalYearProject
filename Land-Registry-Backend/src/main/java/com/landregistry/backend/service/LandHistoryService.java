package com.landregistry.backend.service;

import com.landregistry.backend.model.LandHistory;
import com.landregistry.backend.repository.LandHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LandHistoryService {

    private final LandHistoryRepository repository;

    public LandHistoryService(LandHistoryRepository repository) {
        this.repository = repository;
    }

    public void logAction(String landId, String previousOwnerId, String newOwnerId, String action) {
        LandHistory history = new LandHistory(landId, previousOwnerId, newOwnerId, action);
        repository.save(history);
    }

    public List<LandHistory> getHistory(String landId) {
        return repository.findByLandIdOrderByTimestampDesc(landId);
    }
}
