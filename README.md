# NAS-SCR-Neubolt-Server and Testing Database creator

This is the Server for Neubolt as well as a testing interface that runs on MySQL. 
The Testing Database creator seeds the records in the csv file, one every second to simulate a real time database.

This MySQL layer can be removed and later replaced with BigQuery

It requires that the create DB 

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
