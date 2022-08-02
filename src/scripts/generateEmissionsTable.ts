import fs from "fs";
import Web3 from "web3";

//Download most recent files from Etherscan
//Convert to JSON
//Save to data directory
import gasUsed from "../data/export-GasUsed.json"; //https://etherscan.io/chart/gasused
import hashrate from "../data/export-NetworkHash.json"; //https://etherscan.io/chart/hashrate

const web3 = new Web3(
  "https://mainnet.infura.io/v3/2d2c0dfce81d47a7944bc9a4a31bc2f6"
); //REMOVE PROVIDER
const ETHERSCAN_API_KEY = "UE1T8UCHFVI84KHHE92AT1MSNUYD88V8QG";

//Constants
const secondsInDay = 86400;
const kwhPerTerahash = 0.00002;
const emissionsPerKwh = 0.385; //PLACEHOLDER

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

export const arrayifyCSVData = (gas: networkData[]) => {
  //Convert JSON data to array
  const gasUsedArray: networkData[] = [];
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
  gas: networkData[]
) => {
  console.log("Generating index array at block resolution");
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
        new (blockData as any)(index, gasUsed[index].UnixTimeStamp, i)
      );
    }
  }

  //Append final value from JSON
  const finalIndex = gasUsed.length - 1;
  indexArray.push(
    new (blockData as any)(
      finalIndex,
      gasUsed[finalIndex].UnixTimeStamp,
      currentBlock
    )
  );
  console.log(indexArray);
  return indexArray;
};

export const fetchIndexesFromDayResolution = async (
  dayResolution: number,
  gas: networkData[]
) => {
  let indexArray = [];
  console.log("Generating index array at day resolution");
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
        const res = await fetch(etherscanURL);

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
      indexArray.push(
        new (blockData as any)(i, gas[i].UnixTimeStamp, blockNumber)
      );
    }
  }

  //Push final index to array
  const finalIndex = gasUsed.length - 1;
  const finalTimestamp = gasUsed[finalIndex].UnixTimeStamp;

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
  indexArray.push(
    new (blockData as any)(finalIndex, finalTimestamp, finalBlock)
  );

  return indexArray;
};

const fetchBlockOrDayIndexArray = async (
  blockOrDay: string,
  resolution: number,
  currentBlock: number,
  gas: networkData[]
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
  gas: networkData[],
  hashrate: networkData[]
) => {
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
  gas: networkData[],
  hashrate: networkData[]
) => {
  let cumulativeGasUsed = 0;
  let cumulativeTerahashes = 0;

  //For this data range, add up total gas used and total terahashes
  for (let j = indexArray[i].index; j < indexArray[i + 1].index; j++) {
    cumulativeGasUsed += gas[j].Value;
    cumulativeTerahashes += hashrate[j].Value * secondsInDay;
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
    const emissionsPerGasTons = emissionsPerTerahash * terahashesPerGas;
    const emissionsPerGasKg = emissionsPerGasTons * 1000;

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

// Use Web3 to find most recent block
generateEmissionDataFromIndexArray("block", 100000, gasUsed, hashrate);
// generateEmissionDataFromIndexArray('day', 30)
