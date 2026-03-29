import { describe, it, expect } from "vitest";
import { processTrades, calculateSummary } from "./TradeProcessor";

describe("Trade Processing", () => {

  it("should calculate profit correctly", () => {
    const trades = [
      { symbol: "EURUSD", entry: 1.1, exit: 1.2, volume: 1 }
    ];

    const result = processTrades(trades);

    expect(result[0].profit).toBeCloseTo(0.1);
  });

  it("should calculate summary correctly", () => {
    const results = [
      { symbol: "EURUSD", entry: 1.1, exit: 1.2, volume: 1, profit: 0.1 },
      { symbol: "GBPUSD", entry: 1.3, exit: 1.2, volume: 1, profit: -0.1 }
    ];

    const summary = calculateSummary(results);

    expect(summary.totalTrades).toBe(2);
    expect(summary.winRate).toBe(50);
    expect(summary.net).toBeCloseTo(0);
  });

});