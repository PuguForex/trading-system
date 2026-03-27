import { loadTrades } from "./services/TradeService";
import { processTrades, calculateSummary } from "./services/TradeProcessor";
import { printSummary } from "./utils/ReportPrinter";

async function main(): Promise<void> {
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