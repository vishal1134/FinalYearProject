package com.landregistry.backend.controller;

import com.landregistry.backend.dto.DocumentUploadResponse;
import com.landregistry.backend.model.DocumentType;
import com.landregistry.backend.model.LegalDocument;
import com.landregistry.backend.model.User;
import com.landregistry.backend.repository.UserRepository;
import com.landregistry.backend.service.LegalDocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final LegalDocumentService documentService;
    private final UserRepository userRepository;

    public DocumentController(LegalDocumentService documentService, UserRepository userRepository) {
        this.documentService = documentService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<DocumentUploadResponse> uploadDocument(@RequestParam String landId,
                                                                 @RequestParam(required = false) String transferRequestId,
                                                                 @RequestParam(required = false) DocumentType documentType,
                                                                 @RequestParam("file") MultipartFile file,
                                                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(documentService.uploadDocument(
                landId,
                transferRequestId,
                user.getId(),
                documentType,
                file
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String id) {
        LegalDocument document = documentService.getDocument(id);
        MediaType contentType = document.getContentType() == null
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(document.getContentType());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .contentType(contentType)
                .body(document.getFileData().getData());
    }
}
