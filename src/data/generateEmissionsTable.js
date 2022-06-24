//const fs = require('fs');
//const https = require('https');
//const Web3 = require('web3');

import fs from 'fs'
import Web3 from 'web3';
import fetch from 'node-fetch';

const web3 = new Web3("infura_id"); //REMOVE PROVIDER
const ETHERSCAN_API_KEY  = 'api_key'

//Download most recent files from Etherscan
//Convert to JSON
//Save to data directory

import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method

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
    //Convert JSON data to array
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
    const finalIndex = gasUsed.length - 1
    indexArray.push(new blockData(finalIndex, gasUsed[finalIndex].UnixTimeStamp, currentBlock))

    return indexArray
}

const fetchIndexesFromDayResolution = async (dayResolution) => {
    let indexArray = []
    
    //Loop through gas used data
    for (let i=0; i<gasUsed.length; i++){
        //If we are at the start of the day range, push that index data to array
        if (i%dayResolution === 0) {
            //Catch any timestamps before block 1
            let UNIXTimestamp = gasUsed[i].UnixTimeStamp
            if (UNIXTimestamp < 1438270000) {
                UNIXTimestamp = 1438270000
            }

            //Find block number from timestamp
            //Construct etherscan URL
            const etherscanURL = 'https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=' + UNIXTimestamp + '&closest=before&apikey=' + ETHERSCAN_API_KEY

            //Fetch etherscan data
            //Unable to import fetchJSON function
            const res = await fetch(etherscanURL);
            if (!res.ok) {
                const json = await res.json();
                throw json;
            }
            const data = await res.json();

            //Convert string to int
            const blockNumber = parseInt(data.result)
            
            //Push index data to array
            indexArray.push(new blockData(i, gasUsed[i].UnixTimeStamp, blockNumber))
        }
    }

    //Push final index to array
    const finalIndex = gasUsed.length-1
    const finalTimestamp = gasUsed[finalIndex].UnixTimeStamp

    //Find final block number
    const res = await fetch('https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=' + finalTimestamp + '&closest=before&apikey=' + ETHERSCAN_API_KEY);
    if (!res.ok) {
        const json = await res.json();
        throw json;
    }
    const data = await res.json();

    const finalBlock = parseInt(data.result)
    indexArray.push(new blockData(finalIndex, finalTimestamp, finalBlock))

    return indexArray
    
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

const generateEmissionDataFromIndexArray = async (blockOrDay, blockResolution) => {
    //Fetch index data for specified data resolution
    const indexArray = await fetchBlockOrDayIndexArray(blockOrDay, blockResolution)

    console.log(gasUsed[-1]['Date(UTC)'])

    let valueArray = new Array()

    //Set up time and block arrays
    let timestampArray = []
    let blockArray = []

    //Loop through index data
    for (let i=0; i<indexArray.length - 1; i++){

        //Push time and block data to new arrays
        timestampArray.push(indexArray[i].UNIXTime)
        blockArray.push(indexArray[i].blockNumber)

        //Calculate emission factor for each data range
        const emissionFactor = await calculateEmissionFactor(indexArray, i)

        //Push emission data to array
        valueArray.push(new emissionData(indexArray[i].UNIXTime, indexArray[i].blockNumber, emissionFactor))
    }

    //Compare calculated average emission factor to hardcoded value
    checkAverageEmissionFactor(valueArray)

    //Save data to JSON file
    saveToJSON(valueArray)
}

const calculateEmissionFactor = async (indexArray, i) => {

    let cumulativeGasUsed = 0
    let cumulativeTerahashes = 0

    //For this data range, add up total gas used and total terahashes
    for (let j=indexArray[i].index; j<indexArray[i+1].index; j++){
        cumulativeGasUsed += (gasUsed[j].Value)
        cumulativeTerahashes += (hashrate[j].Value)*secondsInDay
    }

    const dataRangeLength = indexArray[i+1].index - indexArray[i].index

    //Calculate emissions per gas for the previous data range
    if (dataRangeLength === 0) {
        return 0
    } else {
        //Calcualate emissions per kg
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

generateEmissionDataFromIndexArray('block', 100000)
//generateEmissionDataFromIndexArray('day', 30)