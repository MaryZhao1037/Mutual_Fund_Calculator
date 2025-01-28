import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import axios from 'axios';

const BASE_URL = 'https://api.newtonanalytics.com/stock-beta/';

export const betaRouter = createTRPCRouter({
    getBeta: publicProcedure
        .input(
            z.object({
                ticker: z.string(),
            })
        )
        .query(async ({ input }) => {
            const url = `${BASE_URL}?ticker=${input.ticker}&index=^GSPC&interval=1d​&observations=100`;
            try {
                const response = await axios.get(url, {
                    params: {
                        ticker: input.ticker,
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching beta:', error);
                throw new Error('Failed to fetch observations data');
            }
        }),
});