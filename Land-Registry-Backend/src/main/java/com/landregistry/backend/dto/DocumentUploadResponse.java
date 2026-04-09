package com.landregistry.backend.dto;

import com.landregistry.backend.model.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DocumentUploadResponse {
    private String documentId;
    private String landId;
    private String transferRequestId;
    private DocumentType documentType;
    private String fileName;
    private String documentHash;
}
