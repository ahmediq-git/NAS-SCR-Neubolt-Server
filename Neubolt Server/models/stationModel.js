const { db } = require("../config/admin");
let state = require("../state.js"); //for the state
const { timeToFullCharge } = require("../utils/station.js");
const { swapsCalculate } = require("../utils/swaps.js");
const equalise = require("lodash");

async function processRecord(unprocessedRecord, stationID) {
  // Retrieve previous data so certain state variables are not overwritten
  const previousDataReference = db.collection("Station").doc(stationID);

  // Retrieve the previous data
  let previousData = null;

  try {
    const doc = await previousDataReference.get();
    if (doc.exists) {
      previousData = doc.data();
    }
  } catch (error) {
    console.log("Error getting document:", error);
  }

  // Process the unprocessed record
  const stationData = unprocessedRecord;
  let processedData = {};

  // If no data, then return
  if (stationData === null) {
    return processedData;
  }

  let swaps_today = 0;
  let total_swaps = 0;
  let swaps_this_month = 0;
  let past_swaps = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  let batterySlots = {};

  for (let i = 1; i <= 16; i++) {
    batterySlots[i] = {
      batteryID: stationData[`S${i}_B_ID`],
      charge: stationData[`S${i}_B_SoC`],
      temperature: stationData[`S${i}_B_Temp`],
      stateOfHealth: stationData[`S${i}_B_SoH`],
      TimeToFullCharge: timeToFullCharge(stationData[`S${i}_B_SoC`]),
    };
  }

  if (
    !(
      (equalise.isEqual(previousData, {}) !== true) ^
      (equalise.isEqual(previousData, null) === false)
    )
  ) {
    // Process battery slots and calculate swaps
    const newDate = new Date(stationData["Time"]);

    for (let i = 1; i <= 16; i++) {
      previousData = swapsCalculate(
        previousData.batterySlots[i.toString()].batteryID,
        stationData[`S${i}_B_ID`],
        previousData,
        newDate
      );
    }

    // Create the processed data for the station
    swaps_today = previousData.swapsToday;
    total_swaps = previousData.totalSwaps;
    swaps_this_month = previousData.swapsThisMonth;
    past_swaps = previousData.pastSwaps;
  }

  const currentTimeStamp = new Date();
  
  processedData = {
    TimeRecorded: stationData["Time"],
    TimeSavedInDatabase: currentTimeStamp,
    swapsToday: swaps_today,
    swapsThisMonth: swaps_this_month,
    totalSwaps: total_swaps,
    pastSwaps: past_swaps,
    batterySlots,
  };
  return processedData;
}



async function updateStation() {
  const currentState = state.getState();
  const latestStationTableData = currentState.latestStationTableData;

  try {
    // Processes all the Stations in the latestStationTableData object
    for (const StationId in latestStationTableData) {
      const StationData = latestStationTableData[StationId][0];

      if (StationData == null) {
        continue;
      }

      const recordId = StationData.BSS_ID;
      const recordData = await processRecord(
        latestStationTableData[StationId][0],
        recordId
      );

      // Check if the document exists in the collection
      const docRef = db.collection("Station").doc(recordId);
      const docSnapshot = await docRef.get();

      if (docSnapshot.exists) {
        // Document exists, update it with the new data
        await docRef.set(recordData, { merge: true });
        console.log("Document updated with ID: ", recordId);
      } else {
        // Document doesn't exist, add a new document with the given ID
        await docRef.set(recordData);
        console.log("New document added with ID: ", recordId);
      }
    }
  } catch (error) {
    console.error("Error updating or adding records: ", error);
    throw error;
  }
}

module.exports = {
  updateStation,
};
