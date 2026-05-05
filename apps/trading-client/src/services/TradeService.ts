import { Trade, TradeSchema } from "shared-types";
import { z } from "zod";
import { env } from "config";

function fetchWithTimeout(url: string, timeoutMs: number, options?: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, timeoutMs);

    fetch(url, options)
      .then(res => {
        clearTimeout(timeout);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timeout);
        reject(err);
      });
  });
}

async function fetchWithRetry(url: string, retries = 2, options?: RequestInit): Promise<Response> {
  let lastError: unknown;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, 3000, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

const TradesArraySchema = z.array(TradeSchema);

export async function loadTrades(): Promise<Trade[]> {
  try {
    const response = await fetchWithRetry(`${env.API_URL}/trades`, 2, {
      headers: { 'x-api-key': env.API_KEY },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return TradesArraySchema.parse(data);

  } catch (error) {
    throw new Error(`API load failed: ${(error as Error).message}`, { cause: error });
  }
}