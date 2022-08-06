import { EmissionsFactor } from "../types";
import { interpolateEmissionsFactors } from "./interpolateEmissionsFactors";

describe("interpolateEmissionsFactors", () => {
  test("resolution 1 changes nothing", () => {
    const dailyEmissionsFactors: EmissionsFactor[] = [
      { emissionsFactor: 0.1, timestamp: 165100000 },
      { emissionsFactor: 0.1, timestamp: 165200000 },
      { emissionsFactor: 0.1, timestamp: 165300000 },
      { emissionsFactor: 0.1, timestamp: 165400000 },
      { emissionsFactor: 0.1, timestamp: 165500000 },
      { emissionsFactor: 0.1, timestamp: 165600000 },
    ];
    const result = interpolateEmissionsFactors({
      dailyEmissionsFactors,
      resolution: 1,
    });
    expect(result.length).toStrictEqual(dailyEmissionsFactors.length);
    expect(result).toStrictEqual(dailyEmissionsFactors);
  });
  test("resolution 2 takes a stable average of every other day", () => {
    const dailyEmissionsFactors: EmissionsFactor[] = [
      { emissionsFactor: 0.1, timestamp: 165100000 },
      { emissionsFactor: 0.3, timestamp: 165200000 },
      { emissionsFactor: 0.1, timestamp: 165300000 },
      { emissionsFactor: 0.3, timestamp: 165400000 },
      { emissionsFactor: 0.1, timestamp: 165500000 },
      { emissionsFactor: 0.3, timestamp: 165600000 },
    ];
    const result = interpolateEmissionsFactors({
      dailyEmissionsFactors,
      resolution: 2,
    });
    expect(result.length).toStrictEqual(dailyEmissionsFactors.length / 2);
    expect(result).toStrictEqual([
      { emissionsFactor: 0.1, timestamp: 165100000 },
      // { emissionsFactor: 0.1, timestamp: 165200000 },
      { emissionsFactor: 0.2, timestamp: 165300000 },
      // { emissionsFactor: 0.1, timestamp: 165400000 },
      { emissionsFactor: 0.2, timestamp: 165500000 },
      // { emissionsFactor: 0.1, timestamp: 165600000 },
    ]);
  });
  test("odd number of days", () => {
    const dailyEmissionsFactors: EmissionsFactor[] = [
      { emissionsFactor: 0.1, timestamp: 165100000 },
      { emissionsFactor: 0.3, timestamp: 165200000 },
      { emissionsFactor: 0.1, timestamp: 165300000 },
      { emissionsFactor: 0.3, timestamp: 165400000 },
      { emissionsFactor: 0.1, timestamp: 165500000 },
      { emissionsFactor: 0.3, timestamp: 165600000 },
      { emissionsFactor: 0.4, timestamp: 165700000 },
    ];
    const result = interpolateEmissionsFactors({
      dailyEmissionsFactors,
      resolution: 2,
    });
    expect(result.length).toStrictEqual(4);
    expect(result).toStrictEqual([
      { emissionsFactor: 0.1, timestamp: 165100000 },
      // { emissionsFactor: 0.1, timestamp: 165200000 },
      { emissionsFactor: 0.2, timestamp: 165300000 },
      // { emissionsFactor: 0.1, timestamp: 165400000 },
      { emissionsFactor: 0.2, timestamp: 165500000 },
      // { emissionsFactor: 0.1, timestamp: 165600000 },\
      { emissionsFactor: 0.2, timestamp: 165700000 },
    ]);
  });
});
