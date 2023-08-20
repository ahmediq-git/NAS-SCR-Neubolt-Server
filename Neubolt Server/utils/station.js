// For stations data is sampled every 10 seconds.

function formatHoursAndMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.ceil(minutes % 60);
    return {hours, remainingMinutes};
  }
  

  function timeToFullCharge(charge) {
    const remainingCharge = 100 - charge; // Calculate remaining charge percentage
    const estimatedMinutes = remainingCharge * 1.2; // Calculate estimated minutes to full charge
    return formatHoursAndMinutes(estimatedMinutes);
}

module.exports = {
    timeToFullCharge
}