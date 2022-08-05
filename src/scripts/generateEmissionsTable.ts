import fs from "fs";
import Web3 from "web3";
import { EtherscanResponse, TransactionData } from "../types";

let csvToJson = require('convert-csv-to-json');

//import { fetchEtherscanData } from "../utils/fetchEtherscanData";
import { fetchJSON } from "../utils/fetchJSON";

const web3 = new Web3('https://mainnet.infura.io/v3/847555e037034236bf0020e3d9986525'); //REMOVE PROVIDER
const ETHERSCAN_API_KEY = "JTH4MFPK7YAX47QVIGTGK54MTPCYXJV34C";

//Constants
const secondsInDay = 86400;
const kwhPerTerahash = 0.00002;
const emissionsPerKwh = 325; //Based on Kyle Mcdonald's research
const hashEfficiency = 0.4 //Based on Kyle Mcdonald's research

export interface gasData {
  "Date(UTC)": string;
  UnixTimeStamp: number;
  Value: string;
}

export interface networkData {
  "Date(UTC)": string;
  UnixTimeStamp: number;
  Value: number;
}

export interface EtherscanBlockNumberResponse {
  status: "0" | "1";
  message: string;
  result: string;
}

export interface blockDataType {
  index: number;
  UNIXTime: number;
  blockNumber: number;
}

export interface emissionDataType {
  UNIXTime: number;
  blockNumber: number;
  emissionFactor: number;
}

export function blockData(
  this: any,
  index: number,
  UNIXTime: number,
  blockNumber: number
) {
  this.index = index;
  this.UNIXTime = UNIXTime;
  this.blockNumber = blockNumber;
}

function emissionData(
  this: any,
  UNIXTime: number,
  blockNumber: number,
  emissionFactor: number
) {
  this.UNIXTime = UNIXTime;
  this.blockNumber = blockNumber;
  this.emissionFactor = emissionFactor;
}

