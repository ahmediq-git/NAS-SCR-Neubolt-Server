// Define your global state data here
let globalState = {
    latestRickshawTableData : {},
    latestStationTableData : {},
};

// Export functions to get and set the state
module.exports = {
  getState: function () {
    return globalState;
  },
  setState: function (newState) {
    globalState = { ...globalState, ...newState };
  }
};