"use strict";

import express from "express";
//import mongoose from "mongoose";
import cacheMiddleware from "./middlewares/cacheMiddleware.js";
import * as hospitalController from "./controllers/hospitalController.js";
import { initializeGateways } from "./network/fabricNetwork.js";
import config from "./config/index.js";

const app = express();
const port = 3010;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const startServer = async () => {
  try {
    //await mongoose.connect(config.mongoURI);
    //console.log("MongoDB Connected");

    // Initialize Fabric Network Gateways
    await initializeGateways(config.userIds);

    // Dynamic route setup
    const routes = [
      {
        path: "/getHospitalRole10",
        cacheTime: 5,
        controllerMethod: "getHospitalRole10",
      },
      {
        path: "/getHospitalRole20",
        cacheTime: 5,
        controllerMethod: "getHospitalRole20",
      },
      {
        path: "/getHospitalRole30",
        cacheTime: 5,
        controllerMethod: "getHospitalRole30",
      },
      {
        path: "/getHospitalRole40",
        cacheTime: 5,
        controllerMethod: "getHospitalRole40",
      },
      {
        path: "/getHospitalRole50",
        cacheTime: 5,
        controllerMethod: "getHospitalRole50",
      },
      //{ path: "/fetch-record", controllerMethod: "FetchEHR" },
      { path: "/fetch-all-records", controllerMethod: "FetchAllRecords" },
    ];

    routes.forEach(({ path, cacheTime, controllerMethod }) => {
      app.get(
        path,
        //cacheMiddleware(cacheTime),
        hospitalController[controllerMethod]
      );
    })

    app.post("/uploadEHR", hospitalController.uploadEHR);

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error(`Failed to start the server or connect to MongoDB: ${error}`);
  }
};

startServer();