const CSVtoJSON = (date:string, dataType:string) => {
  let inputFileName = ''
  switch(dataType) {
    case "gas" :
      inputFileName='src/data/export-GasUsed-' + date + '.csv'
      break
    case "hashrate" :
      inputFileName='src/data/export-NetworkHash-' + date + '.csv'
      break
    default:
      break
  }


  let json = (csvToJson.fieldDelimiter(',').getJsonFromCsv(inputFileName))

  //Remove double quotations from output
  let jsonString = JSON.stringify(json)
  jsonString = jsonString.replace(/\\"/g, '')
  //jsonString = jsonString.replace(/""/g, '"')
  json = (JSON.parse(jsonString))
  
  
  return json
}

export const arrayifyCSVData = (gas: gasData[]) => {
  //Convert JSON data to array
  const gasUsedArray: gasData[] = [];
  const timestampArray: number[] = [];
  for (let i = 0; i < gas.length; i++) {
    gasUsedArray.push(gas[i]);
    timestampArray.push(gas[i].UnixTimeStamp);
  }
  return [gasUsedArray, timestampArray];
};

export const findClosest = (goal: number, array: any[]) => {
  let closest = array[0];
  let diff = Math.abs(goal - closest);
  for (let i = 0; i < array.length; i++) {
    let newdiff = Math.abs(goal - array[i]);
    if (newdiff < diff) {
      diff = newdiff;
      closest = array[i];
    }
  }
  return closest;
};

export const fetchIndexesFromBlockResolution = async (
  blockResolution: number,
  currentBlock: number,
  gas: gasData[]
) => {
  console.log("Generating index array using block resolution");
  //Need to arrayify data to identify which is closest
  const [gasUsedArray, timestampArray] = arrayifyCSVData(gas);

  let nextBlock = blockResolution;

  let indexArray = [];

  for (let i = 0; i < currentBlock; i++) {
    if (i % blockResolution === 0) {
      nextBlock += blockResolution;

      //Find nearest UNIX timestamp within csv data to the input block
      const response = await web3.eth.getBlock(i);

      let goal = 0;

      if (typeof response.timestamp === "number") {
        goal = response.timestamp;
      }

      const closest = findClosest(goal, timestampArray);

      /*
            let closest = timestampArray.reduce(function(prev:number, curr:number) {
                return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
            });
            */

      //Find index of closest csv data point
      let index = gasUsedArray.findIndex(
        (x: any) => x.UnixTimeStamp === closest
      );

      indexArray.push(
        new (blockData as any)(index, gas[index].UnixTimeStamp, i)
      );
    }
  }

  //Append final value from JSON
  const finalIndex = gas.length - 1;
  indexArray.push(
    new (blockData as any)(
      finalIndex,
      gas[finalIndex].UnixTimeStamp,
      currentBlock
    )
  );
  return indexArray;
};

export const fetchIndexesFromDayResolution = async (
  dayResolution: number,
  gas: gasData[]
) => {
  let indexArray = [];
  console.log("Generating index array using day resolution");
  //Loop through gas used data
  for (let i = 0; i < gas.length; i++) {
    //If we are at the start of the day range, push that index data to array
    if (i % dayResolution === 0) {
      // Catch any timestamps before block 1
      let UNIXTimestamp = gas[i].UnixTimeStamp;
      if (UNIXTimestamp < 1438270000) {
        UNIXTimestamp = 1438270000;
      }

      // Find block number from timestamp
      // Construct etherscan URL
      const etherscanURL =
        "https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=" +
        UNIXTimestamp +
        "&closest=before&apikey=" +
        ETHERSCAN_API_KEY;

        async function fetchEtherscanData(url: string) {
          const res = await fetch(url);
  
          if (!res.ok) {
            const json = await res.json();
            throw json;
          }
          const data = await res.json();
          return data;
        }

      // Fetch etherscan data
      let response = await fetchJSON<EtherscanBlockNumberResponse>(etherscanURL);

      // Avoid max API call rate
      if (response.status === "0" && response.result === "Max rate limit reached") {
        response = await fetchJSON<EtherscanBlockNumberResponse>(etherscanURL);
      }
      else if (response.status === "0" && response.message === "No transactions found") {
        return [];
      }
      else if (response.status !== "1") {
        throw new Error(`Failed to calculate emissions: ${response.message}`);
      }

      

      // Convert string to int
      const blockNumber = parseInt(response.result);

      // Push index data to array
      indexArray.push(
        new (blockData as any)(i, gas[i].UnixTimeStamp, blockNumber)
      );
    }
  }

  //Push final index to array
  const finalIndex = gas.length - 1;
  const finalTimestamp = gas[finalIndex].UnixTimeStamp;

  const etherscanURL= "https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=" +
  finalTimestamp +
  "&closest=before&apikey=" +
  ETHERSCAN_API_KEY



  //Find final block number
  let response = await fetchJSON<EtherscanBlockNumberResponse>(etherscanURL);

  // Avoid max API call rate
  if (response.status === "0" && response.result === "Max rate limit reached") {
    response = await fetchJSON<EtherscanBlockNumberResponse>(etherscanURL);
  }
  else if (response.status === "0" && response.message === "No transactions found") {
    return [];
  }
  else if (response.status !== "1") {
    throw new Error(`Failed to calculate emissions: ${response.message}`);
  }


  const finalBlock = parseInt(response.result);
  indexArray.push(
    new (blockData as any)(finalIndex, finalTimestamp, finalBlock)
  );

  return indexArray;
};

const fetchBlockOrDayIndexArray = async (
  blockOrDay: string,
  resolution: number,
  currentBlock: number,
  gas: gasData[]
) => {
  let result = [];

  //Calculate using day or block range and switch function accordingly
  switch (blockOrDay) {
    case "block":
      result = await fetchIndexesFromBlockResolution(
        resolution,
        currentBlock,
        gas
      );
      break;
    case "day":
      result = await fetchIndexesFromDayResolution(resolution, gas);
      break;
    default:
      console.log("Please specify 'block' or 'day'");
      break;
  }
  return result;
};

export const generateEmissionDataFromIndexArray = async (
  blockOrDay: string,
  blockResolution: number,
  date:string
) => {
  //Getch gas and network hashrate data
  const gas = CSVtoJSON(date, 'gas')
  const hashrate = CSVtoJSON(date, 'hashrate')
  //Use Web3 to get the most recent block number
  const currentBlock = await getCurrentBlock();

  //Fetch index data for specified data resolution
  const indexArray = await fetchBlockOrDayIndexArray(
    blockOrDay,
    blockResolution,
    currentBlock,
    gas
  );

  let valueArray = new Array();

  //Set up time and block arrays
  let timestampArray = [];
  let blockArray = [];

  //Loop through index data
  for (let i = 0; i < indexArray.length - 1; i++) {
    //Push time and block data to new arrays
    timestampArray.push(indexArray[i].UNIXTime);
    blockArray.push(indexArray[i].blockNumber);

    //Calculate emission factor for each data range
    const emissionFactor = await calculateEmissionFactor(
      indexArray,
      i,
      gas,
      hashrate
    );


    //Push emission data to array
    valueArray.push(
      new (emissionData as any)(
        indexArray[i].UNIXTime,
        indexArray[i].blockNumber,
        emissionFactor
      )
    );
  }

  //Compare calculated average emission factor to hardcoded value
  checkAverageEmissionFactor(valueArray);

  //Save data to JSON file
  saveToJSON(valueArray);
};

export const calculateEmissionFactor = async (
  indexArray: any[],
  i: number,
  gas: gasData[],
  hashrate: networkData[]
) => {
  let cumulativeGasUsed = 0;
  let cumulativeTerahashes = 0;

  //For this data range, add up total gas used and total terahashes
  for (let j = indexArray[i].index; j < indexArray[i + 1].index; j++) {
    cumulativeGasUsed += parseInt(gas[j].Value, 10)
    cumulativeTerahashes += (hashrate[j].Value / hashEfficiency) * secondsInDay;
  }

  const dataRangeLength = indexArray[i + 1].index - indexArray[i].index;

  //Calculate emissions per gas for the previous data range
  if (dataRangeLength === 0) {
    return 0;
  } else {
    //Calcualate emissions per kg
    const terahashesPerGas =
      (cumulativeTerahashes / cumulativeGasUsed) / dataRangeLength;
    const emissionsPerTerahash = kwhPerTerahash * emissionsPerKwh;
    const emissionsPerGasKg = emissionsPerTerahash * terahashesPerGas;

    return emissionsPerGasKg;
  }
};

const checkAverageEmissionFactor = (emissionArray: emissionDataType[]) => {
  const hardcodedEmissionFactor = 0.0001809589427;

  let cumulativeEmissionFactor = 0;

  for (let i = 0; i < emissionArray.length; i++) {
    cumulativeEmissionFactor += emissionArray[i].emissionFactor;
  }

  const averageEmissionFactor = cumulativeEmissionFactor / emissionArray.length;

  console.log("HARD-CODED EMISSION FACTOR = ", hardcodedEmissionFactor);
  console.log("AVERAGE EMISSION FACTOR = ", averageEmissionFactor);
};

const getCurrentBlock = async () => {
  return await web3.eth.getBlockNumber();
};

const saveToJSON = (emissionArray: emissionDataType[]) => {
  //Stringify results prior to saving as JSON
  const data = JSON.stringify(emissionArray);

  //Save emission data to JSON
  fs.writeFile("src/data/emissionFactorTable.json", data, (err) => {
    if (err) {
      throw err;
    }
    console.log("Saved JSON data");
  });
};

//Download most recent files from Etherscan
//Save to data directory
//Update date of data range
//generateEmissionDataFromIndexArray("block", 100000, '08-04-2022');
generateEmissionDataFromIndexArray('day', 30, '08-04-2022')


