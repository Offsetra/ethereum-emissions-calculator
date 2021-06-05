import { AddressEmissionsResult, CalculatorOptions } from "./types";
import { filterValidOutgoingTransactions } from "./utils/filterValidOutgoingTransactions";
import { filterValidTransactions } from "./utils/filterValidTransactions";
import { getSumGasUsed } from "./utils/getSumGasUsed";
import { getTransactions } from "./utils/getTransactions";
import { validateCalculatorOptions } from "./utils/validateCalculatorOptions";

/**
 * Based on 2021 methodology, see github and carbon.fyi for details.
 * Last updated: Mar. 7, 2021
 */
const KG_CO2_PER_GAS = 0.0002873993139;

/**
 * Calculate emissions of an address. Emissions are allocated for SENT (outgoing) transactions only.
 */
export const calculateAddressEmissions = async (
  options: CalculatorOptions
): Promise<AddressEmissionsResult> => {
  validateCalculatorOptions(options);
  const transactions = await getTransactions(options);
  const filteredTransactions = filterValidOutgoingTransactions(
    transactions,
    options.address
  );
  const totalGasUsed = getSumGasUsed(filteredTransactions);
  return {
    transactionType: options.transactionType,
    kgCO2: Math.round(totalGasUsed * KG_CO2_PER_GAS),
    transactionsCount: filteredTransactions.length,
    gasUsed: totalGasUsed,
  };
};

/**
 * Calculate emissions of a contract address. Emissions are allocated for BOTH outgoing AND incoming transactions.
 */
export const calculateContractEmissions = async (
  options: CalculatorOptions
): Promise<AddressEmissionsResult> => {
  validateCalculatorOptions(options);
  const transactions = await getTransactions(options);
  const filteredTransactions = filterValidTransactions(transactions);
  const totalGasUsed = getSumGasUsed(filteredTransactions);
  return {
    transactionType: options.transactionType,
    kgCO2: Math.round(totalGasUsed * KG_CO2_PER_GAS),
    transactionsCount: filteredTransactions.length,
    gasUsed: totalGasUsed,
  };
};
