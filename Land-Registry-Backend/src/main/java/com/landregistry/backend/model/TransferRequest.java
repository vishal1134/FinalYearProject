package com.landregistry.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "transfer_requests")
public class TransferRequest {
    @Id
    private String id;
    
    @Indexed
    private String landId;
    private String sellerId;
    private String buyerId;
    private long salePrice;

    private TransferType transferType = TransferType.FULL_TRANSFER;
    private double sharePercentage = 100.0;

    @Indexed
    private TransferStatus status;
    private String requestDate;
    private String reviewedAt;
    private String reviewedByAdminId;
    private String adminRemarks;

    private boolean documentsVerified = false;
    private List<String> documentIds;

    private List<OwnerShare> previousOwnerSnapshot;
    private List<OwnerShare> newOwnerSnapshot;
    private String previousRecordHash;
    private String recordHash;
    private String blockchainTransactionHash;
    private Long blockchainBlockNumber;
    private String blockchainAnchoredAt;
}
