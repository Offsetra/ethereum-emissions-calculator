import fs from "fs";
import { EmissionsFactor } from "../types";

let csvToJson = require("convert-csv-to-json");

/**
 * gco2 per kwh
 * Rough average from https://kylemcdonald.github.io/ethereum-emissions/
 * */
const emissionsPerKwh = 325;
/**
 * MH/s/W
 * Rough mid-point, not including overhead and efficiency multipliers.
 * "hashing efficiency [...] doubled from around 0.17 MH/s/W to 0.44MH/s/W"
 * https://kylemcdonald.github.io/ethereum-emissions/
 */
const hashEfficiency = 0.3;

interface CSVRecord {
  "Date(UTC)": string;
  UnixTimeStamp: string;
  Value: string;
}

const getJSONData = <T extends "GasUsed" | "NetworkHash">(
  filePrefix: T
): CSVRecord[] => {
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
  return JSON.parse(JSON.stringify(json).replace(/\\"/g, ""));
};

export const calculateEmissionsFactor = (params: {
  dayGasUsed: number;
  dayHashrate: number;
}): number => {
  if (!params.dayGasUsed) return 0;
  const megahashRate = params.dayHashrate * 1000; // convert GH/s to MH/s
  const wattConsumption = megahashRate / hashEfficiency;
  const kilowattConsumption = wattConsumption / 1000;
  const kwhConsumption = kilowattConsumption * 24;
  const kwhPerGas = kwhConsumption / params.dayGasUsed;
  // KG co2 per gas for this day:
  return (kwhPerGas * emissionsPerKwh) / 1000;
};

const saveToJSON = (emissionsFactorTable: EmissionsFactor[]): void => {
  // Stringify results prior to saving as JSON
  const data = JSON.stringify(emissionsFactorTable, undefined, "  ");
  const outputPath = "src/data/emissionsFactorTable.json";
  // Save emission data to JSON
  fs.writeFile(outputPath, data, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Saved JSON data to ${outputPath}`);
  });
};

/** Given an array of daily gasused and hashrates
 * return an array of emissions factors for each day */
export const createDailyEmissionsTable = (params: {
  gasData: CSVRecord[];
  hashrateData: CSVRecord[];
}): EmissionsFactor[] =>
  params.hashrateData.map((dayHashrate, index) => {
    const dayGasUsed = params.gasData[index];
    const emissionsFactor = calculateEmissionsFactor({
      dayGasUsed: Number(dayGasUsed.Value),
      dayHashrate: Number(dayHashrate.Value),
    });
    return {
      timestamp: parseInt(dayHashrate.UnixTimeStamp),
      emissionsFactor: emissionsFactor,
    };
  });

/**
 * Condense and interpolate the array to the given resolution in days
 */
export const interpolateEmissionsFactors = (params: {
  dailyEmissionsFactors: EmissionsFactor[];
  resolution: number;
}): EmissionsFactor[] => {
  const { dailyEmissionsFactors, resolution } = params;
  return dailyEmissionsFactors.reduce<EmissionsFactor[]>((acc, curr, index) => {
    if (index === 0) {
      acc.push({
        timestamp: curr.timestamp,
        emissionsFactor: curr.emissionsFactor,
      });
    } else if (index % resolution === 0) {
      // get the average across last N elements
      const sum = dailyEmissionsFactors
        .slice(index - resolution, index)
        .reduce((a, c) => a + c.emissionsFactor, 0);
      const avg = sum / resolution;
      acc.push({
        timestamp: curr.timestamp,
        emissionsFactor: avg,
      });
    } else if (index === dailyEmissionsFactors.length) {
      // for last element, get the average across remaining elements
      const remainder = index % resolution;
      const sum = dailyEmissionsFactors
        .slice(index - remainder, index)
        .reduce((a, c) => a + c.emissionsFactor, 0);
      const avg = sum / remainder;
      acc.push({
        timestamp: curr.timestamp,
        emissionsFactor: avg,
      });
    }
    return acc;
  }, []);
};

export const generateEmissionsTable = (params: {
  gasData: CSVRecord[];
  hashrateData: CSVRecord[];
  resolution: number;
}) => {
  const { gasData, hashrateData, resolution } = params;
  if (gasData.length !== hashrateData.length) {
    throw new Error(
      "hashrate and gasused csv should have the same number of records."
    );
  }
  const dailyEmissionsFactors = createDailyEmissionsTable({
    gasData,
    hashrateData,
  });
  const data = interpolateEmissionsFactors({
    dailyEmissionsFactors,
    resolution,
  });
  console.log(`Generated ${data.length} records.`);
  saveToJSON(data);
};

const gasData = getJSONData("GasUsed");
const hashrateData = getJSONData("NetworkHash");
generateEmissionsTable({
  gasData,
  hashrateData,
  resolution: 14,
});
