# Fabric Premium Food Safety Traceability System

[中文文档](README_zh.md)

This is a project based on Hyperledger Fabric v2.2, designed to record the entire lifecycle of premium food products from production to sale on the blockchain. It provides a traceability feature for consumers via batch ID scanning.

## Tech Stack

- **Blockchain**: Hyperledger Fabric v2.2
- **Smart Contract (Chaincode)**: Go
- **Backend API**: Node.js v18.x, Express, Fabric SDK v2.2
- **Frontend Application**: Node.js v20.x, React, Vite, Ant Design, Axios
- **Environment**: Docker / Docker Compose, WSL2 (Ubuntu)

---

## Local Setup Guide

This guide assumes you are running the project in a fresh Linux-like environment (e.g., WSL2 Ubuntu).

### 1. Environment Preparation (First Run)

Ensure all necessary tools are installed on your system.

1.  **Update package lists**:

    ```bash
    sudo apt update
    sudo apt install -y git curl wget
    ```

2.  **Install Docker and Docker Compose**:
    - It is highly recommended to install **Docker Desktop for Windows**.
    - In Docker Desktop, go to `Settings > Resources > WSL Integration` and ensure integration is enabled for your WSL2 distribution.
    - Verify installation:
      ```bash
      docker --version
      docker-compose --version
      ```

