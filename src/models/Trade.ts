import { z } from "zod";

export const TradeSchema = z.object({
  symbol: z.string(),
  entry: z.number(),
  exit: z.number(),
  volume: z.number()
});

export type Trade = z.infer<typeof TradeSchema>;

export interface TradeResult extends Trade {
  profit: number;
}