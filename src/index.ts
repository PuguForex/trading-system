import { loadTrades } from "./services/TradeService";
import { filterTradesBySymbol, processTrades, calculateSummary } from "./services/TradeProcessor";
import { printSummary } from "./utils/ReportPrinter";

async function main(): Promise<void> {
  try {
    const filePath = process.argv[2] || "data/trades.json";
    const symbol = process.argv[3]; // NEW

    const trades = await loadTrades(filePath);

    const filtered = filterTradesBySymbol(trades, symbol); // NEW

    if (filtered.length === 0) {
      console.log("No trades found for given symbol");
      return;
    }

    const results = processTrades(filtered);
    const summary = calculateSummary(results);

    printSummary(summary);

  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();