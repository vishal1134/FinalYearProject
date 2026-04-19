package com.landregistry.chaincode;

import com.google.gson.Gson;
import org.hyperledger.fabric.shim.ChaincodeBase;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ledger.KeyModification;
import org.hyperledger.fabric.shim.ledger.QueryResultsIterator;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class LandRegistryContract extends ChaincodeBase {
    private final Gson gson = new Gson();

    @Override
    public Response init(ChaincodeStub stub) {
        return newSuccessResponse("Land registry chaincode initialized");
    }

    @Override
    public Response invoke(ChaincodeStub stub) {
        try {
            return switch (stub.getFunction()) {
                case "createLandRecord" -> success(createLandRecord(stub, requireArgs(stub, 2)[0], requireArgs(stub, 2)[1]));
                case "transferLand" -> {
                    String[] args = requireArgs(stub, 3);
                    yield success(transferLand(stub, args[0], args[1], args[2]));
                }
                case "readLand" -> success(readLand(stub, requireArgs(stub, 1)[0]));
                case "getLandHistory" -> success(getLandHistory(stub, requireArgs(stub, 1)[0]));
                default -> newErrorResponse("Unsupported function: " + stub.getFunction());
            };
        } catch (ChaincodeException exception) {
            return newErrorResponse(exception.getMessage());
        } catch (Exception exception) {
            return newErrorResponse("Chaincode execution failed: " + exception.getMessage());
        }
    }

    public String createLandRecord(ChaincodeStub stub, String landId, String ownerId) {
        String existingRecord = stub.getStringState(landId);
        if (existingRecord != null && !existingRecord.isBlank()) {
            throw new ChaincodeException("Land record already exists for id " + landId);
        }

        LandRecord record = new LandRecord(
                landId,
                ownerId,
                "",
                "REGISTERED_AND_VERIFIED",
                Instant.now().toString()
        );

        stub.putStringState(landId, gson.toJson(record));
        return gson.toJson(record);
    }

    public String transferLand(ChaincodeStub stub, String landId, String oldOwner, String newOwner) {
        LandRecord currentRecord = getExistingLandRecord(stub, landId);

        if (!currentRecord.getOwnerId().equals(oldOwner)) {
            throw new ChaincodeException("Current owner mismatch for land " + landId);
        }

        LandRecord updatedRecord = new LandRecord(
                landId,
                newOwner,
                oldOwner,
                "TRANSFERRED",
                Instant.now().toString()
        );

        stub.putStringState(landId, gson.toJson(updatedRecord));
        return gson.toJson(updatedRecord);
    }

    public String readLand(ChaincodeStub stub, String landId) {
        LandRecord record = getExistingLandRecord(stub, landId);
        return gson.toJson(record);
    }

    public String getLandHistory(ChaincodeStub stub, String landId) {
        getExistingLandRecord(stub, landId);

        List<LandHistoryEntry> historyEntries = new ArrayList<>();
        QueryResultsIterator<KeyModification> history = stub.getHistoryForKey(landId);

        for (KeyModification modification : history) {
            if (modification.isDeleted()) {
                continue;
            }

            LandRecord record = gson.fromJson(modification.getStringValue(), LandRecord.class);
            historyEntries.add(new LandHistoryEntry(
                    modification.getTxId(),
                    landId,
                    record.getPreviousOwnerId(),
                    record.getOwnerId(),
                    modification.getTimestamp().toString(),
                    record.getAction()
            ));
        }

        return gson.toJson(historyEntries);
    }

    private LandRecord getExistingLandRecord(ChaincodeStub stub, String landId) {
        String json = stub.getStringState(landId);
        if (json == null || json.isBlank()) {
            throw new ChaincodeException("Land record does not exist for id " + landId);
        }

        return gson.fromJson(json, LandRecord.class);
    }

    private String[] requireArgs(ChaincodeStub stub, int expectedCount) {
        List<String> parameters = stub.getParameters();
        if (parameters.size() != expectedCount) {
            throw new ChaincodeException(
                    "Function " + stub.getFunction() + " expects " + expectedCount + " argument(s) but received " + parameters.size()
            );
        }
        return parameters.toArray(String[]::new);
    }

    private Response success(String payload) {
        return newSuccessResponse(payload.getBytes(StandardCharsets.UTF_8));
    }

    public static void main(String[] args) {
        new LandRegistryContract().start(args);
    }
}
