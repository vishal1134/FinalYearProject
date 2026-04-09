package com.landregistry.backend.repository;

import com.landregistry.backend.model.LegalDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LegalDocumentRepository extends MongoRepository<LegalDocument, String> {
    List<LegalDocument> findByLandId(String landId);
    List<LegalDocument> findByTransferRequestId(String transferRequestId);
}
