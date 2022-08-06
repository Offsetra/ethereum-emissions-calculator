import { calculateEmissionsFactor } from "./calculateEmissionsFactor";

describe("calculateEmissionsFactor", () => {
  test("correctly converts to kg co2", async () => {
    // 1000mh/s for the day, at 1 megahash per second per watt = 1000 watt power draw (1.0 kilowatt)
    // 0.024 kilowatt hours per day / 24 gas used = 1kwh per gas
    // 1kwh * 1000g co2 per kwh => 1kg co2
    const result = calculateEmissionsFactor({
      dayGasUsed: 24,
      dayHashrate: 1000,
      emissionsPerKwh: 1000,
      hashEfficiency: 1,
    });
    expect(result).toStrictEqual(1);
  });
  test("handles decimal efficiency and large gas values", async () => {
    const result = calculateEmissionsFactor({
      dayGasUsed: 98123247291,
      dayHashrate: 920522000,
      emissionsPerKwh: 300,
      hashEfficiency: 0.3,
    });
    expect(result).toStrictEqual(0.0002251508038098364);
  });
});
