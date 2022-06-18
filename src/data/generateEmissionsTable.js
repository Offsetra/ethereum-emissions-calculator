const { time } = require('console');
const fs = require('fs');
const https = require('https');
const Web3 = require('web3');

const web3 = new Web3("infura_id"); //REMOVE PROVIDER
const ETHERSCAN_API_KEY  = 'api_key'



//Download most recent files from Etherscan
//Convert to JSON
//Save to data directory
const gasUsed = require('./export-GasUsed.json') //https://etherscan.io/chart/gasused
const hashrate = require('./export-NetworkHash.json') //https://etherscan.io/chart/hashrate

//Constants
const secondsInDay = 86400;
const kwhPerTerahash = 0.00002;
const emissionsPerKwh = 0.385; //PLACEHOLDER

function blockData(index, UNIXTime, blockNumber) {
    this.index = index
    this.UNIXTime = UNIXTime
    this.blockNumber = blockNumber
}

function emissionData(UNIXTime, blockNumber, emissionFactor) {
    this.UNIXTime = UNIXTime
    this.blockNumber = blockNumber
    this.emissionFactor = emissionFactor
}

const arrayifyCSVData = () => {
    const gasUsedArray = []
    const timestampArray = []
    for (let i=0; i<gasUsed.length; i++){
        gasUsedArray.push(gasUsed[i])
        timestampArray.push(gasUsed[i].UnixTimeStamp)
    }
    return [gasUsedArray, timestampArray]
}

const fetchIndexesFromBlockResolution = async (blockResolution) => {
    
    //Need to arrayify data to identify which is closest
    const [gasUsedArray, timestampArray] = arrayifyCSVData()

    //Use Web3 to find most recent block
    const currentBlock = await web3.eth.getBlockNumber()

    let nextBlock = blockResolution

    let indexArray = []

    for (let i=0; i<currentBlock; i++) {

        if (i%blockResolution === 0){
            nextBlock += blockResolution

            //Find nearest UNIX timestamp within csv data to the input block
            const response = await web3.eth.getBlock(i)
            const goal = response.timestamp

            let closest = timestampArray.reduce(function(prev, curr) {
                return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
            });

            //Find index of closest csv data point
            let index = gasUsedArray.findIndex(x => x.UnixTimeStamp === closest)

            indexArray.push(new blockData(index, gasUsed[index].UnixTimeStamp, i))
        }
    }

    //Append final value from JSON
    finalIndex = gasUsed.length - 1
    indexArray.push(new blockData(finalIndex, gasUsed[finalIndex].UnixTimeStamp, currentBlock))

    return indexArray
}

const fetchIndexesFromDayResolution = async (dayResolution) => {
    let indexArray = []

    for (let i=0; i<gasUsed.length; i++){
        if (i%dayResolution === 0) {
            //Fetch block number
            const timestamp = 1578638524
            const etherscanURL = 'https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=' + timestamp + '&closest=before&apikey=' + ETHERSCAN_API_KEY
            let request = new XMLHttpRequest()
            request.open("GET",etherscanURL).then((res) => {console.log(res)})

            const test = await fetch(etherscanURL)
            const response = await new URL('https://api.etherscan.io/api?module=block&action=getblockreward&blockno=2165403&apikey=4FH13Z3MUQTMNGACU13J4TI6DQIZAGWIZU')
            console.log(response)

            //indexArray.push(new blockData(i, gasUsed[i].UnixTimeStamp, blockNumber))
        }
    }
}

const generateEmissionDataFromIndexArray = async (blockOrDay, blockResolution) => {
    const indexArray = await fetchBlockOrDayIndexArray(blockOrDay, blockResolution)

    valueArray = new Array()

    let timestampArray = []
    let blockArray = []

    for (let i=0; i<indexArray.length - 1; i++){
        console.log(indexArray[i])
        
        let gasUsedArray = []
        let hashrateArray = []

        timestampArray.push(indexArray[i].UNIXTime)
        blockArray.push(indexArray[i].blockNumber)

        const emissionFactor = await calculateEmissionFactor(indexArray, i)
        console.log(emissionFactor)

        valueArray.push(new emissionData(indexArray[i].UNIXTime, indexArray[i].blockNumber, emissionFactor))
    }

    checkAverageEmissionFactor(valueArray)

    saveToJSON(valueArray)
}

