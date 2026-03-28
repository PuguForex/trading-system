import { Trade, TradeSchema } from "shared-types";

export interface TradeResult extends Trade {
  profit: number;
}