import { AddressEmissionsResult, CalculatorOptions } from "./types";
import { filterValidTransactions } from "./utils/filterValidTransactions";
import { getSumGasUsed } from "./utils/getSumGasUsed";
import { getAddressTransactions } from "./utils/getAddressTransactions";
import { validateCalculatorOptions } from "./utils/validateCalculatorOptions";
import { getTransactionEmissions } from "./utils/getTransactionEmissions";
import emissionFactorTable from './data/emissionFactorTable.json';

export type { CalculatorOptions, AddressEmissionsResult };

/**
 * Based on 2021 methodology, see github and carbon.fyi for details.
 * Last updated: June 24, 2021
 */
const KG_CO2_PER_GAS = 0.0001809589427;

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

  const totalEmissions = getTransactionEmissions(filteredTransactions, emissionFactorTable as any);
 
  const gasUsed = getSumGasUsed(filteredTransactions);

  return {
    kgCO2: Math.round(totalEmissions),
    transactionsCount: filteredTransactions.length,
    gasUsed,
    highestBlockNumber: Number(transactions[0]?.blockNumber ?? "0"),
    lowestBlockNumber: Number(
      transactions[transactions.length - 1]?.blockNumber ?? "0"
    ),
    done,
  };
};
