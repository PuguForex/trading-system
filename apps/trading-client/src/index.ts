import { loadTrades } from "./services/TradeService";
import { filterTradesBySymbol, processTrades, calculateSummary } from "./services/TradeProcessor";
import { printSummary } from "./utils/ReportPrinter";

async function main(): Promise<void> {
  try {
    const symbol = process.argv[2]; // now first arg is symbol

    const trades = await loadTrades();

    const filtered = filterTradesBySymbol(trades, symbol);

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