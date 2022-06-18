import { TransactionData } from "../types";
import emissionFactorTable from '../../emissionFactorTable.json'

export const getTransactionEmissions = (txns: TransactionData[]) => {
    let totalTransactionEmissions = 0;
    //Loop through all transactions
    for (let i=0; i<txns.length; i++){
        const transactionBlockNumber = parseFloat(txns[i].blockNumber)
        //Find closest block number from JSON
        for (let j=0; j<emissionFactorTable.length; j++){
        if(transactionBlockNumber>emissionFactorTable[j].blockNumber && transactionBlockNumber<emissionFactorTable[j+1].blockNumber){
            //Find transaction emissions by multiplying gas used by transaction by relevant emission factor for that block range
            const transactionEmissions = parseInt(txns[i].gasUsed) * emissionFactorTable[j].emissionFactor
            //Add transaction emissions to total
            totalTransactionEmissions += transactionEmissions
            //Stop the loop for this transaction
            break
        }
        }
    }
  return totalTransactionEmissions
}