import { getTransactionEmissions } from "./getTransactionEmissions";
import { EmissionFactors, TransactionData } from "../types";

const transactions = [
    {
      blockNumber: '111',
      from: '0x063dd253c8da4ea9b12105781c9611b8297f5d14',
      to: '0x5abfec25f74cd88437631a7731906932776356f9',
      gasUsed: '2',
      hash: 'duplicate'
    },
    {
      blockNumber: '1',
      from: '0x063dd253c8da4ea9b12105781c9611b8297f5d14',
      to: '0x5abfec25f74cd88437631a7731906932776356f9',
      gasUsed: '3',
      hash: 'test2'
    }
  ]

const emissionFactors: EmissionFactors[] = [
    {"UNIXTime":1438214400,"blockNumber":1,"emissionFactor":0.1},
    {"UNIXTime":1653350400,"blockNumber":14832562,"emissionFactor":0.2}
]

describe("getTransactionEmissions", () => {
    test("returns transaction emissions",async () => {
        const result = await getTransactionEmissions(transactions, emissionFactors)

        expect(result).toBe(0.5)
    })
})