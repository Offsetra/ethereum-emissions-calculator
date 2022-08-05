import { CSVRecord } from "../types";
import { createDailyEmissionsTable } from "./createDailyEmissionsTable";

describe("createDailyEmissionsTable", () => {
  const gasData: CSVRecord[] = [
    {
      "Date(UTC)": "8/1/2022",
      UnixTimeStamp: "1659312000",
      Value: "10000000000",
    },
    {
      "Date(UTC)": "8/2/2022",
      UnixTimeStamp: "1659398400",
      Value: "100000000",
    },
    {
      "Date(UTC)": "8/3/2022",
      UnixTimeStamp: "1659484800",
      Value: "100000",
    },
  ];

  const hashrateData: CSVRecord[] = [
    {
      "Date(UTC)": "8/1/2022",
      UnixTimeStamp: "1659312000",
      Value: "100000",
    },
    {
      "Date(UTC)": "8/2/2022",
      UnixTimeStamp: "1659398400",
      Value: "100000",
    },
    {
      "Date(UTC)": "8/3/2022",
      UnixTimeStamp: "1659484800",
      Value: "100000",
    },
  ];
  test("merges data", async () => {
    const test = createDailyEmissionsTable({
      emissionsPerKwh: 100,
      gasData,
      hashrateData,
      hashEfficiency: 1,
    });
    expect(test).toStrictEqual([
      {
        emissionsFactor: 0.000024,
        timestamp: 1659312000,
      },
      {
        emissionsFactor: 0.0024,
        timestamp: 1659398400,
      },
      {
        emissionsFactor: 2.4,
        timestamp: 1659484800,
      },
    ]);
  });
  test("formats data", async () => {
    const test = createDailyEmissionsTable({
      emissionsPerKwh: 100,
      gasData,
      hashrateData,
      hashEfficiency: 1,
    });
    expect(typeof test[0].emissionsFactor).toStrictEqual("number");
    expect(typeof test[0].timestamp).toStrictEqual("number");
  });
});
