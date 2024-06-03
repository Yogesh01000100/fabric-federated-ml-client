#!/bin/bash

# Navigate to the test network directory(Only home directory)
cd fabric-samples/test-network

# Bring down any existing network
./network.sh down

# Start the network with CA
./network.sh up -ca -s couchdb

# Set up channel between org1 and org2 "mychannel"
./network.sh createChannel

# Package the smart contract (JavaScript version)
cd ..
cd backend/chaincode-javascript
npm install
cd ../../test-network
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

peer lifecycle chaincode package basic.tar.gz --path ../backend/chaincode-javascript/ --lang node --label basic_1.0

# Install the chaincode on Org1 and Org2 peers
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:8001
peer lifecycle chaincode install basic.tar.gz

export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:10004
peer lifecycle chaincode install basic.tar.gz


# Query installed chaincode to get package ID and extract the package ID
PACKAGE_ID_OUTPUT=$(peer lifecycle chaincode queryinstalled)
CC_PACKAGE_ID=$(echo $PACKAGE_ID_OUTPUT | grep -oP 'Package ID: \K[^,]+')


# Export the chaincode package ID
export CC_PACKAGE_ID=$CC_PACKAGE_ID


peer lifecycle chaincode approveformyorg -o localhost:8000 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# Approve the chaincode definition for Org1
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:8001

# peer lifecycle chaincode approveformyorg
peer lifecycle chaincode approveformyorg -o localhost:8000 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"


# Committing the chaincode definition to the channel
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name basic --version 1.0 --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --output json


# peer lifecycle chaincode commit command
peer lifecycle chaincode commit -o localhost:8000 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --peerAddresses localhost:8001 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:10004 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"


# peer lifecycle chaincode querycommitted command
peer lifecycle chaincode querycommitted --channelID mychannel --name basic --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"


# Invoke the chaincode
peer chaincode invoke -o localhost:8000 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n basic --peerAddresses localhost:8001 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:10004 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"initLedger","Args":[]}'


# Query the chaincode
# peer chaincode query -C mychannel -n basic -c '{"Args":["GetMyProfilePatient","ab04032a-af7c-51b9-b661-14304ee96848"]}'