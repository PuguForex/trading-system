import { Trade/*, TradeSchema*/ } from "shared-types";
import { TradeResult } from "../models/TradeResult";
import { Summary } from "../models/Summary";

export function filterTradesBySymbol(
  trades: Trade[],
  symbol?: string
): Trade[] {
  if (!symbol) return trades;

  return trades.filter(t => t.symbol === symbol);
}

export function processTrades(trades: Trade[]): TradeResult[] {
  return trades.map(trade => {
    const profit = (trade.exit - trade.entry) * trade.volume;

    return {
      ...trade,
      profit
    };
  });
}

export function calculateSummary(results: TradeResult[]): Summary {
  let totalProfit = 0;
  let totalLoss = 0;
  let wins = 0;

  for (const trade of results) {
    if (trade.profit > 0) {
      totalProfit += trade.profit;
      wins++;
    } else {
      totalLoss += trade.profit;
    }
  }

  const totalTrades = results.length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

  return {
    totalTrades,
    winRate,
    totalProfit,
    totalLoss,
    net: totalProfit + totalLoss
  };
}