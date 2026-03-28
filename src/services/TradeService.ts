import { Trade, TradeSchema } from "../models/Trade";
import { z } from "zod";

const TradesArraySchema = z.array(TradeSchema);

export async function loadTrades(): Promise<Trade[]> {
  try {
    const response = await fetch("http://localhost:3000/trades");

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return TradesArraySchema.parse(data);

  } catch (error) {
    throw new Error(`Failed to load trades from API: ${(error as Error).message}`);
  }
}