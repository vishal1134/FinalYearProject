package com.landregistry.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.landregistry.backend.config.FabricGatewayProperties;
import com.landregistry.backend.dto.LandHistoryResponse;
import com.landregistry.backend.model.Land;

import io.grpc.ChannelCredentials;
import io.grpc.Grpc;
import io.grpc.ManagedChannel;
import io.grpc.TlsChannelCredentials;
import jakarta.annotation.PreDestroy;
import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.Gateway;
import org.hyperledger.fabric.client.identity.Identities;
import org.hyperledger.fabric.client.identity.Identity;
import org.hyperledger.fabric.client.identity.Signer;
import org.hyperledger.fabric.client.identity.Signers;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.PrivateKey;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class FabricGatewayService {
    private final FabricGatewayProperties properties;
    private final ObjectMapper objectMapper;

    private ManagedChannel grpcChannel;
    private Gateway gateway;

    public FabricGatewayService(FabricGatewayProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public boolean isEnabled() {
        return properties.isEnabled();
    }

    public void createLandRecord(Land land) {
        submitTransaction("createLandRecord", land.getId(), land.getOwnerId());
    }

    public void transferLand(String landId, String oldOwner, String newOwner) {
        submitTransaction("transferLand", landId, oldOwner, newOwner);
    }

    public List<LandHistoryResponse> getLandHistory(String landId) {
        try {
            byte[] response = getContract().evaluateTransaction("getLandHistory", landId);
            return objectMapper.readValue(response, new TypeReference<>() {});
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Failed to fetch land history from Fabric: " + exception.getMessage(),
                    exception
            );
        }
    }

    private byte[] submitTransaction(String transactionName, String... arguments) {
        try {
            return getContract().submitTransaction(transactionName, arguments);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Fabric transaction failed: " + exception.getMessage(),
                    exception
            );
        }
    }

    private synchronized Contract getContract() {
        if (!isEnabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Fabric integration is disabled");
        }

        if (gateway == null) {
            connect();
        }

        return gateway.getNetwork(properties.getChannelName()).getContract(properties.getChaincodeName());
    }

    private void connect() {
        validateConfiguration();

        try {
            grpcChannel = newGrpcConnection();
            gateway = newGateway(grpcChannel);
        } catch (Exception exception) {
            closeResources();
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Unable to connect to Fabric gateway: " + exception.getMessage(),
                    exception
            );
        }
    }

    private ManagedChannel newGrpcConnection() throws IOException {
        Path tlsCertPath = Path.of(properties.getTlsCertPath());
        ChannelCredentials credentials =
    TlsChannelCredentials.newBuilder()
        .trustManager(tlsCertPath.toFile())
        .build();

        String[] endpointParts = properties.getPeerEndpoint().split(":");
        if (endpointParts.length != 2) {
            throw new IllegalArgumentException("fabric.peer-endpoint must be in host:port format");
        }

        String host = endpointParts[0];
        int port = Integer.parseInt(endpointParts[1]);

        return Grpc.newChannelBuilderForAddress(host, port, credentials)
                .overrideAuthority(properties.getPeerHostAlias())
                .build();
    }

    private Gateway newGateway(ManagedChannel channel) throws IOException, CertificateException, InvalidKeyException {
        Identity identity = newIdentity();
        Signer signer = newSigner();

        return Gateway.newInstance()
                .identity(identity)
                .signer(signer)
                .connection(channel)
                .connect();
    }

    private Identity newIdentity() throws IOException, CertificateException {
        Path certificatePath = Path.of(properties.getCertificatePath());
        try (Reader certificateReader = Files.newBufferedReader(certificatePath, StandardCharsets.UTF_8)) {
            X509Certificate certificate = Identities.readX509Certificate(certificateReader);
            return new org.hyperledger.fabric.client.identity.X509Identity(properties.getMspId(), certificate);
        }
    }

   private Signer newSigner() throws IOException, InvalidKeyException {
    Path privateKeyPath = resolvePrivateKeyPath(properties.getPrivateKeyPath());

    try (Reader privateKeyReader = Files.newBufferedReader(privateKeyPath, StandardCharsets.UTF_8)) {

        PrivateKey privateKey;
        try {
            privateKey = Identities.readPrivateKey(privateKeyReader);
        } catch (InvalidKeyException e) {
            throw new RuntimeException("Invalid private key format", e);
        }

        return Signers.newPrivateKeySigner(privateKey);
    }
}

    private Path resolvePrivateKeyPath(String configuredPath) throws IOException {
        Path path = Paths.get(configuredPath);
        if (Files.isRegularFile(path)) {
            return path;
        }

        if (!Files.isDirectory(path)) {
            throw new IllegalStateException("Fabric private key path does not exist: " + configuredPath);
        }

        try (Stream<Path> children = Files.list(path)) {
            return children
                    .filter(Files::isRegularFile)
                    .filter(candidate -> {
                        String fileName = candidate.getFileName().toString().toLowerCase();
                        return fileName.endsWith(".pem") || fileName.endsWith("_sk");
                    })
                    .sorted(Comparator.comparing(candidate -> candidate.getFileName().toString()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException(
                            "No private key file found in directory: " + configuredPath
                    ));
        }
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(properties.getChannelName())
                || !StringUtils.hasText(properties.getChaincodeName())
                || !StringUtils.hasText(properties.getMspId())
                || !StringUtils.hasText(properties.getPeerEndpoint())
                || !StringUtils.hasText(properties.getPeerHostAlias())
                || !StringUtils.hasText(properties.getCertificatePath())
                || !StringUtils.hasText(properties.getPrivateKeyPath())
                || !StringUtils.hasText(properties.getTlsCertPath())) {
            throw new IllegalStateException("Fabric properties are incomplete. Check application.properties");
        }
    }

    @PreDestroy
    public void shutdown() {
        closeResources();
    }

    private void closeResources() {
        if (gateway != null) {
            gateway.close();
            gateway = null;
        }

        if (grpcChannel != null) {
            grpcChannel.shutdownNow();
            grpcChannel = null;
        }
    }
}
