import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import axios from "axios";

const YAHOO_FINANCE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

export const yahooFinanceRouter = createTRPCRouter({
  getTrendData: publicProcedure
    .input(
      z.object({
        ticker: z.string(),
        range: z.string().default("6mo"), // Default to 6 months
        interval: z.string().default("1wk"), // Default to weekly data
      })
    )
    .query(async ({ input }) => {
      const { ticker, range, interval } = input;
      const url = `${YAHOO_FINANCE_URL}/${ticker}`;

      try {
        const response = await axios.get(url, {
          params: { range, interval },
        });

        const data = response.data.chart?.result?.[0];

        if (!data) {
          throw new Error("No data returned from Yahoo Finance");
        }

        // Extract timestamps and closing prices
        const timestamps = data.timestamp.map((ts) =>
          new Date(ts * 1000).toISOString().split("T")[0]
        );
        const prices = data.indicators.quote[0].close;

        // Format into an array of { date, price }
        const trendData = timestamps.map((date, index) => ({
          date,
          price: prices[index],
        }));

        return { trend: trendData };
      } catch (error) {
        console.error("Error fetching Yahoo Finance data:", error);
        throw new Error("Failed to fetch trend data");
      }
    }),
});
