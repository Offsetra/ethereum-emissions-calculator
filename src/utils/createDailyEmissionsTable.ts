import { CSVRecord, EmissionsFactor } from "../types";
import { calculateEmissionsFactor } from "./calculateEmissionsFactor";

/** Given an array of daily gasused and hashrates
 * return an array of emissions factors for each day */
export const createDailyEmissionsTable = (params: {
  gasData: CSVRecord[];
  hashrateData: CSVRecord[];
  hashEfficiency: number;
  emissionsPerKwh: number;
}): EmissionsFactor[] =>
  params.hashrateData.map((dayHashrate, index) => {
    const dayGasUsed = params.gasData[index];
    const emissionsFactor = calculateEmissionsFactor({
      dayGasUsed: Number(dayGasUsed.Value),
      dayHashrate: Number(dayHashrate.Value) * 1000, // convert gh/s to mh/s
      hashEfficiency: params.hashEfficiency,
      emissionsPerKwh: params.emissionsPerKwh,
    });
    return {
      timestamp: parseInt(dayHashrate.UnixTimeStamp),
      emissionsFactor: emissionsFactor,
    };
  });
