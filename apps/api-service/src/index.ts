import express from "express";
import { Trade } from "shared-types";

const app = express();
const PORT = 3000;

const trades: Trade[] = [
  { symbol: "EURUSD", entry: 1.1, exit: 1.2, volume: 1 },
  { symbol: "GBPUSD", entry: 1.3, exit: 1.25, volume: 2 }
];

app.get("/trades", (req, res) => {
  res.json(trades);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});