package com.landregistry.backend.repository;

import com.landregistry.backend.model.TransferRequest;
import com.landregistry.backend.model.TransferStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TransferRequestRepository extends MongoRepository<TransferRequest, String> {
    List<TransferRequest> findByStatus(TransferStatus status);
    boolean existsByLandIdAndStatus(String landId, TransferStatus status);
}
