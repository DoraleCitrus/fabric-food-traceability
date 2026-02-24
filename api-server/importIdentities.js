/*
 * importIdentities.js
 *
 * 从 network/crypto-config 目录中读取 Admin 身份
 * 并导入到 api-server/wallet 目录中，供 Fabric SDK 使用。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');

const orgs = [
    { name: 'Supplier', mspId: 'SupplierMSP', domain: 'supplier.example.com' },
    { name: 'Processor', mspId: 'ProcessorMSP', domain: 'processor.example.com' },
    { name: 'Logistics', mspId: 'LogisticsMSP', domain: 'logistics.example.com' },
    { name: 'Retailer', mspId: 'RetailerMSP', domain: 'retailer.example.com' },
];

const cryptoConfigDir = path.resolve(__dirname, '..', 'network', 'crypto-config', 'peerOrganizations');
const walletPath = path.join(__dirname, 'wallet');

async function main() {
    try {
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`钱包目录位于: ${walletPath}`);

        for (const org of orgs) {
            const identityLabel = `${org.name}Admin`;
            console.log(`正在处理组织: ${org.name}, 身份: ${identityLabel}`);

            const identity = await wallet.get(identityLabel);
            if (identity) {
                console.log(`身份 ${identityLabel} 已存在于钱包中`);
                continue;
            }

            const certDir = path.join(cryptoConfigDir, org.domain, 'users', `Admin@${org.domain}`, 'msp', 'signcerts');
            const certFile = fs.readdirSync(certDir).find(file => file.endsWith('-cert.pem'));
            if (!certFile) {
                console.error(`错误: 找不到 ${org.name} 的 Admin 证书`);
                continue;
            }
            const certPath = path.join(certDir, certFile);
            const certificate = fs.readFileSync(certPath, 'utf8');

            const keyDir = path.join(cryptoConfigDir, org.domain, 'users', `Admin@${org.domain}`, 'msp', 'keystore');
            const keyFile = fs.readdirSync(keyDir).find(file => file.endsWith('_sk'));
            if (!keyFile) {
                console.error(`错误: 找不到 ${org.name} 的 Admin 私钥`);
                continue;
            }
            const keyPath = path.join(keyDir, keyFile);
            const privateKey = fs.readFileSync(keyPath, 'utf8');

            const x509Identity = {
                credentials: {
                    certificate: certificate,
                    privateKey: privateKey,
                },
                mspId: org.mspId,
                type: 'X.509',
            };

            await wallet.put(identityLabel, x509Identity);
            console.log(`成功将 ${identityLabel} 导入钱包`);
        }
    } catch (error) {
        console.error(`导入身份时发生错误: ${error}`);
        process.exit(1);
    }
}

main();