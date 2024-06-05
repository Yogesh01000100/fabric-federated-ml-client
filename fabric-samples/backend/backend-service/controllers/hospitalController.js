import { gateways } from "../network/fabricNetwork.js";
import { create } from "kubo-rpc-client";
import { spawn } from "child_process";
import axios from "axios";
import fs from 'fs';
import os from 'os';
import csv from 'csv-parser';
import csvWriter from "csv-write-stream";


const homeDirectory = os.homedir();
const client = create();

function pythonFunction() {
  return new Promise((resolve, reject) => {
    const border = '#################################################################';
    const pythonProcess = spawn("python3", [
      `${homeDirectory}/fabric-federated-ml-client/fabric-samples/backend/backend-service/controllers/blk-client-1.py`,
    ]);

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(`Python script exited with code ${code}`);
      } else {
        console.log(border);
        console.log('#---------------------- DGX server response---------------------#');
        console.log(border);
        resolve('Python script called successfully.');
      }
    });
  });
}

export const uploadEHR = async (req, res) => {
  try {
    const channelName = "mychannel";
    const chaincodeName = "basic";
    const filePath = `${homeDirectory}/fabric-federated-ml-client/fabric-samples/backend/backend-service/controllers/Diabetes_Classification_1_1000.csv`;
    const gateway = gateways["admin"];

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const updatePromises = results.map(async (record, index) => {
          const patientId = `patient_${parseInt(record.Patient_ID, 10) + 1}`;
          const fileBuffer = Buffer.from(JSON.stringify(record), 'utf-8');

          try {
            const { cid } = await client.add(fileBuffer);
            console.log(`Data for ${patientId} added to IPFS with CID: ${cid}`);

            const patientData = {
                disease: {
                    diabetes: cid.toString()  // Adding the disease tag with IPFS CID
                }
            };

            await contract.submitTransaction('UploadEHR', patientId, JSON.stringify(patientData));
            return { patientId, cid: cid.toString() };
          } catch (ipfsError) {
            console.error(`IPFS error for patient ${patientId}: ${ipfsError.message}`);
            return null;
          }
        });

        const updates = await Promise.all(updatePromises);
        const successfulUpdates = updates.filter(update => update != null);
        res.json({
          success: true,
          updates: successfulUpdates,
          message: "All data uploaded successfully!"
        });
      });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};


export const FetchAllRecords = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const gateway = gateways["admin"];

  try {
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction("FetchAllRecords");
    const resultsJson = JSON.parse(result.toString());

    const fetchedRecords = [];

    for (const record of resultsJson) {
      const cid = record.disease.diabetes;
      try {
        const fileContent = await fetchContentFromIPFS(cid);
        const recordData = JSON.parse(fileContent.toString());
        fetchedRecords.push(recordData);
      } catch (fetchError) {
        console.error(`Failed to fetch or parse content for CID ${cid}: ${fetchError.message}`);
      }
    }

    // Sort records by Patient_ID before writing to CSV
    fetchedRecords.sort((a, b) => parseInt(a.Patient_ID) - parseInt(b.Patient_ID));

    const fields = ["Patient_ID", "Cholesterol", "Glucose", "HDL_Chol", "Chol/HDL ratio", "Age", "Gender", "Height", "Weight", "BMI", "Systolic BP", "Diastolic BP", "waist", "hip", "Waist/hip ratio", "Diabetes"];
    const csvFilePath = './retrieved_data_set.csv';
    const writer = csvWriter({ headers: fields });
    writer.pipe(fs.createWriteStream(csvFilePath));

    fetchedRecords.forEach(record => {
      writer.write(record);
    });

    writer.end();

    res.json({
      success: true,
      message: "All diabetes records retrieved successfully, with detailed data from IPFS!",
      filePath: csvFilePath
    });
  } catch (error) {
    console.error(`Failed to retrieve diabetes records: ${error}`);
    res.status(500).json({ error: error.message });
  }
};


async function fetchContentFromIPFS(cid) {
  const data = [];
  for await (const chunk of client.cat(cid)) {
    data.push(chunk);
  }
  return Buffer.concat(data);
}


