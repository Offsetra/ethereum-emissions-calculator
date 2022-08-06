import fs from "fs";
import { CSVRecord, EmissionsFactor } from "../types";
import { createDailyEmissionsTable } from "../utils/createDailyEmissionsTable";
import { interpolateEmissionsFactors } from "../utils/interpolateEmissionsFactors";

let csvToJson = require("convert-csv-to-json");

/**
 * gco2 per kwh
 * Rough average from https://kylemcdonald.github.io/ethereum-emissions/
 * */
const GCO2_PER_KWH = 325;
/**
 * MH/s/W
 * Rough mid-point, not including overhead and efficiency multipliers.
 * "hashing efficiency [...] doubled from around 0.17 MH/s/W to 0.44MH/s/W"
 * https://kylemcdonald.github.io/ethereum-emissions/
 */
const HASH_EFFICIENCY = 0.3;

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
    hashEfficiency: HASH_EFFICIENCY,
    emissionsPerKwh: GCO2_PER_KWH,
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
