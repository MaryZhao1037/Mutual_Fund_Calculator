"use client"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Input } from "~/components/ui/input"
import React, { useState } from 'react';
import { api } from "~/trpc/react";

const BASE_URL = 'https://api.newtonanalytics.com/stock-beta/';
const RISK_FREE_RATE = 0.01; 

const Page = () => {
  const [ticker, setTicker] = useState('');
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState(0);
  const [futureValue, setFutureValue] = useState<number | null>(null);
  const { data: betaData } = api.beta.getBeta.useQuery({ ticker }, { enabled: !!ticker });
  const beta = betaData?.data;
  const { data: marketReturnRateData } = api.observations.getObservationsBySeriesId.useQuery(
    { series_id: 'SP500' },
  );

  const calculateFutureValue = async () => {
    try {
      const observations = marketReturnRateData?.observations || [];
      const firstDayValue = parseFloat(observations[0]?.value || '0');
      const lastDayValue = parseFloat(observations[observations.length - 1]?.value || '0');
      const marketReturnRate = (lastDayValue - firstDayValue) / firstDayValue;

      const rate = RISK_FREE_RATE + beta * (marketReturnRate - RISK_FREE_RATE);
      const futureValue = initialInvestment * Math.exp(rate * timeHorizon);

      setFutureValue(futureValue);
    } catch (error) {
      console.error('Error calculating future value:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 mt-8">
      <div className="flex flex-col items-start space-y-2 w-[300px]">
      <label className="block text-sm font-medium text-gray-700">Mutual Fund Ticker</label>
      <Select onValueChange={setTicker}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Mutual Fund Ticker" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="VSMPX">Vanguard Total Stock Market Index Fund;Institutional Plus (VSMPX)</SelectItem>
          <SelectItem value="FXAIX">Fidelity 500 Index Fund (FXAIX)</SelectItem>
          <SelectItem value="VFIAX">Vanguard 500 Index Fund;Admiral (VFIAX)</SelectItem>
          <SelectItem value="VTSAX">Vanguard Total Stock Market Index Fund;Admiral (VTSAX)</SelectItem>
          <SelectItem value="SPAXX">Fidelity Government Money Market Fund (SPAXX)</SelectItem>
          <SelectItem value="VMFXX">Vanguard Federal Money Market Fund;Investor (VMFXX)</SelectItem>
          <SelectItem value="FDRXX">Fidelity Government Cash Reserves (FDRXX)</SelectItem>
          <SelectItem value="FGTXX">Goldman Sachs FS Government Fund;Institutional (FGTXX)</SelectItem>
          <SelectItem value="SWVXX">Schwab Value Advantage Money Fund;Investor (SWVXX)</SelectItem>
          <SelectItem value="VGTSX">Vanguard Total International Stock Index Fund;Investor (VGTSX)</SelectItem>
          <SelectItem value="VFFSX">Vanguard 500 Index Fund;Institutional Select (VFFSX)</SelectItem>
          <SelectItem value="VIIIX">Vanguard Institutional Index Fund;Inst Plus (VIIIX)</SelectItem>
          <SelectItem value="OGVXX">JPMorgan US Government Money Market Fund;Capital (OGVXX)</SelectItem>
          <SelectItem value="MVRXX">Morgan Stanley Inst Liq Government Port;Institutional (MVRXX)</SelectItem>
          <SelectItem value="VTBNX">Vanguard Total Bond Market II Index Fund;Institutional (VTBNX)</SelectItem>
          <SelectItem value="TFDXX">BlackRock Liquidity FedFund;Institutional (TFDXX)</SelectItem>
          <SelectItem value="FRGXX">Fidelity Instl Government Portfolio;Institutional (FRGXX)</SelectItem>
          <SelectItem value="TTTXX">BlackRock Liquidity Treasury Trust Fund;Institutional (TTTXX)</SelectItem>
          <SelectItem value="AGTHX">American Funds Growth Fund of America;A (AGTHX)</SelectItem>
          <SelectItem value="VTBIX">Vanguard Total Bond Market II Index Fund;Investor (VTBIX)</SelectItem>
          <SelectItem value="GVMXX">State Street US Government Money Market Fund;Prem (GVMXX)</SelectItem>
          <SelectItem value="FCTDX">Fidelity Strategic Advisers Fidelity US Total Stk (FCTDX)</SelectItem>
          <SelectItem value="FCNTX">Fidelity Contrafund (FCNTX)</SelectItem>
          <SelectItem value="VINIX">Vanguard Institutional Index Fund;Institutional (VINIX)</SelectItem>
          <SelectItem value="VMRXX">Vanguard Cash Reserves Federal Money Market Fd;Adm (VMRXX)</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex flex-col items-start space-y-2 w-[300px]">
        <label className="block text-sm font-medium text-gray-700">Initial Investment Amount</label>
        <Input type="number" placeholder="Initial Investment Amount" className="w-full" onChange={(e) => setInitialInvestment(parseFloat(e.target.value))} />
      </div>
      <div className="flex flex-col items-start space-y-2 w-[300px]">
        <label className="block text-sm font-medium text-gray-700">Time Horizon (Years)</label>
        <Input type="number" placeholder="Time Horizon (Years)" className="w-full" onChange={(e) => setTimeHorizon(parseFloat(e.target.value))} />
      </div>
      <Button className="w-[300px]" onClick={calculateFutureValue}>Calculate</Button>
      {futureValue !== null && (
        <div className="mt-4">
          <h2 className="text-lg font-medium">Future Value: ${futureValue.toFixed(2)}</h2>
        </div>
      )}
    </div>
    </div>
)};

export default Page;