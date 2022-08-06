/** Return KG CO2 per gas for a given day */
export const calculateEmissionsFactor = (params: {
  dayGasUsed: number;
  /** mh/s */
  dayHashrate: number;
  /** (mh/s)/w */
  hashEfficiency: number;
  /** gco2 */
  emissionsPerKwh: number;
}): number => {
  if (!params.dayGasUsed) return 0;
  const wattConsumption = params.dayHashrate / params.hashEfficiency; // instantaneous consumption of network
  const kilowattConsumption = wattConsumption / 1000; // to kilowatt consumption
  const kwhConsumption = kilowattConsumption * 24; // to total daily kwh consumption
  const kwhPerGas = kwhConsumption / params.dayGasUsed;
  return (kwhPerGas * params.emissionsPerKwh) / 1000;
};
