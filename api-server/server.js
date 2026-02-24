/*
 * server.js
 */

'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Gateway, Wallets } = require('fabric-network');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const channelName = 'foodchannel';
const chaincodeName = 'foodtrace';

const walletPath = path.join(__dirname, 'wallet');
const ccpPath = path.join(__dirname, 'connection-profile.json');

const connectionPool = {}; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

async function getContractForOrg(orgName) {
    if (connectionPool[orgName]) {
        return connectionPool[orgName].contract;
    }

    console.log(`[系统] 建立 ${orgName} 的连接...`);

    const identityLabel = `${orgName}Admin`;
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(ccpJSON);
    ccp.client.organization = orgName;

    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get(identityLabel);
    if (!identity) {
        throw new Error(`身份 ${identityLabel} 未找到`);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: identityLabel,
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    connectionPool[orgName] = { gateway, contract };

    console.log(`[系统] ${orgName} 连接已建立`);
    return contract;
}

async function initAllConnections() {
    console.log('--- 初始化 Fabric 连接池 ---');
    const orgs = ['Supplier', 'Processor', 'Logistics', 'Retailer'];
    try {
        await Promise.all(orgs.map(org => getContractForOrg(org)));
        console.log('--- 连接池初始化完成 ---');
    } catch (err) {
        console.error('连接初始化失败:', err.message);
    }
}

app.get('/api/queryFood/:id', async (req, res) => {
    try {
        const contract = await getContractForOrg('Supplier');
        const result = await contract.evaluateTransaction('QueryFood', req.params.id);
        res.status(200).json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/getFoodHistory/:id', async (req, res) => {
    try {
        const contract = await getContractForOrg('Supplier');
        const result = await contract.evaluateTransaction('GetFoodHistory', req.params.id);
        res.status(200).json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/createFood', async (req, res) => {
    const { org, id, origin, details } = req.body;
    if (org !== 'Supplier') return res.status(403).json({ error: '权限不足' });

    try {
        const contract = await getContractForOrg(org);
        await contract.submitTransaction('CreateFood', id, origin, details);
        res.status(201).json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/updateFoodStatus', async (req, res) => {
    const { org, id, newStatus, newDetails } = req.body;
    try {
        const contract = await getContractForOrg(org);
        await contract.submitTransaction('UpdateFoodStatus', id, newStatus, newDetails);
        res.status(200).json({ success: true, id, status: newStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Fabric API Server running on port ${PORT}`);
    initAllConnections();
});

process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...');
    for (const [org, conn] of Object.entries(connectionPool)) {
        console.log(`断开 ${org} 连接...`);
        conn.gateway.disconnect();
    }
    process.exit();
});