import {
  AddressEmissionsResult,
  CalculatorOptions,
  EmissionsFactor,
} from "./types";
import { filterValidTransactions } from "./utils/filterValidTransactions";
import { getAddressTransactions } from "./utils/getAddressTransactions";
import { validateCalculatorOptions } from "./utils/validateCalculatorOptions";
import { getTransactionEmissions } from "./utils/getTransactionEmissions";
import emissionFactorTable from "./data/emissionsFactorTable.json";

export type { CalculatorOptions, AddressEmissionsResult };

export const calculateEmissions = async (
  options: CalculatorOptions
): Promise<AddressEmissionsResult> => {
  validateCalculatorOptions(options);
  const { isContract = false, address } = options;

  const { transactions, done } = await getAddressTransactions(options);

  const filteredTransactions = filterValidTransactions({
    isContract,
    transactions,
    address,
  });

  const [totalEmissions, gasUsed] = getTransactionEmissions(
    filteredTransactions,
    emissionFactorTable as EmissionsFactor[]
  );

  return {
    kgCO2: Number(totalEmissions.toFixed(3)), // nearest gram
    transactionsCount: filteredTransactions.length,
    gasUsed,
    highestBlockNumber: Number(transactions[0]?.blockNumber ?? "0"),
    lowestBlockNumber: Number(
      transactions[transactions.length - 1]?.blockNumber ?? "0"
    ),
    done,
  };
};
