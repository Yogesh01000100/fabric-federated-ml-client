import { Gateway, Wallets } from 'fabric-network';
import path from 'path';
import fs from 'fs';
import os from 'os';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const walletPath = path.join(__dirname, 'wallet');
const homeDirectory = os.homedir();
const gateways = {};

export const initializeGateways = async (userIds) => {
    const ccpPath = `${homeDirectory}/fabric-federated-ml-client/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json`;
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    for (let userId of userIds) {
        try {
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: userId,
                discovery: { enabled: true, asLocalhost: true },
            });
            gateways[userId] = gateway;
        } catch (error) {
            console.error(`Failed to initialize gateway for user ${userId}:`, error);
        }
    }
};

// Correct way to export an already declared variable
export { gateways };
