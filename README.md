# NAS-SCR-Neubolt-Server and Testing Database creator

This is the Server for Neubolt as well as a testing interface that runs on MySQL. 
The Testing Database creator seeds the records in the csv file, one every second to simulate a real time database.

We have also included the script that we used to create the CSV files from the vector data provided, and also the script that sorts the CSV files in "EV+BSS Data.zip". This script is then provided to "Create DB Neubolt"

This MySQL layer in the server can be removed and later replaced with BigQuery (in server.js)
(Do note you have to write your own local mysql details in server.js before running it)

It requires that the "Create DB Neubolt" is running simultaneously.

Do note as the "EV+BSS Data.zip" and "Create DB Neubolt.zip" were large files, they are being provided here as zip files and need to be opened before the following steps.

## Installations

### Dependencies


Install the dependencies via:
```
cd "Neubolt Server"
npm install
```
and
```
cd "Create DB Neubolt"
npm install
```

## Usage

### Running the Database creator
```
node realtime.js
```

### Running the Server (Must be run simultaneously with the database creator) 
### The Server will process the raw data and post it on firebase, every 30 seconds (can be changed in the env file)
```
npm start
```
