import { create } from 'kubo-rpc-client';
import fs from 'fs';

const client = create();

async function uploadContentToIPFS(filePath) {
    console.time("Upload Time");
    try {
        const fileContent = fs.readFileSync(filePath);
        const { cid } = await client.add(fileContent);
        console.log(`File uploaded with CID: ${cid}`);
        return cid;
    } catch (error) {
        console.error(`Failed to upload content to IPFS: ${error}`);
    } finally {
        console.timeEnd("Upload Time");
    }
}

async function fetchContentFromIPFS(cid) {
    console.time("Fetch and Write Time");
    try {
        let data = [];
        for await (const chunk of client.cat(cid)) {
            data.push(chunk);
        }
        const fileContent = Buffer.concat(data);
        fs.writeFileSync('encrypted_data.dat', fileContent);
        console.log('done');
    } catch (error) {
        console.error(`Failed to fetch content from IPFS: ${error}`);
    } finally {
        console.timeEnd("Fetch and Write Time");
    }
}

async function handleIPFS(filePath) {
    const cid = await uploadContentToIPFS(filePath);
    if (cid) {
        await fetchContentFromIPFS(cid);
    }
}

handleIPFS('sample.csv').catch(console.error);
