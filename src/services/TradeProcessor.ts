import { Trade, TradeResult } from "../models/Trade";
import { Summary } from "../models/Summary";

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