# Fabric Demo Runbook

This runbook is the safest path for the presentation when you want transaction history to come from Hyperledger Fabric.

## What gets stored where

- MongoDB:
  - users
  - land metadata
  - pending transfer requests
- Hyperledger Fabric:
  - initial verified land ownership
  - approved ownership transfers
  - immutable land history returned by `GET /api/history/{landId}`

## Current code path

- Verifying land calls Fabric `createLandRecord(...)`
- Approving a transfer calls Fabric `transferLand(...)`
- Fetching history calls Fabric `getLandHistory(...)`
- This happens only when `fabric.enabled=true`

## Before the demo

1. Make sure MongoDB is running on `localhost:27017`
2. Start Docker Desktop
3. Start Ubuntu WSL
4. Confirm Fabric test network is available in WSL

## 1. Start Fabric network in WSL

Inside Ubuntu WSL:

```bash
cd ~/fabric-samples/test-network
./network.sh down
./network.sh up createChannel -ca
```

## 2. Deploy the chaincode

If not already copied:

```bash
mkdir -p ~/land-registry-chaincode
cp -r /mnt/c/Users/janan/OneDrive/Documents/FinalYearProject/fabric-chaincode/land-registry-java ~/land-registry-chaincode/
```

Deploy:

```bash
cd ~/fabric-samples/test-network
./network.sh deployCC \
  -ccn landregistry \
  -ccp ~/land-registry-chaincode/land-registry-java \
  -ccl java
```

## 3. Export backend Fabric variables in WSL or Windows terminal

Use the User1 identity paths from the Fabric test network.

WSL example:

```bash
export FABRIC_ENABLED=true
export FABRIC_CHANNEL_NAME=mychannel
export FABRIC_CHAINCODE_NAME=landregistry
export FABRIC_MSP_ID=Org1MSP
export FABRIC_PEER_ENDPOINT=localhost:7051
export FABRIC_PEER_HOST_ALIAS=peer0.org1.example.com
export FABRIC_CERTIFICATE_PATH=/home/<your-user>/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/cert.pem
export FABRIC_PRIVATE_KEY_PATH=/home/<your-user>/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore
export FABRIC_TLS_CERT_PATH=/home/<your-user>/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
```

Notes:

- `FABRIC_PRIVATE_KEY_PATH` may now be either the exact key file or the `keystore` directory.
- If the backend runs on Windows while Fabric runs inside WSL, use Windows-accessible paths only if those files are reachable from the Windows JVM. The simplest demo setup is to run Spring Boot in WSL too, or copy the certs to a Windows-readable folder.

## 4. Start the backend in Fabric mode

From `Land-Registry-Backend`:

```powershell
& 'C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.1.3\plugins\maven\lib\maven3\bin\mvn.cmd' -s '..\temp-settings.xml' spring-boot:run "-Dspring-boot.run.profiles=fabric-demo"
```

Or run the jar:

```powershell
java -jar .\target\backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=fabric-demo
```

## 5. Start the frontend

From `Land-Registry-Frontend`:

```powershell
$env:VITE_API_BASE_URL='http://localhost:8080/api'
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

## 6. Exact demo flow

1. Login as owner
2. Register a land record
3. Login as admin
4. Verify that land
   - this writes the initial ownership record to Fabric
5. Login as owner again
6. Request transfer to another buyer
7. Login as admin
8. Approve the transfer
   - this writes the ownership change to Fabric
9. Open history for that land
   - backend reads immutable transaction history from Fabric

Expected history sequence:

- `REGISTERED_AND_VERIFIED`
- `TRANSFERRED`

## 7. Quick direct Fabric validation

Inside WSL:

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

Query a specific land ID:

```bash
peer chaincode query \
  -C mychannel \
  -n landregistry \
  -c '{"Args":["getLandHistory","<LAND_ID_FROM_APP>"]}'
```

## 8. If the demo must be very safe

Use this fallback order:

1. First show the app with `fabric.enabled=false` if infrastructure is unstable
2. Then switch to the Fabric demo only after Docker, WSL, and peer containers are confirmed healthy
3. Keep one pre-verified land ready so you can jump straight to transfer approval and history

## 9. Known environment blockers on this machine

During diagnostics from this workspace:

- `wsl -l -v` returned access denied
- Docker daemon was not reachable from this terminal

That means the application code is ready, but the live Fabric demo still depends on you starting WSL/Docker correctly on the host before the presentation.
