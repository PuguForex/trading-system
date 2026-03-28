import { promises as fs } from "fs";
import { Trade, TradeSchema } from "../models/Trade";
import { z } from "zod";

const TradesArraySchema = z.array(TradeSchema);

export async function loadTrades(filePath: string): Promise<Trade[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");

    const parsed = JSON.parse(data);

    return TradesArraySchema.parse(parsed);

  } catch (error) {
    throw new Error(`Failed to load trades: ${(error as Error).message}`);
  }
}