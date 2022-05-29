const fs = require('fs');

//Download most recent files from Etherscan
//Convert to JSON
//Save to data directory
const gasUsed = require('./export-GasUsed.json') //https://etherscan.io/chart/gasused
const hashrate = require('./export-NetworkHash.json') //https://etherscan.io/chart/hashrate

const generateEmissionsTable = async (resolutionByDays) => {
//Remove hard coding
//const resolutionByDays = 30;
const blockResolution = 1000;

//Constants
const secondsInDay = 86400;
const kwhPerTerahash = 0.00002;
emissionsPerKwh = 0.385; //PLACEHOLDER

emissionArray = new Array()

//Specify emissionData structure for JSON
function emissionData(date, UNIXTime, emissionFactor) {
    this.date = date
    this.UNIXTime = UNIXTime
    this.emissionFactor= emissionFactor
}

//Set count to keep track of progress through specified data range
let count = 0;

//Sum of gas used within the specified data range
let cumulativeGasUsed = 0;
let cumulativeTerahashes = 0;

//Loop through gas data (Gas data should be same length as hashrate data)
for (let i=0; i<gasUsed.length; i++){

    cumulativeGasUsed += gasUsed[i].Value;
    cumulativeTerahashes += hashrate[i].Value * secondsInDay;

    //If we reach end of specified data range
    if(count===resolutionByDays) {
        //Calculate emissions per terahash
        const terahashesPerGas = (cumulativeTerahashes / cumulativeGasUsed)/resolutionByDays;
        const emissionsPerTerahash = kwhPerTerahash * terahashesPerGas
        
        //Save date and emission factor to JSON
        emissionArray.push(new emissionData(gasUsed[i]['Date(UTC)'], gasUsed[i].UnixTimeStamp,emissionsPerTerahash))

        //Set variables to zero for start of new data range
        cumulativeGasUsed = 0;
        cumulativeTerahashes = 0;
        count = 0;
    }
    count++;
}
console.log(emissionArray)
const data = JSON.stringify(emissionArray)

fs.writeFile('emissionFactorTable.json', data, (err) => {
    if (err) {
        throw err;
    }
    console.log("Saved JSON data")
})
}
    
generateEmissionsTable(30)