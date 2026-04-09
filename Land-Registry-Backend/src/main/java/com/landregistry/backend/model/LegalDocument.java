package com.landregistry.backend.model;

import lombok.Data;
import org.bson.types.Binary;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "documents")
public class LegalDocument {
    @Id
    private String id;

    @Indexed
    private String landId;

    @Indexed
    private String transferRequestId;

    private String uploadedByUserId;
    private DocumentType documentType;
    private String fileName;
    private String contentType;
    private long fileSize;
    private Binary fileData;

    @Indexed
    private String documentHash;

    private Instant uploadedAt;
    private boolean sensitive = true;
}
