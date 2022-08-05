import {
  arrayifyCSVData,
  findClosest,
  fetchIndexesFromBlockResolution,
  fetchIndexesFromDayResolution,
  calculateEmissionFactor
} from "./generateEmissionsTable";

const gasJSON = [
  {
    "Date(UTC)": "7/26/2022",
    UnixTimeStamp: 1658793600,
    Value: '5',
  },
  {
    "Date(UTC)": "7/27/2022",
    UnixTimeStamp: 1658880000,
    Value: '10',
  },
];

const hashrateJSON = [
  {
    "Date(UTC)": "7/26/2022",
    UnixTimeStamp: 1658793600,
    Value: 1,
  },
  {
    "Date(UTC)": "7/27/2022",
    UnixTimeStamp: 1658880000,
    Value: 2,
  },
];

const closestArray = [2, 42, 82, 122, 162, 202, 242, 282, 322, 362];
const closestGoal = 100;

const indexArray = [
  { index: 0, UNIXTime: 1584576000, blockNumber: 9700000 },
  { index: 1, UNIXTime: 1585958400, blockNumber: 9800000 },
  { index: 2, UNIXTime: 1587254400, blockNumber: 9900000 },
];

//arrayifyCSVData
describe("arrayifyCSVData", () => {
  test("returns gas and timestamp data in array format", async () => {
    const result = await arrayifyCSVData(gasJSON);

    expect(result).toStrictEqual([
      [
        {
          "Date(UTC)": "7/26/2022",
          UnixTimeStamp: 1658793600,
          Value: "5",
        },
        {
          "Date(UTC)": "7/27/2022",
          UnixTimeStamp: 1658880000,
          Value: "10",
        },
      ],
      [1658793600, 1658880000],
    ]);
  });
});

//findClosest
describe("findClosest", () => {
  test("find the closest value to a specified goal in an array", async () => {
    const closest = findClosest(closestGoal, closestArray);

    expect(closest).toStrictEqual(82);
  });
});

//fetchIndexesFromBlockResolution

describe("fetchIndexesFromBlockResolution", () => {
  test("return data indexes from set gas data and block resolution", async () => {
    const indexArray = await fetchIndexesFromBlockResolution(
      1000000,
      1000000,
      gasJSON
    );

    expect(indexArray).toEqual([
      {
        UNIXTime: 1658793600,
        blockNumber: 0,
        index: 0,
      },
      {
        UNIXTime: 1658880000,
        blockNumber: 1000000,
        index: 1,
      },
    ]);
  });
});

//fetchIndexesFromDayResolution
/*
describe("fetchIndexesFromDayResolution", () => {
  test("return data indexes from set gas data and day resolution", async () => {
    const indexArray = await fetchIndexesFromDayResolution(1000000, gasJSON);

    expect(indexArray).toEqual([
      {
        UNIXTime: 1658793600,
        blockNumber: 0,
        index: 0,
      },
      {
        UNIXTime: 1658880000,
        blockNumber: 1000000,
        index: 1,
      },
    ]);
  });
});
*/

//calculateEmissionFactor
describe("calculateEmissionFactor", () => {
  test("calculate emission factor from set data", async () => {
    const emissionsPerGasKg = await calculateEmissionFactor(
      indexArray,
      1,
      gasJSON,
      hashrateJSON
    );

    expect(emissionsPerGasKg).toEqual(280.8);
  });
});

test("node version", () => {
  // use the node version from your Jest run config:
  expect(process.version).toEqual("v18.7.0");
});
