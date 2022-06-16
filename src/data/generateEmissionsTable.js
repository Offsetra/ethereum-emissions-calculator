const fs = require('fs');
//const fetch = require('node-fetch')
const https = require('https');
const Web3 = require('web3');

const web3 = new Web3("infura_id"); //REMOVE PROVIDER

//Download most recent files from Etherscan
//Convert to JSON
//Save to data directory
const gasUsed = require('./export-GasUsed.json') //https://etherscan.io/chart/gasused
const hashrate = require('./export-NetworkHash.json') //https://etherscan.io/chart/hashrate

const arrayifyCSVData = () => {
    const gasUsedArray = []
    const timestampArray = []
    for (let i=0; i<gasUsed.length; i++){
        gasUsedArray.push(gasUsed[i])
        timestampArray.push(gasUsed[i].UnixTimeStamp)
    }
    return [gasUsedArray, timestampArray]
}

const fetchValuesUsingBlockRange = async (blockResolution) => {
    
    const timestamps = []
    const gasArray = []
    const hashrateArray = []
    
    //Create UNIX timestamp array
    
    //Need to arrayify data to identify which is closest
    const [gasUsedArray, timestampArray] = arrayifyCSVData()

    //Use Web3 to find most recent block
    const currentBlock = await web3.eth.getBlockNumber()

    //Specify counts
    let previousIndex = 0
    let count = 0

    //Loop through block ranges
    for (let i=0; i<currentBlock; i+=blockResolution){

        //Find nearest UNIX timestamp within csv data to the input block
        const response = await web3.eth.getBlock(i)
        const goal = response.timestamp

        let closest = timestampArray.reduce(function(prev, curr) {
            return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        });
        
        //Find index of closest csv data point
        let index = gasUsedArray.findIndex(x => x.UnixTimeStamp === closest)

        //If statement to prevent empty arrays being added
        if (previousIndex !== index) {
            //Loop through data and push values to subarrays then main arrays
            let gasSubArray = []
            let hashrateSubArray = []

            //Batch values into subarrays 
            for (let j=previousIndex; j<index; j++){
                gasSubArray.push(gasUsed[j].Value)
                hashrateSubArray.push(hashrate[j].Value)
            }

            //Push subarrays into main arrays
            timestamps.push(gasUsed[index].UnixTimeStamp)
            gasArray.push(gasSubArray)
            hashrateArray.push(hashrateSubArray)
        }
        
        previousIndex = index
        count++

    }
    return [timestamps, gasArray, hashrateArray]
}


const fetchValuesUsingDayRange = async (dayResolution) => {
    //TO_DO: Change from arrays to JSON objects
    const timestamps = []
    const gasArray = []
    const hashrateArray = []

    //Specify subarrays used to keep track of data within given range e.g. [[Block 1-1000], [Block 1001-2000], etc.]
    let gasSubArray = []
    let hashrateSubArray = []

    //Loop through gas and hashrate data
    for (let i=0; i<gasUsed.length; i++){
        //Push data to subarrays
        gasSubArray.push(gasUsed[i].Value)
        hashrateSubArray.push(hashrate[i].Value)

        //Upon end of data range, push data to main arrays, skip first value (i>0)
        if (i%dayResolution === 0 && i>0) {
            gasArray.push(gasSubArray)
            hashrateArray.push(hashrateSubArray)
            timestamps.push(gasUsed[i].UnixTimeStamp)
           
            //Wipe subarrays
            gasSubArray = []
            hashrateSubArray = []
        }
        
    }
    return [timestamps, gasArray, hashrateArray]
}

const fetchBlockOrDayValues = async (blockOrDay, resolution) => {
    //Specify array with 3 params [timpestamp, gasUsed, hashrate]
    let result = [[], [], []]

    //Calculate using day or block range and switch function accordingly
    switch (blockOrDay) {
        case 'block':
            result = fetchValuesUsingBlockRange(resolution)
            break;
        case 'day':
            result = fetchValuesUsingDayRange(resolution)
            break;
        default:
            console.log("Please specify 'block' or 'day'")
            break;
    }
    return result
}

const checkAverageEmissionFactor = (emissionArray) => {
    const hardcodedEmissionFactor = 0.0001809589427;

    let cumulativeEmissionFactor = 0

    for (let i=0; i<emissionArray.length; i++) {
        cumulativeEmissionFactor += emissionArray[i].emissionFactor
    }

    const averageEmissionFactor = cumulativeEmissionFactor/emissionArray.length

    console.log("HARD-CODED EMISSION FACTOR = ", hardcodedEmissionFactor)
    console.log("AVERAGE EMISSION FACTOR = ", averageEmissionFactor)
}

const generateEmissionsJSON = async (blockOrDay, resolution) => {
    //Fetch timestamps, gas data and hashrate data for relevant data ranges
    const result = await fetchBlockOrDayValues(blockOrDay, resolution)

    const timestamps = result[0]
    const gasUsedArray = result[1]
    const hashrateArray = result[2]

    //Constants
    const secondsInDay = 86400;
    const kwhPerTerahash = 0.00002;
    const emissionsPerKwh = 0.385; //PLACEHOLDER

    //Specify emissionData structure for JSON
    emissionArray = new Array()

    function emissionData(UNIXTime, emissionFactor) {
        this.UNIXTime = UNIXTime
        this.emissionFactor= emissionFactor
    }

    //Loop through data and calculate emission factor for given data range
    for(let i=0; i<gasUsedArray.length; i++){
        //Track cumulative values for data range
        cumulativeGasUsed = 0;
        cumulativeTerahashes = 0;

        //Loop through subarray 
        for(let j=0; j<gasUsedArray[i].length; j++){
            cumulativeGasUsed += gasUsedArray[i][j];
            cumulativeTerahashes += hashrateArray[i][j] * secondsInDay;
        }

        //Calculate emissions per gas for the previous data range
        const terahashesPerGas = (cumulativeTerahashes / cumulativeGasUsed)/gasUsedArray[i].length;
        const emissionsPerTerahash = kwhPerTerahash * emissionsPerKwh;
        const emissionsPerGasTons = emissionsPerTerahash * terahashesPerGas;
        const emissionsPerGasKg = emissionsPerGasTons*1000;

        //Push data to array using JSON structure
        emissionArray.push(new emissionData(timestamps[i], emissionsPerGasKg))
    }

    checkAverageEmissionFactor(emissionArray)

    //Stringify results prior to saving as JSON
    const data = JSON.stringify(emissionArray)

    //Save emission data to JSON
    fs.writeFile('emissionFactorTable.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("Saved JSON data")
    })
}

generateEmissionsJSON('block', 100000)
//generateEmissionsJSON('day', 30)
