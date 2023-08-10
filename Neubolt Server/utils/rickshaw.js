function treesSaved(distance){
    let carbonSaved = distance * 121; //distance in km multiplied by how much carbon emissions are produced by a regular rickshaw in 1km
    let totalTreesSaved = carbonSaved/45.3592; //how much carbon emissions are curtailed by a tree in a lifetime
    return totalTreesSaved;
}

function formatHoursAndMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return {hours, remainingMinutes};
  }

// Tells how much time is left in the battery
function timeLeft(SoC){
    return formatHoursAndMinutes(SoC*5)
}

function efficiency(){
    return 0;
}

module.exports = {
    treesSaved,
    timeLeft,
    efficiency
}