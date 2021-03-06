import { AddressEmissionsResult, CalculatorOptions } from "./types";
import { filterValidOutgoingTransactions } from "./utils/filterValidOutgoingTransactions";
import { filterValidTransactions } from "./utils/filterValidTransactions";
import { getSumGasUsed } from "./utils/getSumGasUsed";
import { getAddressTransactions } from "./utils/getAddressTransactions";
import { validateCalculatorOptions } from "./utils/validateCalculatorOptions";

export type { CalculatorOptions, AddressEmissionsResult };

/**
 * Based on 2021 methodology, see github and carbon.fyi for details.
 * Last updated: June 24, 2021
 */
const KG_CO2_PER_GAS = 0.0001809589427;

/**
 * Calculate emissions of an address. Emissions are allocated for SENT (outgoing) transactions only.
 */
export const calculateAddressEmissions = async (
  options: CalculatorOptions
): Promise<AddressEmissionsResult> => {
  validateCalculatorOptions(options);
  const { transactions, done } = await getAddressTransactions(options);
  const filteredTxns = filterValidOutgoingTransactions(
    transactions,
    options.address
  );
  const gasUsed = getSumGasUsed(filteredTxns);
  return {
    transactionType: options.transactionType,
    kgCO2: Math.round(gasUsed * KG_CO2_PER_GAS),
    transactionsCount: filteredTxns.length,
    gasUsed,
    highestBlockNumber: Number(transactions[0]?.blockNumber ?? "0"),
    lowestBlockNumber: Number(
      transactions[transactions.length - 1]?.blockNumber ?? "0"
    ),
    done,
  };
};

/**
 * Calculate emissions of a contract address. Emissions are allocated for BOTH outgoing AND incoming transactions.
 */
export const calculateContractEmissions = async (
  options: CalculatorOptions
): Promise<AddressEmissionsResult> => {
  validateCalculatorOptions(options);
  const { transactions, done } = await getAddressTransactions(options);
  const filteredTransactions = filterValidTransactions(transactions);
  const gasUsed = getSumGasUsed(filteredTransactions);
  return {
    transactionType: options.transactionType,
    kgCO2: Math.round(gasUsed * KG_CO2_PER_GAS),
    transactionsCount: filteredTransactions.length,
    gasUsed,
    highestBlockNumber: Number(transactions[0]?.blockNumber ?? "0"),
    lowestBlockNumber: Number(
      transactions[transactions.length - 1]?.blockNumber ?? "0"
    ),
    done,
  };
};
