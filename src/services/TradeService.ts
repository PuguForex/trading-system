import { promises as fs } from "fs";
import { Trade } from "../models/Trade";

function isValidTrade(obj: any): obj is Trade {
  return (
    typeof obj.symbol === "string" &&
    typeof obj.entry === "number" &&
    typeof obj.exit === "number" &&
    typeof obj.volume === "number"
  );
}

function validateTrades(data: any): Trade[] {
  if (!Array.isArray(data)) {
    throw new Error("Invalid data: Expected an array");
  }

  for (const item of data) {
    if (!isValidTrade(item)) {
      throw new Error("Invalid trade object detected");
    }
  }

  return data;
}

export async function loadTrades(filePath: string): Promise<Trade[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");

    const parsed = JSON.parse(data);

    return validateTrades(parsed);

  } catch (error) {
    throw new Error(`Failed to load trades: ${(error as Error).message}`);
  }
}