export const processData = async (req, res) => {
  try {
    const result = await pythonFunction();
    res.status(200).json({
      success: true,
      message: result
    });
  } catch (error) {
    console.error('Failed to execute Python script:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute Python script',
      error: error.toString()
    });
  }
};


export const getHospitalRole10 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  const keychainrefId = req.query.keychainrefId;
  //console.log("gateways in controller: ", fabricNetwork.gateways);
  const gateway = fabricNetwork.gateways[userId];
  //console.log("user gateway->", gateway);
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    //console.log(gateways[userId]);
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    // if keychain id is same then proceed with these if not matching or it has a different keychain_id more than 1 then forward the req
    // to the cactus server-> if else condition
    //const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb?keychainrefId=${keychainrefId}`;
    //const response = await axios.get(apiUrl);
    //const responseData = response.data;
    //console.log("data received! : ", responseData, "count : ", (count += 1));

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction("commonFunction1");
    const resultJson = JSON.parse(result.toString());
    console.log("data : ", resultJson, "count: ", (count += 1));
    res.json({
      success: true,
      message: "Hospital data retrieved successfully!",
      data: responseData,
    });
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalRole20 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  //console.log("gateways in controller: ", fabricNetwork.gateways);
  const gateway = fabricNetwork.gateways[userId];
  //console.log("user gateway->", gateway);
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    //console.log(gateways[userId]);
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    // if keychain id is same then proceed with these if not matching or it has a different keychain_id more than 1 then forward the req
    // to the cactus server-> if else condition
    const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-my-profile-patient-hspb?user_id=${userId}`;
    const response = await axios.get(apiUrl);
    const responseData = response.data;
    console.log("data received! : ", responseData);

    /*const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction('commonFunction1');
    const resultJson = JSON.parse(result.toString());
    console.log('data : ', resultJson, 'count: ', (count += 1));
    res.json({
      success: true,
      message: 'Hospital data retrieved successfully!',
      data: resultJson,
    }); */
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalRole30 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  //console.log("gateways in controller: ", fabricNetwork.gateways);
  const gateway = fabricNetwork.gateways[userId];
  //console.log("user gateway->", gateway);
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    //console.log(gateways[userId]);
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    // if keychain id is same then proceed with these if not matching or it has a different keychain_id more than 1 then forward the req
    // to the cactus server-> if else condition
    const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-my-profile-patient-hspb?user_id=${userId}`;
    const response = await axios.get(apiUrl);
    const responseData = response.data;
    console.log("data received! : ", responseData);

    /*const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction('commonFunction1');
    const resultJson = JSON.parse(result.toString());
    console.log('data : ', resultJson, 'count: ', (count += 1));
    res.json({
      success: true,
      message: 'Hospital data retrieved successfully!',
      data: resultJson,
    }); */
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalRole40 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  //console.log("gateways in controller: ", fabricNetwork.gateways);
  const gateway = fabricNetwork.gateways[userId];
  //console.log("user gateway->", gateway);
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    // console.log(gateways[userId]);
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    // if keychain id is same then proceed with these if not matching or it has a different keychain_id more than 1 then forward the req
    // to the cactus server-> if else condition
    const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-my-profile-patient-hspb?user_id=${userId}`;
    const response = await axios.get(apiUrl);
    const responseData = response.data;
    console.log("data received! : ", responseData);

    /*const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction('commonFunction1');
    const resultJson = JSON.parse(result.toString());
    console.log('data : ', resultJson, 'count: ', (count += 1));
    res.json({
      success: true,
      message: 'Hospital data retrieved successfully!',
      data: resultJson,
    }); */
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalRole50 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  const gateway = fabricNetwork.gateways[userId];
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction("commonFunction1");
    const resultJson = JSON.parse(result.toString());
    console.log("data : ", resultJson, "count: ", (count += 1));
    res.json({
      success: true,
      message: "Hospital data retrieved successfully!",
      data: resultJson,
    });
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};
