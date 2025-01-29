"use client";

import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const RISK_FREE_RATE = 4.53;

const useBeta = (ticker) => {
  return api.beta.getBeta.useQuery({ ticker }, { enabled: !!ticker });
};

const useYahooTrendData = (ticker) => {
  return api.trend.getTrendData.useQuery(
    { ticker, range: "6mo", interval: "1d" },
    { enabled: !!ticker }
  );
};

const Page = () => {
  const [ticker, setTicker] = useState("");
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState(0);
  const [futureValue, setFutureValue] = useState<number | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);

  // Fetch beta data
  const { data: betaData, isLoading: isBetaLoading, error: betaError } = useBeta(ticker);
  const beta = betaData?.data;

  // Fetch trend data from Yahoo Finance
  const {
    data: yahooTrendData,
    isLoading: isTrendLoading,
    error: trendError,
  } = useYahooTrendData(ticker);

  // Update trend data when fetched
  useEffect(() => {
    if (yahooTrendData?.trend) {
      setTrendData(yahooTrendData.trend);
    }
    console.log(trendData)
  }, [yahooTrendData]);

  // Fetch market return rate
  const { data: marketReturnRateData, isLoading: isMarketLoading, error: marketError } =
    api.observations.getObservationsBySeriesId.useQuery({ series_id: "SP500" });

  const calculateFutureValue = () => {
    if (isBetaLoading || isMarketLoading) {
      console.log("Loading data...");
      return;
    }

    if (betaError || marketError || beta === undefined) {
      console.error("Error fetching beta or market data.");
      return;
    }

    const observations = marketReturnRateData?.observations || [];
    const firstDayValue = parseFloat(observations[0]?.value || "0");
    const lastDayValue = parseFloat(observations[observations.length - 1]?.value || "0");
    const marketReturnRate = (lastDayValue - firstDayValue) / firstDayValue;

    console.log("Market Return Rate:", marketReturnRate);

    const rate = (RISK_FREE_RATE + beta * (marketReturnRate - RISK_FREE_RATE)) / 100;
    const futureValue = initialInvestment * Math.exp(rate * timeHorizon);

    setFutureValue(futureValue);
  };

  return (
    <div>
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
          <SelectItem value="VMFXX">Vanguard Federal Money Market Fund;Investor (VMFXX)</SelectItem>
          <SelectItem value="FGTXX">Goldman Sachs FS Government Fund;Institutional (FGTXX)</SelectItem>
          <SelectItem value="SWVXX">Schwab Value Advantage Money Fund;Investor (SWVXX)</SelectItem>
          <SelectItem value="VGTSX">Vanguard Total International Stock Index Fund;Investor (VGTSX)</SelectItem>
          <SelectItem value="VFFSX">Vanguard 500 Index Fund;Institutional Select (VFFSX)</SelectItem>
          <SelectItem value="VIIIX">Vanguard Institutional Index Fund;Inst Plus (VIIIX)</SelectItem>
          <SelectItem value="MVRXX">Morgan Stanley Inst Liq Government Port;Institutional (MVRXX)</SelectItem>
          <SelectItem value="VTBNX">Vanguard Total Bond Market II Index Fund;Institutional (VTBNX)</SelectItem>
          <SelectItem value="AGTHX">American Funds Growth Fund of America;A (AGTHX)</SelectItem>
          <SelectItem value="VTBIX">Vanguard Total Bond Market II Index Fund;Investor (VTBIX)</SelectItem>
          <SelectItem value="GVMXX">State Street US Government Money Market Fund;Prem (GVMXX)</SelectItem>
          <SelectItem value="FCTDX">Fidelity Strategic Advisers Fidelity US Total Stk (FCTDX)</SelectItem>
          <SelectItem value="FCNTX">Fidelity Contrafund (FCNTX)</SelectItem>
          <SelectItem value="VINIX">Vanguard Institutional Index Fund;Institutional (VINIX)</SelectItem>
          <SelectItem value="VMRXX">Vanguard Cash Reserves Federal Money Market Fd;Adm (VMRXX)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col items-start space-y-2 w-[300px]">
        <label className="block text-sm font-medium text-gray-700">Initial Investment Amount</label>
        <Input
          type="number"
          placeholder="Initial Investment Amount"
          className="w-full"
          onChange={(e) => setInitialInvestment(parseFloat(e.target.value))}
        />
      </div>

      <div className="flex flex-col items-start space-y-2 w-[300px]">
        <label className="block text-sm font-medium text-gray-700">Time Horizon (Years)</label>
        <Input
          type="number"
          placeholder="Time Horizon (Years)"
          className="w-full"
          onChange={(e) => setTimeHorizon(parseFloat(e.target.value))}
        />
      </div>

      <Button className="w-[300px]" onClick={calculateFutureValue} disabled={isBetaLoading || isMarketLoading}>
        {isBetaLoading || isMarketLoading ? "Calculating..." : "Calculate"}
      </Button>

      {futureValue !== null && (
        <div className="mt-4">
          <h2 className="text-lg font-medium">Future Value: ${futureValue.toFixed(2)}</h2>
        </div>
      )}
    </div>
    <div className="m-8">
    <Card>
      <CardHeader>
        <CardTitle>{ticker}</CardTitle>
      </CardHeader>
      <CardContent>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={trendData}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => String(value)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            label={{ value: "Price ($)", angle: -90, position: "insideLeft" }}
          />
          <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
          <Line
            type="natural"
            dataKey="price"
            stroke="#007bff"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
    </div>
    </div>
  );
};

export default Page;
