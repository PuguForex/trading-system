import { loadTrades } from "./services/TradeService";
import { processTrades, calculateSummary } from "./services/TradeProcessor";

type Summary = {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  net: number;
};

function printSummary(summary: Summary) {
  console.log("----- Trading Summary -----");
  console.log(`Total Trades : ${summary.totalTrades}`);
  console.log(`Win Rate     : ${summary.winRate.toFixed(2)}%`);
  console.log(`Total Profit : ${summary.totalProfit.toFixed(2)}`);
  console.log(`Total Loss   : ${summary.totalLoss.toFixed(2)}`);
  console.log(`Net Result   : ${summary.net.toFixed(2)}`);
}

async function main() {
  try {
    const filePath = process.argv[2] || "data/trades.json";

    const trades = await loadTrades(filePath);

    const results = processTrades(trades);
    const summary = calculateSummary(results);

    printSummary(summary);

  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();