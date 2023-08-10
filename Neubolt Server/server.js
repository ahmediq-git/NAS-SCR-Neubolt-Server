// npm run dev to start the server

// imports
require('dotenv').config(); //for the dotenv
const express = require('express');
// const firebase = require('firebase');

//temporary to test simulation of realtime database, 
//will be removed once BigQuery is connected
const mysql = require('mysql2'); 
let state=require('./state.js'); //for the state

const {
  updateRickshaw
}=require('./models/rickshawModel.js'); //importing the functions

const {
  updateStation
}=require('./models/stationModel.js'); //importing the functions

// constants
const PORT = process.env.PORT || 5000;
const app = express();
const numRickshaws=2
const numStations=1

//locks
let mutexlock=0;


// middleware
app.use(express.json());

//sql conenction details (to be replaced with BigQuery)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root1234',
    database: 'NeuboltDB',
  });

// Connect to the mysql database 
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))


  for (let i = 1; i <= numRickshaws; i++) {
    RetrieveData("RickshawTable", i);
  }

  for (let i=1; i<=numStations; i++) {
    RetrieveData("StationTable", i);

  }
});


// Function to execute queries without expecting a response
function executeQueryNoResponse(query) {
  connection.query(query, (err) => {
    if (err) throw err;
  });
}

// Function to execute queries with expecting a response and saving the data to the their latest state
function executeQueryResponse(query, entityType, entityIdentifier) {
  connection.query(query, (err, results, fields) => {
    if (err) throw err;
    
    const currentState=state.getState();

    // Update the latest state for the specific Rickshaw or Station
    if (entityType === "RickshawTable") {
      currentState.latestRickshawTableData[entityIdentifier]=results;
      state.setState(currentState)
    } else if (entityType === "StationTable") {
      currentState.latestStationTableData[entityIdentifier]=results;
      state.setState(currentState)
    }
    //to avoid race condition and double counting
    mutexlock++;
    if (mutexlock==1) {  
      // Call the update functions
      updateRickshaw();
      updateStation();
  
      // Reset mutexlock to false once both functions are done processing
    }
  });
}

// Function to retrieve data for a specific Rickshaw or Station every 30 seconds
function RetrieveData(entityType, entityIdentifier) {
  const intervalTime = process.env.INTERVAL_TO_POST; // 30 seconds in milliseconds
  setInterval(() => {
    mutexlock=0;
    executeQueryNoResponse(`DROP TABLE IF EXISTS Temp_${entityType}_${entityIdentifier};`);
    executeQueryNoResponse(`CREATE TEMPORARY TABLE Temp_${entityType}_${entityIdentifier} AS (SELECT MAX(Time) as max_t FROM ${entityType}${entityIdentifier});`);
    executeQueryResponse(`SELECT a.* FROM ${entityType}${entityIdentifier} a, Temp_${entityType}_${entityIdentifier} b WHERE a.Time = b.max_t AND a.Time = b.max_t;`, entityType, entityIdentifier);
  }, intervalTime);
}


//sql details ^ will be replaced when BigQuery is connected

