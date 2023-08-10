function isNewDay(savedDate, newDate) {

    // Extract the year, month, and day from the new date
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth();
    const newDay = newDate.getDate();
  
    // Extract the year, month, and day from the saved date
    const savedYear = savedDate.getFullYear();
    const savedMonth = savedDate.getMonth();
    const savedDay = savedDate.getDate();
  
    // Compare the year, month, and day components
    if (
      newYear !== savedYear ||
      newMonth !== savedMonth ||
      newDay !== savedDay
    ) {
      return true; // It's a new day
    }
  
    return false; // It's not a new day
  }
  
  function getMonthName(monthIndex) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
  
    return monthNames[monthIndex];
  }
  
  
  function swapsCalculate(previousBatteryId, newBatteryId, previousData, newDate) {
  
    const firebaseTimestamp = previousData.TimeRecorded;
  
    // Get the seconds and nanoseconds from the Firebase timestamp
    const seconds = firebaseTimestamp._seconds;
    const nanoseconds = firebaseTimestamp._nanoseconds;
    const previousTimeStamp = new Date(seconds * 1000 + nanoseconds / 1000000);
  
    // if battery changed then increment swapsToday, totalSwaps and pastSwaps
    if (newBatteryId !== previousBatteryId) {
      previousData.swapsToday += 1;
      previousData.totalSwaps += 1;
      previousData.pastSwaps[getMonthName(previousTimeStamp.getMonth())] += 1;
      previousData.swapsThisMonth =
        previousData.pastSwaps[getMonthName(previousTimeStamp.getMonth())];
    }
  
    // if new day then reset swapsToday
    if (isNewDay(previousTimeStamp, newDate)) {
      previousData.swapsToday = 0;
    }
  
    return previousData;
  }

  module.exports = {
    swapsCalculate
  }