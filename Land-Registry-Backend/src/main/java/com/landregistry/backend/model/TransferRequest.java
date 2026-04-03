package com.landregistry.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "transfer_requests")
public class TransferRequest {
    @Id
    private String id;
    
    private String landId;
    private String sellerId;
    private String buyerId;
    private long salePrice;
    
    private String status; // PENDING, APPROVED, REJECTED
    private String requestDate;
    private boolean documentsVerified = false;
}