const calculateEmissionFactor = async (indexArray, i) => {

    let cumulativeGasUsed = 0
    let cumulativeTerahashes = 0

    for (let j=indexArray[i].index; j<indexArray[i+1].index; j++){
        console.log(j)
        cumulativeGasUsed += (gasUsed[j].Value)
        cumulativeTerahashes += (hashrate[j].Value)*secondsInDay
    }

    const dataRangeLength = indexArray[i+1].index - indexArray[i].index

    console.log(cumulativeGasUsed, cumulativeTerahashes, dataRangeLength)

    //Calculate emissions per gas for the previous data range
    if (dataRangeLength === 0) {
        return 0
    } else {
        const terahashesPerGas = (cumulativeTerahashes / cumulativeGasUsed)/dataRangeLength;
        const emissionsPerTerahash = kwhPerTerahash * emissionsPerKwh;
        const emissionsPerGasTons = emissionsPerTerahash * terahashesPerGas;
        const emissionsPerGasKg = emissionsPerGasTons * 1000;

        return emissionsPerGasKg
    }
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

const saveToJSON = (emissionArray) => {
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

const fetchBlockOrDayIndexArray = async (blockOrDay, resolution) => {
    let result = null

    //Calculate using day or block range and switch function accordingly
    switch (blockOrDay) {
        case 'block':
            result = await fetchIndexesFromBlockResolution(resolution)
            break;
        case 'day':
            result = await fetchIndexesFromDayResolution(resolution)
            break;
        default:
            console.log("Please specify 'block' or 'day'")
            break;
    }
    return result
}



const fetchValuesUsingBlockRange = async (blockResolution) => {
    
    const timestamps = []
    const blocks = []
    const gasArray = []
    const hashrateArray = []
    
    //Create UNIX timestamp array
    
    //Need to arrayify data to identify which is closest
    const [gasUsedArray, timestampArray] = arrayifyCSVData()

    //Use Web3 to find most recent block
    const currentBlock = await web3.eth.getBlockNumber()

    //Specify counts
    let nextIndex = blockResolution
    let count = 0

    //Loop through block ranges
    //THIS LOOP CUTS OFF THE LAST FEW THOUSAND RESULTS
    for (let i=0; i<currentBlock; i+=blockResolution){
        console.log(i)

        //Find nearest UNIX timestamp within csv data to the input block
        const response = await web3.eth.getBlock(i)
        const goal = response.timestamp

        let closest = timestampArray.reduce(function(prev, curr) {
            return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        });
        
        //Find index of closest csv data point
        let index = gasUsedArray.findIndex(x => x.UnixTimeStamp === closest)

        //If statement to prevent empty arrays being added
        if (index !== nextIndex) {
            //Loop through data and push values to subarrays then main arrays
            let gasSubArray = []
            let hashrateSubArray = []

            //Batch values into subarrays 
            for (let j=index; j<nextIndex; j++){
                gasSubArray.push(gasUsed[j].Value)
                hashrateSubArray.push(hashrate[j].Value)
            }

            //Push subarrays into main arrays
            timestamps.push(gasUsed[index].UnixTimeStamp)
            blocks.push(i)
            gasArray.push(gasSubArray)
            hashrateArray.push(hashrateSubArray)
        }
        
        nextIndex += blockResolution
        if (nextIndex > currentBlock){
            nextIndex = currentBlock
        }
        count++

    }
    return [timestamps, blocks, gasArray, hashrateArray]
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





const generateEmissionsJSON2 = async (blockOrDay, resolution) => {
    //Fetch timestamps, gas data and hashrate data for relevant data ranges
    const emissionArray = await fetchBlockOrDayValues(blockOrDay, resolution)

    //Loop through data and calculate emission factor for given data range
    for(let i=0; i<emissionArray.length; i++){
        //Track cumulative values for data range
        cumulativeGasUsed = 0;
        cumulativeTerahashes = 0;

        //Loop through subarray
        for(let j=0; j<emissionArray[i].gasArray.length; j++){
            cumulativeGasUsed += emissionArray[i].gasArray[j];
            cumulativeTerahashes += emissionArray[i].hashrateArray[j] * secondsInDay;
        }

        //Calculate emissions per gas for the previous data range
        const terahashesPerGas = (cumulativeTerahashes / cumulativeGasUsed)/emissionArray[i].gasArray.length;
        const emissionsPerTerahash = kwhPerTerahash * emissionsPerKwh;
        const emissionsPerGasTons = emissionsPerTerahash * terahashesPerGas;
        const emissionsPerGasKg = emissionsPerGasTons * 1000;

        //Push data to array using JSON structure
        emissionArray[i].emissionFactor = emissionsPerGasKg
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

const generateEmissionsJSON = async (blockOrDay, resolution) => {
    //Fetch timestamps, gas data and hashrate data for relevant data ranges
    const result = await fetchBlockOrDayValues(blockOrDay, resolution)

    console.log(result)

    const timestamps = result[0]
    const blocks = result[1]
    const gasUsedArray = result[2]
    const hashrateArray = result[3]

    //Constants
    const secondsInDay = 86400;
    const kwhPerTerahash = 0.00002;
    const emissionsPerKwh = 0.385; //PLACEHOLDER

    //Specify emissionData structure for JSON
    emissionArray = new Array()

    function emissionData(UNIXTime, blockNumber, emissionFactor) {
        this.UNIXTime = UNIXTime
        this.blockNumber = blockNumber
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
        emissionArray.push(new emissionData(timestamps[i], blocks[i], emissionsPerGasKg))
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

generateEmissionDataFromIndexArray('block', 100000)
//fetchIndexesFromDayResolution(30)