3.  **Install NVM (Node Version Manager)**:
    - This is a critical step as the backend (v18) and frontend (v20) require different Node.js versions.

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    ```

4.  **Install Node.js v18 and v20**:

    ```bash
    nvm install 18
    nvm install 20
    ```

5.  **Install Go (for Fabric tools)**:

    ```bash
    wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.profile
    echo 'export GOPATH=$HOME/go' >> ~/.profile
    source ~/.profile
    go version
    ```

6.  **Download Fabric Tools and Images**:
    - Run the included `install-fabric.sh` script to pull the required Docker images.
    ```bash
    chmod +x install-fabric.sh
    ./install-fabric.sh docker
    ```

### 2. Install Project Dependencies (First Run)

1.  **Install Backend (API Server) Dependencies**:

    ```bash
    cd api-server
    nvm use 18
    npm install
    cd ..
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    cd frontend
    nvm use 20
    npm install
    cd ..
    ```

### 3. Deploy Blockchain Network (First Run)

You need to start a fresh Fabric network and deploy the chaincode.

1.  **Start Fabric Network Containers**:

    ```bash
    cd network
    docker-compose -f docker-compose-net.yaml up -d
    cd ..
    ```

2.  **Enter CLI Container for Deployment**:

    ```bash
    docker exec -it cli bash
    ```

3.  **Execute Deployment Commands inside CLI**:
    **Execute All Following Commands Inside the CLI Container**:

    ```bash
    # 1. Set environment variable
    export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem


    # 2. Create channel
    peer channel create -o orderer.example.com:7050 \
    -c foodchannel \
    -f ./channel-artifacts/foodchannel.tx \
    --outputBlock ./channel-artifacts/foodchannel.block \
    --tls --cafile $ORDERER_CA


    # 3. Join channel (default environment: Supplier org)
    peer channel join -b ./channel-artifacts/foodchannel.block


    # Processor
    export CORE_PEER_ADDRESS=peer0.processor.example.com:8051
    export CORE_PEER_LOCALMSPID=ProcessorMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/processor.example.com/peers/peer0.processor.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/processor.example.com/users/Admin@processor.example.com/msp
    peer channel join -b ./channel-artifacts/foodchannel.block


    # Logistics
    export CORE_PEER_ADDRESS=peer0.logistics.example.com:9051
    export CORE_PEER_LOCALMSPID=LogisticsMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/logistics.example.com/peers/peer0.logistics.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/logistics.example.com/users/Admin@logistics.example.com/msp
    peer channel join -b ./channel-artifacts/foodchannel.block


    # Retailer
    export CORE_PEER_ADDRESS=peer0.retailer.example.com:10051
    export CORE_PEER_LOCALMSPID=RetailerMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.example.com/peers/peer0.retailer.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.example.com/users/Admin@retailer.example.com/msp
    peer channel join -b ./channel-artifacts/foodchannel.block


    # 4. Update anchor peers

    # Retailer
    peer channel update -o orderer.example.com:7050 \
    -c foodchannel \
    -f ./channel-artifacts/RetailerMSPanchors.tx \
    --tls --cafile $ORDERER_CA


    # Supplier
    export CORE_PEER_ADDRESS=peer0.supplier.example.com:7051
    export CORE_PEER_LOCALMSPID=SupplierMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/supplier.example.com/peers/peer0.supplier.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/supplier.example.com/users/Admin@supplier.example.com/msp
    peer channel update -o orderer.example.com:7050 \
    -c foodchannel \
    -f ./channel-artifacts/SupplierMSPanchors.tx \
    --tls --cafile $ORDERER_CA


    # Processor
    export CORE_PEER_ADDRESS=peer0.processor.example.com:8051
    export CORE_PEER_LOCALMSPID=ProcessorMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/processor.example.com/peers/peer0.processor.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/processor.example.com/users/Admin@processor.example.com/msp
    peer channel update -o orderer.example.com:7050 \
    -c foodchannel \
    -f ./channel-artifacts/ProcessorMSPanchors.tx \
    --tls --cafile $ORDERER_CA


    # Logistics
    export CORE_PEER_ADDRESS=peer0.logistics.example.com:9051
    export CORE_PEER_LOCALMSPID=LogisticsMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/logistics.example.com/peers/peer0.logistics.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/logistics.example.com/users/Admin@logistics.example.com/msp
    peer channel update -o orderer.example.com:7050 \
    -c foodchannel \
    -f ./channel-artifacts/LogisticsMSPanchors.tx \
    --tls --cafile $ORDERER_CA


    # 5. Package chaincode
    cd /opt/gopath/src/github.com/chaincode
    peer lifecycle chaincode package foodtrace.v1.tar.gz \
    --path . \
    --lang golang \
    --label foodtrace_v1


    # 6. Install chaincode (for each organization)

    peer lifecycle chaincode install foodtrace.v1.tar.gz


    # Supplier
    export CORE_PEER_ADDRESS=peer0.supplier.example.com:7051
    export CORE_PEER_LOCALMSPID=SupplierMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/supplier.example.com/peers/peer0.supplier.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/supplier.example.com/users/Admin@supplier.example.com/msp
    peer lifecycle chaincode install foodtrace.v1.tar.gz


    # Processor
    export CORE_PEER_ADDRESS=peer0.processor.example.com:8051
    export CORE_PEER_LOCALMSPID=ProcessorMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/processor.example.com/peers/peer0.processor.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/processor.example.com/users/Admin@processor.example.com/msp
    peer lifecycle chaincode install foodtrace.v1.tar.gz


    # Retailer
    export CORE_PEER_ADDRESS=peer0.retailer.example.com:10051
    export CORE_PEER_LOCALMSPID=RetailerMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.example.com/peers/peer0.retailer.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.example.com/users/Admin@retailer.example.com/msp
    peer lifecycle chaincode install foodtrace.v1.tar.gz


    # 7. Query Package ID
    peer lifecycle chaincode queryinstalled

    # Manually copy the Package ID from the output
    export CC_PACKAGE_ID=foodtrace_v1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


    # 8. Approve chaincode (for each organization)
    peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID foodchannel \
    --name foodtrace \
    --version 1 \
    --package-id $CC_PACKAGE_ID \
    --sequence 1 \
    --tls --cafile $ORDERER_CA


    # 9. Commit chaincode
    peer lifecycle chaincode commit \
    -o orderer.example.com:7050 \
    --channelID foodchannel \
    --name foodtrace \
    --version 1 \
    --sequence 1 \
    --tls --cafile $ORDERER_CA \
    --peerAddresses peer0.supplier.example.com:7051 \
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/supplier.example.com/peers/peer0.supplier.example.com/tls/ca.crt \
    --peerAddresses peer0.processor.example.com:8051 \
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/processor.example.com/peers/peer0.processor.example.com/tls/ca.crt \
    --peerAddresses peer0.logistics.example.com:9051 \
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/logistics.example.com/peers/peer0.logistics.example.com/tls/ca.crt \
    --peerAddresses peer0.retailer.example.com:10051 \
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.example.com/peers/peer0.retailer.example.com/tls/ca.crt


    # 10. Verify chaincode containers
    echo "Wait 30 seconds for all chaincode containers to start..."
    sleep 30
    docker ps --format "{{.Names}}" | grep dev-peer


    # 11. Exit CLI
    exit
    ```

4.  **Initialize API Wallet (First Run)**:

    ```bash
    cd api-server
    nvm use 18
    node importIdentities.js
    cd ..
    ```

### 4. Start the Application

1.  **Start Backend**:

    ```bash
    cd api-server
    nvm use 18
    node server.js
    ```

2.  **Start Frontend**:
    ```bash
    cd frontend
    nvm use 20
    npm run dev
    ```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
