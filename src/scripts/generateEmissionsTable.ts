import fs from "fs";
import { ethers } from "ethers";

const provider = ethers.getDefaultProvider();

console.log("👌 You are using the default provider.");
console.log(
  "👌 This should work fine, but you may see an API rate limit warning."
);

let csvToJson = require("convert-csv-to-json");

const ETHERSCAN_API_KEY = "etherscan_api_key";

// Constants
const secondsInDay = 86400;
const kwhPerTerahash = 0.00002;
const emissionsPerKwh = 325; //Based on Kyle Mcdonald's research
const hashEfficiency = 0.4; //Based on Kyle Mcdonald's research

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
  index: number,
  UNIXTime: number,
  blockNumber: number
) {
  return {
    index,
    UNIXTime,
    blockNumber,
  };
}

function emissionData(
  UNIXTime: number,
  blockNumber: number,
  emissionFactor: number
) {
  return {
    UNIXTime,
    blockNumber,
    emissionFactor,
  };
}

const getJSONData = (filePrefix: "GasUsed" | "NetworkHash") => {
  let inputFileName = "";
  fs.readdirSync("src/data").forEach((p) => {
    if (p.startsWith(filePrefix)) {
      inputFileName = p;
    }
  });
  if (!inputFileName)
    console.error(
      `❌ Could not find src/data/${filePrefix}-[date].csv - did you name the csv file correctly?`
    );
  const json = csvToJson
    .fieldDelimiter(",")
    .getJsonFromCsv("src/data/" + inputFileName);

  // Remove double quotations from output
  let jsonString = JSON.stringify(json);
  jsonString = jsonString.replace(/\\"/g, "");

  return JSON.parse(jsonString);
};

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

  let indexArray = [];

  for (let i = 0; i < currentBlock; i++) {
    if (i % blockResolution === 0) {
      //Find nearest UNIX timestamp within csv data to the input block
      const response = await provider.getBlock(i);
      console.log("got block number", response.number);
      let goal = 0;

      if (typeof response.timestamp === "number") {
        goal = response.timestamp;
      }

      const closest = findClosest(goal, timestampArray);

      // Find index of closest csv data point
      let index = gasUsedArray.findIndex(
        (x: any) => x.UnixTimeStamp === closest
      );

      const newdata = blockData(index, gas[index].UnixTimeStamp, i);
      indexArray.push(newdata);
    }
  }

  //Append final value from JSON
  const finalIndex = gas.length - 1;
  indexArray.push(
    blockData(finalIndex, gas[finalIndex].UnixTimeStamp, currentBlock)
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

      // Fetch etherscan data
      async function fetchEtherscanData(url: string) {
        const res = await fetch(url);

        if (!res.ok) {
          const json = await res.json();
          throw json;
        }
        const data = await res.json();
        return data;
      }

      let data = await fetchEtherscanData(etherscanURL);

      // Avoid max API call rate
      if (data.status === "0") {
        data = await fetchEtherscanData(etherscanURL);
      }

      // Convert string to int
      const blockNumber = parseInt(data.result);

      // Push index data to array
      indexArray.push(blockData(i, gas[i].UnixTimeStamp, blockNumber));
    }
  }

  //Push final index to array
  const finalIndex = gas.length - 1;
  const finalTimestamp = gas[finalIndex].UnixTimeStamp;

  //Find final block number
  const res = await fetch(
    "https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=" +
      finalTimestamp +
      "&closest=before&apikey=" +
      ETHERSCAN_API_KEY
  );
  if (!res.ok) {
    const json = await res.json();
    throw json;
  }
  const data = await res.json();

  const finalBlock = parseInt(data.result);
  indexArray.push(blockData(finalIndex, finalTimestamp, finalBlock));

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
      throw "Please specify 'block' or 'day'";
  }
  return result;
};

export const generateEmissionDataFromIndexArray = async (
  blockOrDay: string,
  blockResolution: number
) => {
  const date = new Date().toISOString().split("T")[0];
  console.log("Generating new emissions data");
  // Getch gas and network hashrate data
  const gas = getJSONData("GasUsed");
  const hashrate = getJSONData("NetworkHash");
  // Use Web3 to get the number of the most recently mined block
  const currentBlock = await provider.getBlockNumber();

  //Fetch index data for specified data resolution
  const indexArray = await fetchBlockOrDayIndexArray(
    blockOrDay,
    blockResolution,
    currentBlock,
    gas
  );

  let valueArray = new Array();

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
    const newData = emissionData(
      indexArray[i].UNIXTime,
      indexArray[i].blockNumber,
      emissionFactor
    );
    //Push emission data to array
    valueArray.push(newData);
  }

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
    cumulativeGasUsed += parseInt(gas[j].Value, 10);
    cumulativeTerahashes += (hashrate[j].Value / hashEfficiency) * secondsInDay;
  }

  const dataRangeLength = indexArray[i + 1].index - indexArray[i].index;

  //Calculate emissions per gas for the previous data range
  if (dataRangeLength === 0) {
    return 0;
  } else {
    //Calcualate emissions per kg
    const terahashesPerGas =
      cumulativeTerahashes / cumulativeGasUsed / dataRangeLength;
    const emissionsPerTerahash = kwhPerTerahash * emissionsPerKwh;
    const emissionsPerGasKg = emissionsPerTerahash * terahashesPerGas;

    return emissionsPerGasKg;
  }
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
generateEmissionDataFromIndexArray("block", 100000);
// generateEmissionDataFromIndexArray('day', 30)
