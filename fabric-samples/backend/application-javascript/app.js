'use strict';
const express = require('express');
const path = require('path');
const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('./AppUtil.js');
//const genericData=require('./GenericData.js');

const app = express();
const port = 3001;

const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');

async function enrollUsersFromRole(caClient, wallet, usersArray, roleDescription) {
	for (const user of usersArray) {
		const userId = user.u_id;
		const userRole = user.role;
		const capabilities = user.capabilities;

		try {
			await registerAndEnrollUser(caClient, wallet, mspOrg1, userId, 'org1.department1', userRole, capabilities);
			console.log(`Role: ${userRole} | Capability: ${capabilities}`);
			console.log(`Successfully enrolled ${roleDescription} ${userId}`);
		} catch (error) {
			console.error(`Failed to enroll ${roleDescription} ${userId}: ${error}`);
		}
	}
}

app.get('/enrollUsers/', async (req, res) => {
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);

		for (const role of genericData.GenericRoles) {
			await enrollUsersFromRole(caClient, wallet, [role], role.role);
		}

		res.json({ message: 'Users enrolled successfully' });
	} catch (error) {
		console.error(`Error enrolling users: ${error}`);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.get('/enrollAdmin/', async (req, res) => {
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);

		res.json({ message: 'success !' });
	} catch (error) {
		console.error(`Error : ${error}`);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
