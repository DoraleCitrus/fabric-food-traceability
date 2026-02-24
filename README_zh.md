# Fabric 高端食品安全溯源系统

[English Documentation](README.md)

这是一个基于 Hyperledger Fabric v2.2 的项目，旨在实现高端食品从生产到销售全过程的信息上链，并为消费者提供扫码溯源功能。

## 技术栈

- **区块链**: Hyperledger Fabric v2.2
- **智能合约 (Chaincode)**: Go
- **后端 API**: Node.js v18.x, Express, Fabric SDK v2.2
- **前端应用**: Node.js v20.x, React, Vite, Ant Design, Axios
- **运行环境**: Docker / Docker Compose, WSL2 (Ubuntu)

---

## 本地启动指南

本指南假定你已获得项目完整压缩包，并在一个全新的类 Linux 环境（如 WSL2 Ubuntu）中解压。

### 一、环境准备 (首次运行)

在开始之前，你必须在系统中安装好所有必要的工具。

1.  **更新软件源**:

    ```bash
    sudo apt update
    sudo apt install -y git curl wget
    ```

2.  **安装 Docker 和 Docker Compose**:
    - 强烈建议安装 **Docker Desktop for Windows**。
    - 在 Docker Desktop 的 `Settings > Resources > WSL Integration` 中，确保为你正在使用的 WSL2 发行版（如 Ubuntu）**启用集成**。
    - 验证安装：
      ```bash
      docker --version
      docker-compose --version
      ```

3.  **安装 NVM (Node 版本管理器)**:
    - 这是关键步骤，因为后端 (v18) 和前端 (v20) 使用不同的 Node.js 版本。

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    ```

4.  **安装 Node.js v18 和 v20**:

    ```bash
    nvm install 18
    nvm install 20
    ```

5.  **安装 Go (用于 Fabric 工具)**:

    ```bash
    wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.profile
    echo 'export GOPATH=$HOME/go' >> ~/.profile
    source ~/.profile
    go version
    ```

6.  **下载 Fabric 工具和镜像**:
    - 运行项目包含的 `install-fabric.sh` 脚本来拉取所有 Fabric 运行所需的 Docker 镜像。
    ```bash
    chmod +x install-fabric.sh
    ./install-fabric.sh docker
    ```

### 二、安装项目依赖 (首次运行)

1.  **安装后端 (API Server) 依赖**:

    ```bash
    cd api-server
    nvm use 18
    npm install
    cd ..
    ```

2.  **安装前端 (Frontend) 依赖**:
    ```bash
    cd frontend
    nvm use 20
    npm install
    cd ..
    ```

### 三、部署区块链网络 (首次运行)

你需要启动一个全新的 Fabric 网络，并完成链码的部署。

1.  **启动 Fabric 网络容器**:

    ```bash
    cd network
    docker-compose -f docker-compose-net.yaml up -d
    cd ..
    ```

2.  **进入 CLI 容器执行部署**:

    ```bash
    docker exec -it cli bash
    ```

3.  **执行部署命令**:
    **在 CLI 容器内执行以下所有命令**:

    ```bash
    # 1. 设置环境变量
    export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

    # 2. 创建通道
    peer channel create -o orderer.example.com:7050 \
    -c foodchannel \
    -f ./channel-artifacts/foodchannel.tx \
    --outputBlock ./channel-artifacts/foodchannel.block \
    --tls --cafile $ORDERER_CA

    # 3. 加入通道 (默认是 Supplier 组织环境)
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


    # 4. 更新锚节点

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


    # 5. 打包链码
    cd /opt/gopath/src/github.com/chaincode
    peer lifecycle chaincode package foodtrace.v1.tar.gz \
    --path . \
    --lang golang \
    --label foodtrace_v1


    # 6. 安装链码（每个组织）

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


    # 7. 查询 Package ID
    peer lifecycle chaincode queryinstalled

    # 手动复制 Package ID
    export CC_PACKAGE_ID=foodtrace_v1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


    # 8. 批准链码（每个组织）

    peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID foodchannel \
    --name foodtrace \
    --version 1 \
    --package-id $CC_PACKAGE_ID \
    --sequence 1 \
    --tls --cafile $ORDERER_CA


    # 9. 提交链码
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


    # 10. 验证链码容器
    echo "等待30秒, 让所有链码容器启动..."
    sleep 30
    docker ps --format "{{.Names}}" | grep dev-peer

    # 11. 退出 CLI
    exit
    ```

> **注意**：步骤 `7. 批准链码` 需要你手动从 `peer lifecycle chaincode queryinstalled` 的输出中复制 `Package ID`。

4.  **初始化 API 钱包(首次运行)**:
    在区块链网络和链码部署完毕后，你需要为 API 服务器生成它所需的身份钱包。

    ```bash
    cd api-server
    nvm use 18
    # 这个脚本会读取 network/crypto-config/ 目录
    node importIdentities.js
    cd ..
    ```

### 四、启动应用

1.  **启动后端**:

    ```bash
    cd api-server
    nvm use 18
    node server.js
    ```

2.  **启动前端**:
    ```bash
    cd frontend
    nvm use 20
    npm run dev
    ```

## 开源协议

本项目采用 Apache License 2.0 协议开源 - 详情请查看 [LICENSE](LICENSE) 文件。
