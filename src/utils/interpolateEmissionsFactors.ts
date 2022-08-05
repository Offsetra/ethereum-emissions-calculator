import { EmissionsFactor } from "../types";

/**
 * Condense and interpolate the array to the given resolution in days
 * assumes input is ordered by day
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
