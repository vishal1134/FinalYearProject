package com.landregistry.backend.service;

import com.landregistry.backend.dto.DocumentUploadResponse;
import com.landregistry.backend.model.DocumentType;
import com.landregistry.backend.model.LegalDocument;
import com.landregistry.backend.repository.LandRepository;
import com.landregistry.backend.repository.LegalDocumentRepository;
import com.landregistry.backend.repository.TransferRequestRepository;
import org.bson.types.Binary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;

@Service
public class LegalDocumentService {

    private final LegalDocumentRepository documentRepository;
    private final LandRepository landRepository;
    private final TransferRequestRepository transferRequestRepository;

    public LegalDocumentService(LegalDocumentRepository documentRepository,
                                LandRepository landRepository,
                                TransferRequestRepository transferRequestRepository) {
        this.documentRepository = documentRepository;
        this.landRepository = landRepository;
        this.transferRequestRepository = transferRequestRepository;
    }

    public DocumentUploadResponse uploadDocument(String landId,
                                                 String transferRequestId,
                                                 String uploadedByUserId,
                                                 DocumentType documentType,
                                                 MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Document file is required");
        }

        landRepository.findById(landId)
                .orElseThrow(() -> new RuntimeException("Land not found"));

        try {
            byte[] fileBytes = file.getBytes();

            LegalDocument document = new LegalDocument();
            document.setLandId(landId);
            document.setTransferRequestId(transferRequestId);
            document.setUploadedByUserId(uploadedByUserId);
            document.setDocumentType(documentType == null ? DocumentType.OTHER : documentType);
            document.setFileName(file.getOriginalFilename());
            document.setContentType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setFileData(new Binary(fileBytes));
            document.setDocumentHash(sha256(fileBytes));
            document.setUploadedAt(Instant.now());
            document.setSensitive(true);

            LegalDocument savedDocument = documentRepository.save(document);

            landRepository.findById(landId).ifPresent(land -> {
                if (land.getLegalDocumentIds() == null) {
                    land.setLegalDocumentIds(new ArrayList<>());
                }
                land.getLegalDocumentIds().add(savedDocument.getId());
                land.setUpdatedAt(Instant.now().toString());
                landRepository.save(land);
            });

            if (transferRequestId != null && !transferRequestId.isBlank()) {
                transferRequestRepository.findById(transferRequestId).ifPresent(transferRequest -> {
                    if (transferRequest.getDocumentIds() == null) {
                        transferRequest.setDocumentIds(new ArrayList<>());
                    }
                    transferRequest.getDocumentIds().add(savedDocument.getId());
                    transferRequestRepository.save(transferRequest);
                });
            }

            return new DocumentUploadResponse(
                    savedDocument.getId(),
                    savedDocument.getLandId(),
                    savedDocument.getTransferRequestId(),
                    savedDocument.getDocumentType(),
                    savedDocument.getFileName(),
                    savedDocument.getDocumentHash()
            );
        } catch (IOException e) {
            throw new RuntimeException("Unable to read document file", e);
        }
    }

    public LegalDocument getDocument(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    private String sha256(byte[] input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm is not available", e);
        }
    }
}
