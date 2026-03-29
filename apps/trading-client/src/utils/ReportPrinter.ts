import { Summary } from "../models/Summary";

export function printSummary(summary: Summary): void {
  console.log("----- Trading Summary -----");
  console.log(`Total Trades : ${summary.totalTrades}`);
  console.log(`Win Rate     : ${summary.winRate.toFixed(2)}%`);
  console.log(`Total Profit : ${summary.totalProfit.toFixed(2)}`);
  console.log(`Total Loss   : ${summary.totalLoss.toFixed(2)}`);
  console.log(`Net Result   : ${summary.net.toFixed(2)}`);
}