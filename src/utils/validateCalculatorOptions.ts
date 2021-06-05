import { CalculatorOptions } from "../types";

export const validateCalculatorOptions = ({
  address,
  etherscanAPIKey,
}: CalculatorOptions) => {
  if (!address) {
    throw new Error("No valid wallet address was provided");
  }
  if (address.length !== 42 || address.slice(0, 2) !== "0x") {
    throw new Error(
      "Invalid address; should be 42 characters long and start with '0x'"
    );
  }
  if (!etherscanAPIKey) {
    throw new Error("No valid Etherscan.io API key was provided");
  }
};
