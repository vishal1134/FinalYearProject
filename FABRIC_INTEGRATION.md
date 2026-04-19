# Land Registry Fabric Integration

This repo now contains:

- Java chaincode at `fabric-chaincode/land-registry-java`
- Spring Boot Fabric gateway integration in `Land-Registry-Backend`
- History API wired to Fabric when `fabric.enabled=true`

## 1. Fix Docker permission in WSL

Run inside Ubuntu WSL:

```bash
groups
ls -l /var/run/docker.sock
sudo usermod -aG docker $USER
newgrp docker
docker version
docker ps
```

If `docker ps` still fails, restart WSL and Docker Desktop, then retry:

```powershell
wsl --shutdown
```

Back in Ubuntu:

```bash
docker ps
```

If the socket group is still wrong:

```bash
sudo chgrp docker /var/run/docker.sock
sudo chmod 660 /var/run/docker.sock
docker ps
```

## 2. Install Fabric binaries and images

```bash
cd ~
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.12 1.5.15
cd ~/fabric-samples
ls bin
docker images | grep hyperledger
```

## 3. Start the test network

```bash
cd ~/fabric-samples/test-network
./network.sh down
./network.sh up createChannel -ca
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## 4. Copy chaincode into WSL

```bash
mkdir -p ~/land-registry-chaincode
cp -r /mnt/c/Users/janan/OneDrive/Documents/FinalYearProject/fabric-chaincode/land-registry-java ~/land-registry-chaincode/
cd ~/land-registry-chaincode/land-registry-java
ls
```

## 5. Deploy Java chaincode

```bash
cd ~/fabric-samples/test-network
./network.sh deployCC \
  -ccn landregistry \
  -ccp ~/land-registry-chaincode/land-registry-java \
  -ccl java
```

## 6. Quick chaincode test

```bash
cd ~/fabric-samples/test-network
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

Create initial verified land record:

```bash
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  -C mychannel \
  -n landregistry \
  -c '{"Args":["createLandRecord","LAND-1001","ownerA"]}'
```

Transfer ownership:

```bash
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  -C mychannel \
  -n landregistry \
  -c '{"Args":["transferLand","LAND-1001","ownerA","ownerB"]}'
```

Read history:

```bash
peer chaincode query \
  -C mychannel \
  -n landregistry \
  -c '{"Args":["getLandHistory","LAND-1001"]}'
```

## 7. Configure Spring Boot

Update `Land-Registry-Backend/src/main/resources/application.properties` with valid paths for the machine that runs Spring Boot.

Example for WSL/Linux:

```properties
fabric.enabled=true
fabric.channel-name=mychannel
fabric.chaincode-name=landregistry
fabric.msp-id=Org1MSP
fabric.peer-endpoint=localhost:7051
fabric.peer-host-alias=peer0.org1.example.com
fabric.certificate-path=/home/<your-user>/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/cert.pem
fabric.private-key-path=/home/<your-user>/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/<private-key-file>
fabric.tls-cert-path=/home/<your-user>/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
```

## 8. API flow

1. `POST /api/transfers` stores the owner request in MongoDB with `PENDING_APPROVAL`
2. `PUT /api/transfers/{id}/approve` submits `transferLand()` to Fabric
3. On success, MongoDB land owner is updated and the request becomes `APPROVED_AND_COMMITTED`
4. `GET /api/history/{landId}` reads immutable history from Fabric

## 9. Storage split

Keep in MongoDB:

- users
- land metadata
- pending transfer requests

Keep in Fabric:

- verified land ownership baseline
- ownership transfers
- immutable ownership history
