import express from "express";
import cors from "cors";
import { Trade } from "shared-types";
import { env } from "config";

const app = express();
const PORT = env.PORT;

if (!PORT) {
  throw new Error("PORT is not defined in environment variables");
}

app.use(cors()); // ✅ ADD THIS

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