import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import axios from 'axios';
import { config } from 'dotenv';

config();

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.stlouisfed.org/fred';

export const observationsRouter = createTRPCRouter({
  getObservationsBySeriesId: publicProcedure
    .input(
      z.object({
        series_id: z.string().default(""),
      })
    )
    .query(async ({ input }) => {
      const url = `${BASE_URL}/series/observations`;

      try {
        const response = await axios.get(url, {
          params: {
            api_key: API_KEY,
            series_id: input.series_id,
            file_type: 'json',
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching observations data:', error);
        throw new Error('Failed to fetch observations data');
      }
    })
});