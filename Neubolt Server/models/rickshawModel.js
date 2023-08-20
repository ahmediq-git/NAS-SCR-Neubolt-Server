const { db } = require("../config/admin");
const { treesSaved, timeLeft, efficiency } = require("../utils/rickshaw.js");
const { swapsCalculate } = require("../utils/swaps.js");
const equalise = require('lodash')
let state = require("../state.js"); //for the state


async function processRecord(unprocessedRecord, rickshawID) {
  // Retrieve previous data so certain state variables are not overwritten
  const previousDataReference = db.collection("Rickshaw").doc(rickshawID);

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
  const rickshawData = unprocessedRecord;
  let processedData = {};

  // If no data, then return
  if (rickshawData === null) {
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

  for (let i = 1; i <= 4; i++) {
    batterySlots[i] = {
      batteryID: rickshawData[`S${i}_B_ID`],
      charge: rickshawData[`S${i}_B_SoC`],
      temperature: rickshawData[`S${i}_B_Temp`],
      stateOfHealth: rickshawData[`S${i}_B_SoH`],
      Time_Left: timeLeft(rickshawData[`S${i}_B_SoC`]),
    };
  }


  if (!(equalise.isEqual(previousData,{}) !== true ^ equalise.isEqual(previousData, null)===false)){
    // Process battery slots and calculate swaps
    const newDate= new Date(rickshawData['Time']);

    for (let i = 1; i <= 4; i++) {
      previousData = swapsCalculate(previousData.batterySlots[i.toString()].batteryID, rickshawData[`S${i}_B_ID`], previousData, newDate);
    }

      // Create the processed data for the rickshaw
      swaps_today = previousData.swapsToday;
      total_swaps = previousData.totalSwaps;
      swaps_this_month = previousData.swapsThisMonth;
      past_swaps = previousData.pastSwaps;

  }

  const currentTimeStamp=new Date();
  const GEAR_RATIO= 6
  const WHEEL_DIAMETER= 19

  const distance= (rickshawData["EV_MCU_Dis"]*WHEEL_DIAMETER)/(GEAR_RATIO*336)

  processedData = {
    TimeRecorded: rickshawData["Time"],
    TimeSavedInDatabase: currentTimeStamp,
    RickshawPlate: "",
    distanceTravelled: Math.floor(distance),
    Efficiency: efficiency(),
    treesSaved: treesSaved(distance),
    Assigned: "",
    swapsToday: swaps_today,
    swapsThisMonth: swaps_this_month,
    totalSwaps: total_swaps,
    pastSwaps: past_swaps,
    batterySlots
  };
  return processedData;
}


async function updateRickshaw() {
  const currentState = state.getState();
  const latestRickshawTableData = currentState.latestRickshawTableData;

  try {
    // Processes all the rickshaws in the latestRickshawTableData object
    for (const rickshawId in latestRickshawTableData) {
      const rickshawData = latestRickshawTableData[rickshawId][0];

      if (rickshawData == null) {
        continue;
      }

      const recordId = rickshawData.EV_ID;
      const recordData = await processRecord(
        latestRickshawTableData[rickshawId][0],
        rickshawData.EV_ID
      );
    
      // Check if the document exists in the collection
      const docRef = db.collection("Rickshaw").doc(recordId);
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
  updateRickshaw,
};
